import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { exerciseData } from '@/data/exerciseData';
import ExerciseAnimation from '@/components/exercise/ExerciseAnimation';
import Screen from '@/components/Screen';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const exerciseId = Array.isArray(id) ? id[0] : id;
  const exercise = exerciseData.find((item) => item.id === exerciseId);

  if (!exercise) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Egzersiz bulunamadı</Text>

        <TouchableOpacity
          style={styles.notFoundButton}
          onPress={() => router.back()}
        >
          <Text style={styles.notFoundButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const difficultyColor =
    exercise.difficulty === 'Kolay'
      ? '#4CAF50'
      : exercise.difficulty === 'Orta'
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
            animationKey={exercise.animationKey}
            backgroundColor="#F9E8E2"
            height={280}
          />

        <Text style={styles.title}>{exercise.name}</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Zorluk Seviyesi</Text>
              <Text style={[styles.infoValue, { color: difficultyColor }]}>
                {exercise.difficulty}
              </Text>
            </View>

            {!!exercise.duration && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Süre</Text>
                <Text style={styles.infoValue}>{exercise.duration}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Açıklama</Text>
          <Text style={styles.description}>{exercise.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İpuçları</Text>

          {exercise.tips.map((tip, index) => (
            <View key={`${exercise.id}-tip-${index}`} style={styles.tipRow}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push(`/(tabs)/exercise/session-exercise/${exercise.id}`)}
          >
            <Text style={styles.startButtonText}>Egzersizi Başlat</Text>
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
    marginBottom: 18,
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
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
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
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingRight: 8,
  },
  tipBullet: {
    fontSize: 16,
    color: '#A8C85A',
    marginRight: 8,
    lineHeight: 22,
    fontWeight: '800',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: '#4B5563',
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