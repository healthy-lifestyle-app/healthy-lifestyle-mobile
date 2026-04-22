import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/button';
import Screen from '@/components/Screen';
import { setOnboardingDone } from '@/lib/storage';

type Goal = {
  key: string;
  label: string;
  icon: string;
  bgColor: string;
  iconBg: string;
  textColor?: string;
};

const GOALS: Goal[] = [
  {
    key: "healthy",
    label: "Sağlıklı yaşam",
    icon: "♡",
    bgColor: "#C7DC78",
    iconBg: "#EEF5D6",
    textColor: "#FFFFFF",
  },
  {
    key: "lose",
    label: "Kilo Vermek",
    icon: "🥗",
    bgColor: "#F4E3C3",
    iconBg: "#F9EFE0",
    textColor: "#5B5B5B",
  },
  {
    key: "gain",
    label: "Kilo Almak",
    icon: "◎",
    bgColor: "#E7E0F7",
    iconBg: "#F1ECFB",
    textColor: "#6A6680",
  },
  {
    key: "maintain",
    label: "Formumu Korumak",
    icon: "✧",
    bgColor: "#8D81C9",
    iconBg: "#B3A8E4",
    textColor: "#FFFFFF",
  },
];

export default function Goals() {
  const [selected, setSelected] = useState<string[]>([]);

  const canFinish = selected.length > 0;

  const toggle = (key: string) => {
  setSelected((prev) =>
    prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
  );
};

const handleFinish = async () => {
  await setOnboardingDone();
  router.replace('/(tabs)/home');
};

  return (
    <Screen backgroundColor="#F8F6EC" edges={['top']}>
      <View style={styles.screen}>
        <View>
          <Text style={styles.title}>Hedefin ne?</Text>
          <Text style={styles.subtitle}>Birlikte çalışalım.</Text>

          <View style={styles.list}>
            {GOALS.map((goal) => {
              const isSelected = selected.includes(goal.key);

              return (
                <Pressable
                  key={goal.key}
                  onPress={() => toggle(goal.key)}
                  style={[
                    styles.goalCard,
                    { backgroundColor: goal.bgColor },
                    isSelected && styles.goalCardSelected,
                  ]}
                >
                  <View style={[styles.goalIcon, { backgroundColor: goal.iconBg }]}>
                    <Text style={styles.goalIconText}>{goal.icon}</Text>
                  </View>

                  <Text style={[styles.goalText, { color: goal.textColor ?? '#1F2430' }]}>
                    {goal.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.dots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={[styles.dot, styles.dotActive]} />
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title="Bitir ›"
            onPress={handleFinish}
            disabled={!canFinish}
            style={{ backgroundColor: '#A8C85A', borderRadius: 24 }}
          />
        </View>
      </View>
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
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1F2430',
    marginTop: 10,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7E8695',
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  goalCard: {
    minHeight: 66,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  goalCardSelected: {
    borderColor: '#6E9135',
    borderWidth: 2,
  },
  goalIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  goalIconText: {
    fontSize: 18,
    color: '#2F3440',
    fontWeight: '800',
  },
  goalText: {
    fontSize: 15,
    fontWeight: '800',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: 'rgba(31,36,48,0.18)',
  },
  dotActive: {
    backgroundColor: '#A8C85A',
  },
  footer: {
    marginTop: 24,
  },
});