import AsyncStorage from '@react-native-async-storage/async-storage';

export type NutritionTargets = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number) {
  return Math.round(value);
}

function computeTargetsFromProfile(profile: any): NutritionTargets {
  const weightKg = Number(profile?.weight ?? 0);

  if (!Number.isFinite(weightKg) || weightKg <= 0) {
    return { calories: 2000, protein: 120, carbs: 240, fat: 70 };
  }

  const calories = clamp(round(weightKg * 30), 1400, 3200);
  const protein = clamp(round(weightKg * 1.6), 70, 220);
  const fat = clamp(round(weightKg * 0.9), 40, 140);
  const carbs = clamp(round((calories - protein * 4 - fat * 9) / 4), 80, 420);

  return { calories, protein, carbs, fat };
}

export async function getNutritionTargets(): Promise<NutritionTargets> {
  try {
    const raw = await AsyncStorage.getItem('onboarding_profile');
    const profile = raw ? JSON.parse(raw) : null;
    return computeTargetsFromProfile(profile);
  } catch {
    return { calories: 2000, protein: 120, carbs: 240, fat: 70 };
  }
}

