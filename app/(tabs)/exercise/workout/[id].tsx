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
      const message = error instanceof Error ? error.message : 'Antrenman alınamadı.';
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
      <Screen backgroundColor="#FCFBFF" contentStyle={styles.notFoundContainer} edges={['top']}>
        <ActivityIndicator size="large" color="#A8C85A" />
      </Screen>
    );
  }

  if (!workout) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Antrenman bulunamadı</Text>
        <TouchableOpacity style={styles.notFoundButton} onPress={() => router.back()}>
          <Text style={styles.notFoundButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const difficultyColor =
    workout.difficulty === 'Kolay'
      ? '#4CAF50'
      : workout.difficulty === 'Orta'
        ? '#FF9800'
        : '#F44336';

  return (
    <Screen backgroundColor="#FCFBFF" edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#5C568E" />
          <Text style={styles.backButtonText}>Geri</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <ExerciseAnimation
            animationKey={undefined}
            backgroundColor="#F9E8E2"
            height={280}
          />

        <Text style={styles.title}>{workout.name}</Text>

        <View style={styles.badgeRow}>
          <View style={styles.typeBadge}>
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
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Süre</Text>
              <Text style={styles.infoValue}>{workout.duration}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Kalori</Text>
              <Text style={styles.infoValue}>{workout.calories}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Hareket</Text>
              <Text style={styles.infoValue}>{workout.exercises.length}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Açıklama</Text>
          <Text style={styles.description}>{workout.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Antrenman İçeriği</Text>

          {workout.exercises.map((item) => {
            return (
              <TouchableOpacity
                key={`${workout.id}-${item.id}-${item.orderNo}`}
                style={styles.exerciseRow}
                activeOpacity={0.9}
              >
                <View style={styles.exerciseOrder}>
                  <Text style={styles.exerciseOrderText}>{item.orderNo}</Text>
                </View>

                <View style={styles.exerciseTextArea}>
                  <Text style={styles.exerciseName}>{item.exercise.name}</Text>
                  <Text style={styles.exerciseMeta}>
                    {(item.durationSec ?? item.exercise.defaultDurationSec ?? 30)} sn • {item.exercise.difficulty}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            );
          })}
        </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push(`/(tabs)/exercise/session/${workout.id}`)}
          >
            <Text style={styles.startButtonText}>Antrenmanı Başlat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFBFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  backButton: {
    marginTop: 12,
    marginLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5C568E',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  typeBadge: {
    backgroundColor: '#F3F1FA',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  typeBadgeText: {
    color: '#5C568E',
    fontSize: 13,
    fontWeight: '700',
  },
  difficultyBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  difficultyBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#F5F2FB',
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
    fontWeight: '500',
    textAlign: 'center',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  exerciseOrder: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EEF1E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exerciseOrderText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#A8C85A',
  },
  exerciseTextArea: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  exerciseMeta: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#A8C85A',
    paddingVertical: 18,
    borderRadius: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  startButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '800',
  },
  notFoundContainer: {
    flex: 1,
    backgroundColor: '#FCFBFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  notFoundButton: {
    backgroundColor: '#A8C85A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  notFoundButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});