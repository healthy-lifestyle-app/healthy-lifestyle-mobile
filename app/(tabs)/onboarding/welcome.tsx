import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Screen from '@/components/Screen';

const COLORS = {
  background: '#F8F6EC',
  text: '#1F2430',
  muted: '#7E8695',
  green: '#A8C85A',
  greenSoft: '#EEF5DE',
  card: '#FFFFFF',
  border: '#E6E2F0',
};

export default function Welcome() {
  return (
    <Screen backgroundColor={COLORS.background} contentStyle={styles.screen} edges={['top']}>
      <View style={styles.hero}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>🌿</Text>
        </View>

        <Text style={styles.title}>Hoş Geldin!</Text>
        <Text style={styles.subtitle}>
          Sağlıklı yaşam yolculuğuna başlamak{'\n'}için seni daha iyi tanıyalım
        </Text>

        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      <Pressable onPress={() => router.push('/onboarding/profile')} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Devam et ›</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: COLORS.greenSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  icon: {
    fontSize: 34,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 280,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: 'rgba(31,36,48,0.18)',
  },
  dotActive: {
    backgroundColor: COLORS.green,
  },
  primaryButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    marginBottom: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});