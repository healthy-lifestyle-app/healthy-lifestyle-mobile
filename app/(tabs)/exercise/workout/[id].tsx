// app/(tabs)/exercise/workout/[id].tsx

import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import ExerciseAnimation from '@/components/exercise/ExerciseAnimation';
import { getWorkoutById, type MobileWorkout } from '@/api/activity';
import Screen from '@/components/Screen';

const C = {
  bg: '#FCFBFF',
  card: '#FFFFFF',
  text: '#111827',
  muted: '#6B7280',
  primary: '#A8C85A',
  primarySoft: '#EEF7D8',
  purple: '#5C568E',
  purpleSoft: '#F3F1FA',
  orange: '#F7672C',
  orangeSoft: '#FDE8DF',
  border: '#ECEEF4',
};

function getDifficultyColor(difficulty: string) {
  if (difficulty === 'Kolay') return '#45B24A';
  if (difficulty === 'Orta') return '#FF9800';
  return '#F44336';
}

function getTypeIcon(type: string): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'HIIT':
      return 'flame';
    case 'Güç':
      return 'barbell';
    case 'Yoga':
      return 'leaf';
    case 'Kardiyo':
      return 'heart';
    default:
      return 'fitness';
  }
}

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const workoutId = Array.isArray(id) ? id[0] : id;
  const [workout, setWorkout] = useState<MobileWorkout | null>(null);
  const [loading, setLoading] = useState(true);

  const loadWorkout = useCallback(async () => {
    if (!workoutId) return;

    try {
      const data = await getWorkoutById(workoutId);
      setWorkout(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Antrenman alınamadı.';
      Alert.alert('Hata', message);
      setWorkout(null);
    } finally {
      setLoading(false);
    }
  }, [workoutId]);

  useFocusEffect(
    useCallback(() => {
      loadWorkout();
    }, [loadWorkout]),
  );

  if (loading) {
    return (
      <Screen
        backgroundColor={C.bg}
        contentStyle={styles.notFoundContainer}
        edges={['top']}
      >
        <ActivityIndicator size="large" color={C.primary} />
      </Screen>
    );
  }

  if (!workout) {
    return (
      <Screen
        backgroundColor={C.bg}
        contentStyle={styles.notFoundContainer}
        edges={['top']}
      >
        <Text style={styles.notFoundText}>Antrenman bulunamadı</Text>

        <TouchableOpacity
          style={styles.notFoundButton}
          onPress={() => router.back()}
          activeOpacity={0.9}
        >
          <Text style={styles.notFoundButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </Screen>
    );
  }

  const difficultyColor = getDifficultyColor(workout.difficulty);

  return (
    <Screen backgroundColor={C.bg} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <ExerciseAnimation
            animationKey={undefined}
            backgroundColor="#F7EFEA"
            height={230}
          />

          <View style={styles.heroActions}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.roundIconButton}
              activeOpacity={0.85}
            >
              <Ionicons name="arrow-back" size={22} color={C.text} />
            </TouchableOpacity>

            <View style={styles.rightHeroActions}>
              <TouchableOpacity
                style={styles.roundIconButton}
                activeOpacity={0.85}
              >
                <Ionicons name="heart-outline" size={21} color={C.text} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.roundIconButton}
                activeOpacity={0.85}
              >
                <Ionicons name="share-social-outline" size={21} color={C.text} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.heroPlayButton}
            activeOpacity={0.9}
            onPress={() => router.push(`/(tabs)/exercise/session/${workout.id}`)}
          >
            <Ionicons name="play" size={28} color={C.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{workout.name}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <Ionicons
                name={getTypeIcon(workout.type)}
                size={14}
                color={C.purple}
              />
              <Text style={styles.typeBadgeText}>{workout.type}</Text>
            </View>

            <View
              style={[
                styles.difficultyBadge,
                { backgroundColor: difficultyColor },
              ]}
            >
              <Text style={styles.difficultyBadgeText}>
                {workout.difficulty}
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <View style={styles.infoIconWrap}>
                <Ionicons name="time-outline" size={20} color={C.purple} />
              </View>
              <Text style={styles.infoLabel}>Süre</Text>
              <Text style={styles.infoValue}>{workout.duration}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <View style={[styles.infoIconWrap, styles.calorieIconWrap]}>
                <Ionicons name="flame" size={20} color={C.orange} />
              </View>
              <Text style={styles.infoLabel}>Kalori</Text>
              <Text style={styles.infoValue}>{workout.calories}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <View style={[styles.infoIconWrap, styles.exerciseIconWrap]}>
                <Ionicons name="walk" size={20} color={C.primary} />
              </View>
              <Text style={styles.infoLabel}>Hareket</Text>
              <Text style={styles.infoValue}>{workout.exercises.length}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Açıklama</Text>
            <Text style={styles.description}>
              {workout.description || 'Bu antrenman için açıklama eklenmemiş.'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Antrenman İçeriği</Text>

            {workout.exercises.map((item) => (
              <TouchableOpacity
                key={`${workout.id}-${item.id}-${item.orderNo}`}
                style={styles.exerciseRow}
                activeOpacity={0.9}
              >
                <View style={styles.exerciseOrder}>
                  <Text style={styles.exerciseOrderText}>{item.orderNo}</Text>
                </View>

                <View style={styles.exerciseTextArea}>
                  <Text style={styles.exerciseName} numberOfLines={1}>
                    {item.exercise.name}
                  </Text>
                  <Text style={styles.exerciseMeta}>
                    {item.durationSec ?? item.exercise.defaultDurationSec ?? 30}{' '}
                    sn • {item.exercise.difficulty}
                  </Text>
                </View>

                <View style={styles.exerciseMiniIcon}>
                  <Ionicons name="walk-outline" size={18} color={C.primary} />
                </View>

                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => router.push(`/(tabs)/exercise/session/${workout.id}`)}
          activeOpacity={0.92}
        >
          <Ionicons name="play" size={18} color="#FFFFFF" />
          <Text style={styles.startButtonText}>Antrenmanı Başlat</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollContent: {
    paddingBottom: 114,
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 8,
    height: 246,
    borderRadius: 28,
    backgroundColor: '#F7EFEA',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFE4DE',
  },
  heroActions: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rightHeroActions: {
    flexDirection: 'row',
    gap: 10,
  },
  roundIconButton: {
    width: 44,
    height: 44,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  heroPlayButton: {
    position: 'absolute',
    alignSelf: 'center',
    top: 94,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: 'rgba(255, 255, 255, 0.55)',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    color: C.text,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  typeBadge: {
    backgroundColor: C.purpleSoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadgeText: {
    color: C.purple,
    fontSize: 13,
    fontWeight: '800',
  },
  difficultyBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  difficultyBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  infoCard: {
    backgroundColor: C.card,
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 10,
    marginBottom: 18,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: C.border,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: C.purpleSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  calorieIconWrap: {
    backgroundColor: C.orangeSoft,
  },
  exerciseIconWrap: {
    backgroundColor: C.primarySoft,
  },
  infoLabel: {
    fontSize: 12,
    color: C.muted,
    marginBottom: 4,
    fontWeight: '700',
    textAlign: 'center',
  },
  infoValue: {
    fontSize: 17,
    fontWeight: '900',
    color: C.text,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: C.border,
    marginVertical: 8,
  },
  section: {
    backgroundColor: C.card,
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: C.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
    fontWeight: '500',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  exerciseOrder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exerciseOrderText: {
    fontSize: 14,
    fontWeight: '900',
    color: C.primary,
  },
  exerciseTextArea: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '800',
    color: C.text,
    marginBottom: 4,
  },
  exerciseMeta: {
    fontSize: 13,
    color: C.muted,
    fontWeight: '600',
  },
  exerciseMiniIcon: {
    width: 34,
    height: 34,
    borderRadius: 14,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: 'rgba(252, 251, 255, 0.96)',
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  startButton: {
    backgroundColor: C.primary,
    height: 58,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '900',
  },
  notFoundContainer: {
    flex: 1,
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: '800',
    color: C.text,
    marginBottom: 16,
  },
  notFoundButton: {
    backgroundColor: C.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  notFoundButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});