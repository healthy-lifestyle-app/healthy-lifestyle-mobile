import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';

import {
  createWorkout,
  getExerciseOptionsFromWorkouts,
  getWorkouts,
  type ExerciseOption,
  type MobileWorkout,
  type WorkoutTypeLabel,
} from '@/api/activity';
import CreateWorkoutModal from '@/components/exercise/CreateWorkoutModal';
import Screen from '@/components/Screen';

function getWorkoutIcon(type: string): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'HIIT':
      return 'flame';
    case 'Güç':
      return 'barbell';
    case 'Yoga':
      return 'body';
    case 'Kardiyo':
      return 'walk';
    default:
      return 'fitness';
  }
}

function getWorkoutColors(type: string) {
  switch (type) {
    case 'HIIT':
      return {
        cardBg: '#F9E1DA',
        iconBg: '#F7672C',
      };
    case 'Güç':
      return {
        cardBg: '#E9E7F0',
        iconBg: '#5C568E',
      };
    case 'Yoga':
      return {
        cardBg: '#EEF1E0',
        iconBg: '#A8C85A',
      };
    case 'Kardiyo':
      return {
        cardBg: '#FBF2DF',
        iconBg: '#F0D38C',
      };
    default:
      return {
        cardBg: '#F5F2FB',
        iconBg: '#A8C85A',
      };
  }
}

export default function ExerciseScreen() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<MobileWorkout[]>([]);
  const [exerciseOptions, setExerciseOptions] = useState<ExerciseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const quickStartWorkout = workouts[0];

  const loadWorkouts = useCallback(async () => {
    try {
      const [data, options] = await Promise.all([
        getWorkouts(),
        getExerciseOptionsFromWorkouts(),
      ]);
      setWorkouts(data);
      setExerciseOptions(options);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Antrenmanlar alınamadı.';
      Alert.alert('Hata', message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [loadWorkouts]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWorkouts();
  };

  const handleCreateWorkout = async (payload: {
    name: string;
    type: WorkoutTypeLabel;
    estimatedDurationMin?: number;
    estimatedCalories?: number;
    exercises: Array<{
      exerciseId: number;
      orderNo: number;
      durationSec?: number;
      reps?: number;
      sets?: number;
      restSec?: number;
    }>;
  }) => {
    await createWorkout({
      name: payload.name,
      type: payload.type,
      estimatedDurationMin: payload.estimatedDurationMin,
      estimatedCalories: payload.estimatedCalories,
      description: 'Mobil uygulamadan oluşturulan antrenman.',
      color: '#A8C85A',
      icon: 'dumbbell',
      exercises: payload.exercises,
    });
    await loadWorkouts();
  };

  return (
    <Screen backgroundColor="#FCFBFF" contentStyle={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Egzersiz</Text>
            <Text style={styles.subtitle}>Hareket zamanı!</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#A8C85A" />
          </View>
        ) : null}

        {!loading && quickStartWorkout && (
          <TouchableOpacity
            style={styles.quickStartCard}
            activeOpacity={0.9}
            onPress={() =>
              router.push(`/(tabs)/exercise/workout/${quickStartWorkout.id}`)
            }
          >
            <View style={styles.quickStartTop}>
              <View style={styles.quickStartIcon}>
                <Ionicons
                  name={getWorkoutIcon(quickStartWorkout.type)}
                  size={28}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.quickStartTextArea}>
                <Text style={styles.quickStartTitle}>Hızlı Başlat</Text>
                <Text style={styles.quickStartWorkoutName}>
                  {quickStartWorkout.name}
                </Text>
                <Text style={styles.quickStartDescription}>
                  {quickStartWorkout.duration} • {quickStartWorkout.calories} •{' '}
                  {quickStartWorkout.exercises.length} hareket
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.quickStartButton}
              onPress={() =>
                router.push(`/(tabs)/exercise/workout/${quickStartWorkout.id}`)
              }
            >
              <Ionicons name="play" size={18} color="#FFFFFF" />
              <Text style={styles.quickStartButtonText}>Başlat</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Antrenmanlar</Text>

          <TouchableOpacity
            style={styles.newWorkoutButton}
            onPress={() => setIsCreateModalOpen(true)}
            activeOpacity={0.9}
          >
            <Ionicons name="add" size={18} color="#A8C85A" />
            <Text style={styles.newWorkoutButtonText}>
              Yeni Antrenman Oluştur
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.list}>
          {workouts.map((workout) => {
            const colors = getWorkoutColors(workout.type);

            return (
              <TouchableOpacity
                key={workout.id}
                style={[styles.workoutCard, { backgroundColor: colors.cardBg }]}
                activeOpacity={0.92}
                onPress={() =>
                  router.push(`/(tabs)/exercise/workout/${workout.id}`)
                }
              >
                <View
                  style={[styles.iconBox, { backgroundColor: colors.iconBg }]}
                >
                  <Ionicons
                    name={getWorkoutIcon(workout.type)}
                    size={28}
                    color="#FFFFFF"
                  />
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.workoutName}>{workout.name}</Text>

                    {workout.isFavorite ? (
                      <Ionicons name="heart" size={20} color="#F7672C" />
                    ) : null}
                  </View>

                  <View style={styles.badgeRow}>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>{workout.type}</Text>
                    </View>

                    <View
                      style={[
                        styles.difficultyBadge,
                        workout.difficulty === 'Kolay'
                          ? styles.easyBadge
                          : workout.difficulty === 'Orta'
                            ? styles.mediumBadge
                            : styles.hardBadge,
                      ]}
                    >
                      <Text style={styles.difficultyBadgeText}>
                        {workout.difficulty}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.workoutMeta}>
                    {workout.duration} • {workout.calories} •{' '}
                    {workout.exercises.length} hareket
                  </Text>

                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={() =>
                      router.push(`/(tabs)/exercise/workout/${workout.id}`)
                    }
                  >
                    <Ionicons name="play" size={18} color="#FFFFFF" />
                    <Text style={styles.startButtonText}>Görüntüle</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <CreateWorkoutModal
        visible={isCreateModalOpen}
        exerciseOptions={exerciseOptions}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateWorkout}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FCFBFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FCFBFF',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  loadingWrap: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#5C568E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  quickStartCard: {
    backgroundColor: '#F5F2FB',
    borderRadius: 28,
    padding: 20,
    marginBottom: 28,
  },
  quickStartTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  quickStartIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#A8C85A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  quickStartTextArea: {
    flex: 1,
  },
  quickStartTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#5C568E',
    marginBottom: 6,
  },
  quickStartWorkoutName: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  quickStartDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: '#4B5563',
  },
  quickStartButton: {
    height: 52,
    borderRadius: 18,
    backgroundColor: '#A8C85A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  quickStartButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  newWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EEF1E0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  newWorkoutButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#A8C85A',
  },
  list: {
    marginBottom: 12,
  },
  workoutCard: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  workoutName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  typeBadge: {
    backgroundColor: '#F3F1FA',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  typeBadgeText: {
    color: '#5C568E',
    fontSize: 12,
    fontWeight: '700',
  },
  difficultyBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  easyBadge: {
    backgroundColor: '#4CAF50',
  },
  mediumBadge: {
    backgroundColor: '#FF9800',
  },
  hardBadge: {
    backgroundColor: '#F44336',
  },
  difficultyBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  workoutMeta: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 12,
  },
  startButton: {
    height: 44,
    borderRadius: 14,
    backgroundColor: '#A8C85A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});