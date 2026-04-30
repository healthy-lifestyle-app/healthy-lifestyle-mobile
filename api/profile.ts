/**
 * api/profile.ts
 *
 * Tüm /api/profile/... endpointleri için tip tanımları ve API çağrıları.
 * Auth token mevcut api/client altyapısıyla otomatik ekleniyor.
 */
import { apiClient } from './client';

// ─── Types ────────────────────────────────────────────────────

export interface ProfileUser {
  id: string;
  email: string;
  fullName: string | null;
}

export interface WeeklySummary {
  activeDays: number;
  averageCalories: number;
  dailyCalorieTarget: number | null;
  totalExerciseMinutes: number;
  totalWaterMl: number;
  waterTargetMl: number | null;
  totalSteps: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
}

export interface ProfileOverview {
  user: ProfileUser;
  targets: {
    dailyCalorieTarget: number | null;
    waterTargetMl: number | null;
  };
  streak: number;
  motivationalMessage: string | null;
  weeklySummary: WeeklySummary | null;
  achievements: Achievement[];
}

export interface ProfileSettings {
  id?: string;
  email: string | null;
  fullName: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | string | null;
  birthDate: string | null;
  heightCm: number | null;
  weightKg: number | null;
  goalType: string | null;
  activityLevel: string | null;
  targetWeightKg: number | null;
  timezone: string | null;
  dailyCalorieTarget: number | null;
  dailyProteinTarget: number | null;
  dailyCarbsTarget: number | null;
  dailyFatTarget: number | null;
  waterTargetMl: number | null;
  notificationsEnabled: boolean;
}

export interface ProfileGoals {
  goalType: string | null;
  activityLevel: string | null;
  targetWeightKg: number | null;
  dailyCalorieTarget: number | null;
  dailyProteinTarget: number | null;
  dailyCarbsTarget: number | null;
  dailyFatTarget: number | null;
  waterTargetMl: number | null;
}

export interface ProfileStatistics {
  weeklySummary?: WeeklySummary | null;

  totalWorkouts?: number | null;
  currentStreak?: number | null;
  longestStreak?: number | null;
  totalCaloriesBurned?: number | null;

  averageDailyCalories?: number | null;
  totalWaterMl?: number | null;
  totalWaterLiters?: number | null;
  totalSteps?: number | null;

  weightProgress?: { date: string; value: number }[] | null;
  calorieHistory?: { date: string; value: number }[] | null;
  waterHistory?: { date: string; value: number }[] | null;
  exerciseHistory?: { date: string; value: number }[] | null;
}

export interface HistoryItem {
  id: string;
  type: 'exercise' | 'nutrition' | 'water' | 'weight' | string;
  title: string;
  description: string;
  date: string;
  metadata?: Record<string, unknown>;
}

export interface ProfileHistory {
  items: HistoryItem[];
}

// ─── API ─────────────────────────────────────────────────────

export const profileApi = {
  getOverview: (): Promise<ProfileOverview> =>
    apiClient.get<ProfileOverview>('/api/profile/overview'),

  getSettings: (): Promise<ProfileSettings> =>
    apiClient.get<ProfileSettings>('/api/profile/settings'),

  updateSettings: (
    data: Partial<ProfileSettings>,
  ): Promise<ProfileSettings> =>
    apiClient.patch<ProfileSettings>('/api/profile/settings', data),

  updatePassword: (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message?: string }> =>
  apiClient.patch<{ message?: string }>('/api/profile/password', data),

  getGoals: (): Promise<ProfileGoals> =>
    apiClient.get<ProfileGoals>('/api/profile/goals'),

  updateGoals: (data: Partial<ProfileGoals>): Promise<ProfileGoals> =>
    apiClient.patch<ProfileGoals>('/api/profile/goals', data),

  getStatistics: (): Promise<ProfileStatistics> =>
    apiClient.get<ProfileStatistics>('/api/profile/statistics'),

  getHistory: (): Promise<ProfileHistory> =>
    apiClient.get<ProfileHistory>('/api/profile/history'),

  updateNotifications: (data: {
    notificationsEnabled: boolean;
  }): Promise<ProfileSettings> =>
    apiClient.patch<ProfileSettings>('/api/profile/notifications', data),
};