import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import LottieView from 'lottie-react-native';
import Lottie from 'lottie-react';

export type ExerciseAnimationKey =
  | 'jumping-jack'
  | 'high-knees'
  | 'plank'
  | 'squat';

const animationMap = {
  'jumping-jack': require('../../assets/animations/exercises/jumping-jack.json'),
  'high-knees': require('../../assets/animations/exercises/high-knees.json'),
  plank: require('../../assets/animations/exercises/plank.json'),
  squat: require('../../assets/animations/exercises/squat.json'),
} as const;

interface ExerciseAnimationProps {
  animationKey?: ExerciseAnimationKey;
  backgroundColor?: string;
  height?: number;
}

export default function ExerciseAnimation({
  animationKey,
  backgroundColor = '#F9E8E2',
  height = 260,
}: ExerciseAnimationProps) {
  if (!animationKey) {
    return (
      <View style={[styles.placeholder, { backgroundColor, height }]}>
        <Text style={styles.placeholderTitle}>Animasyon bulunamadı</Text>
      </View>
    );
  }

  const source = animationMap[animationKey];

  if (!source) {
    return (
      <View style={[styles.placeholder, { backgroundColor, height }]}>
        <Text style={styles.placeholderTitle}>Animasyon bulunamadı</Text>
        <Text style={styles.placeholderSubtitle}>{animationKey}</Text>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { backgroundColor, height }]}>
        <Lottie
          animationData={source}
          loop
          autoplay
          style={styles.webAnimation}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor, height }]}>
      <LottieView source={source} autoPlay loop style={styles.animation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  webAnimation: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F7672C',
    marginBottom: 6,
    textAlign: 'center',
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: '#7C7C7C',
    textAlign: 'center',
  },
});