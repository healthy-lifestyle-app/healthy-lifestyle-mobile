import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/api/client';
import { getNutritionSummary, type NutritionSummary } from '@/api/nutrition';
import {
  getWater,
  getActivitySummary,
  getStepsFromBackend,
  type WaterResponse,
  type ActivitySummaryResponse,
} from '@/api/activity';

const DEFAULT_NUTRITION: NutritionSummary = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
};

const DEFAULT_WATER: WaterResponse = {
  consumedMl: 0,
  goalMl: 2500,
  date: '',
};

const DEFAULT_ACTIVITY: ActivitySummaryResponse = {
  totalDurationMinutes: 0,
  totalCaloriesBurned: 0,
  date: '',
};

type HomeDataState = {
  nutrition: NutritionSummary;
  water: WaterResponse;
  activity: ActivitySummaryResponse;
  steps: number;
  isLoading: boolean;
  hasError: boolean;
  refresh: () => Promise<void>;
};

function toNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return fallback;
  }

  return numberValue;
}

function normalizeActivity(data: any): ActivitySummaryResponse {
  if (Array.isArray(data)) {
    const completedSessions = data.filter(
      (session) => session?.status === 'COMPLETED',
    );

    const totalDurationSec = completedSessions.reduce((sum, session) => {
      return sum + toNumber(session?.totalDurationSec);
    }, 0);

    const totalCaloriesBurned = completedSessions.reduce((sum, session) => {
      return sum + toNumber(session?.totalCaloriesBurned);
    }, 0);

    return {
      totalDurationMinutes:
        totalDurationSec > 0
          ? Math.max(1, Math.round(totalDurationSec / 60))
          : 0,
      totalCaloriesBurned,
      date: new Date().toISOString().split('T')[0],
    };
  }

  const totalDurationMinutes = toNumber(
    data?.totalDurationMinutes ??
      data?.durationMinutes ??
      data?.totalMinutes ??
      data?.minutes ??
      data?.total_duration_minutes ??
      data?.summary?.totalDurationMinutes,
  );

  const totalDurationSec = toNumber(
    data?.totalDurationSec ??
      data?.durationSec ??
      data?.total_seconds ??
      data?.summary?.totalDurationSec,
  );

  return {
    totalDurationMinutes:
      totalDurationMinutes > 0
        ? totalDurationMinutes
        : totalDurationSec > 0
          ? Math.max(1, Math.round(totalDurationSec / 60))
          : 0,
    totalCaloriesBurned: toNumber(
      data?.totalCaloriesBurned ??
        data?.caloriesBurned ??
        data?.burnedCalories ??
        data?.calories ??
        data?.summary?.totalCaloriesBurned ??
        data?.summary?.caloriesBurned,
    ),
    date: data?.date ?? new Date().toISOString().split('T')[0],
  };
}

export function useHomeData(): HomeDataState {
  const [nutrition, setNutrition] =
    useState<NutritionSummary>(DEFAULT_NUTRITION);
  const [water, setWater] = useState<WaterResponse>(DEFAULT_WATER);
  const [activity, setActivity] =
    useState<ActivitySummaryResponse>(DEFAULT_ACTIVITY);
  const [steps, setSteps] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    const [nutritionRes, waterRes, activityRes, stepsRes] =
      await Promise.allSettled([
        getNutritionSummary(today),
        getWater(),
        getActivitySummary(),
        getStepsFromBackend(),
      ]);

    if (nutritionRes.status === 'fulfilled') {
      setNutrition(nutritionRes.value);
    }

    if (waterRes.status === 'fulfilled') {
      setWater(waterRes.value);
    }

    if (activityRes.status === 'fulfilled') {
      setActivity(normalizeActivity(activityRes.value));
    }

    if (stepsRes.status === 'fulfilled') {
      setSteps(toNumber(stepsRes.value.steps));
    }

    const results = [nutritionRes, waterRes, activityRes, stepsRes];

    const has401 = results.some(
      (r) =>
        r.status === 'rejected' &&
        r.reason instanceof ApiError &&
        r.reason.status === 401,
    );

    if (has401) {
      setIsLoading(false);
      return;
    }

    if (results.every((r) => r.status === 'rejected')) {
      setHasError(true);
    }

    setIsLoading(false);
  }, [today]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    nutrition,
    water,
    activity,
    steps,
    isLoading,
    hasError,
    refresh: fetchAll,
  };
}