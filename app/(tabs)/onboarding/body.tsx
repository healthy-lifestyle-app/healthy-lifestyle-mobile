import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "@/components/button";
import Screen from '@/components/Screen';

const COLORS = {
  background: '#F8F6EC',
  text: '#1F2430',
  muted: '#7E8695',
  border: '#E6E2F0',
  card: '#FFFFFF',
  soft: '#F8F7FB',
  green: '#A8C85A',
};

export default function Body() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");

  const canNext =
    Number(height) > 0 && Number(weight) > 0 && Number(targetWeight) > 0;

  const handleNext = async () => {
    Keyboard.dismiss();

    if (!canNext) return;

    const raw = await AsyncStorage.getItem("onboarding_profile");
    const profile = raw ? JSON.parse(raw) : {};

    profile.height = Number(height);
    profile.weight = Number(weight);
    profile.targetWeight = Number(targetWeight);

    await AsyncStorage.setItem("onboarding_profile", JSON.stringify(profile));

    router.push("/onboarding/goals");
  };

  return (
    <Screen backgroundColor={COLORS.background} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.screen}>
            <View>
              <Text style={styles.title}>Vücut Bilgilerin</Text>
              <Text style={styles.subtitle}>
                Sağlıklı hedefler belirlemek için boy, kilo ve hedef kilonu alalım.
              </Text>

              <View style={styles.formCard}>
                <TextInput
                  value={height}
                  onChangeText={setHeight}
                  placeholder="Boy (cm)"
                  placeholderTextColor="rgba(31,36,48,0.45)"
                  keyboardType="number-pad"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  style={styles.input}
                />

                <TextInput
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="Kilo (kg)"
                  placeholderTextColor="rgba(31,36,48,0.45)"
                  keyboardType="number-pad"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  style={styles.input}
                />

                <TextInput
                  value={targetWeight}
                  onChangeText={setTargetWeight}
                  placeholder="Hedef Kilo (kg)"
                  placeholderTextColor="rgba(31,36,48,0.45)"
                  keyboardType="number-pad"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  style={styles.input}
                />
              </View>

              <View style={styles.dots}>
                <View style={[styles.dot, styles.dotActive]} />
                <View style={[styles.dot, styles.dotActive]} />
                <View style={[styles.dot, styles.dotActive]} />
                <View style={styles.dot} />
              </View>
            </View>

            <View style={styles.footer}>
              <Button
                title="Devam et ›"
                onPress={handleNext}
                disabled={!canNext}
                style={{ backgroundColor: COLORS.green, borderRadius: 24 }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.text,
    marginTop: 10,
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    gap: 10,
  },
  input: {
    backgroundColor: COLORS.soft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(94,87,143,0.14)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
    justifyContent: 'center',
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
  footer: {
    marginTop: 24,
  },
});