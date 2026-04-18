import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import ExerciseAnimation from './ExerciseAnimation';
import type { ExerciseAnimationKey } from './ExerciseAnimation';

interface ExerciseCardProps {
  id: string;
  name: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  duration: string;
  animationKey: ExerciseAnimationKey;
}

export default function ExerciseCard({
  id,
  name,
  difficulty,
  duration,
  animationKey,
}: ExerciseCardProps) {
  const router = useRouter();

  const difficultyColor =
    {
      Kolay: '#4CAF50',
      Orta: '#FF9800',
      Zor: '#F44336',
    }[difficulty] || '#999999';

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(tabs)/exercise/${id}`)}
      style={styles.card}
      activeOpacity={0.9}
    >
      <View style={styles.animationContainer}>
        <ExerciseAnimation
          animationKey={animationKey}
          backgroundColor="#F9E8E2"
          height={120}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>

        <View style={styles.meta}>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: difficultyColor },
            ]}
          >
            <Text style={styles.difficultyText}>{difficulty}</Text>
          </View>

          <Text style={styles.duration}>{duration}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },
  animationContainer: {
    width: 120,
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 10,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  duration: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
});