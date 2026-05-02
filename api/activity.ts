// api/activity.ts

import { apiRequest } from '@/api/client';

// ─── Types ────────────────────────────────────────────────────────────────────

export type WorkoutTypeLabel =
  | 'CARDIO'
  | 'WALKING'
  | 'HIIT'
  | 'STRENGTH'
  | 'PILATES'
  | 'MOBILITY'
  | 'YOGA'
  | 'STRETCHING'
  | 'CUSTOM';

export type DifficultyLabel = 'Kolay' | 'Orta' | 'Zor';

export type MobileWorkoutExercise = {
  id: string;
  orderNo: number;
  durationSec: number | null;
  reps: number | null;
  sets: number | null;
  restSec: number | null;
  note: string | null;
  exercise: {
    id: string;
    name: string;
    category: string | null;
    difficulty: DifficultyLabel;
    defaultDurationSec: number | null;
    defaultReps?: number | null;
    defaultSets?: number | null;
    defaultRestSec?: number | null;
  };
};

export type MobileWorkout = {
  id: string;
  name: string;
  type: WorkoutTypeLabel;
  difficulty: DifficultyLabel;
  duration: string;
  calories: string;
  description: string;
  isFavorite: boolean;
  exerciseCount?: number;
  exercises: MobileWorkoutExercise[];
};

export type WorkoutSessionItem = {
  id: string;
  startedAt: string | null;
  endedAt: string | null;
  actualDurationSec: number | null;
  completed: boolean;
  skipped: boolean;
  workoutExercise: {
    id: string;
    orderNo: number;
    durationSec: number | null;
    reps: number | null;
    sets: number | null;
    restSec: number | null;
    note: string | null;
    exercise: {
      id: string;
      name: string | null;
      category: string | null;
      difficulty: string | null;
    };
  };
};

export type WorkoutSession = {
  id: string;
  workoutId: string;
  startedAt: string;
  endedAt: string | null;
  status: string;
  totalDurationSec: number | null;
  totalCaloriesBurned: number | null;
  completedExercises: number | null;
  skippedExercises: number | null;
  items: WorkoutSessionItem[];
};

export type ExerciseOption = {
  id: string;
  name: string;
  category: string | null;
  muscleGroup?: string | null;
  metValue?: number | null;
  description?: string | null;
  instructions?: string | null;
  difficulty?: string | null;
  defaultDurationSec?: number | null;
  defaultReps?: number | null;
  defaultSets?: number | null;
  defaultRestSec?: number | null;
  restSec?: number | null;
};

export type WaterResponse = {
  consumedMl: number;
  goalMl: number;
  date: string;
};

export type StepsResponse = {
  steps: number;
  date: string;
};

export type ActivitySummaryResponse = {
  totalDurationMinutes: number;
  totalCaloriesBurned: number;
  date: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayString() {
  return new Date().toISOString().split('T')[0];
}

function toNumber(value: unknown, fallback = 0) {
  const n = Number(value);

  return Number.isFinite(n) ? n : fallback;
}

function mapWorkoutType(type: string): WorkoutTypeLabel {
  switch (String(type ?? '').toUpperCase()) {
    case 'CARDIO':
      return 'CARDIO';
    case 'WALKING':
      return 'WALKING';
    case 'HIIT':
      return 'HIIT';
    case 'STRENGTH':
      return 'STRENGTH';
    case 'PILATES':
      return 'PILATES';
    case 'MOBILITY':
      return 'MOBILITY';
    case 'YOGA':
      return 'YOGA';
    case 'STRETCHING':
      return 'STRETCHING';
    case 'GÜÇ':
      return 'STRENGTH';
    case 'KARDİYO':
      return 'CARDIO';
    case 'YÜRÜYÜŞ':
      return 'WALKING';
    case 'MOBİLİTE':
      return 'MOBILITY';
    case 'ESNEME':
      return 'STRETCHING';
    default:
      return 'CUSTOM';
  }
}

function mapDifficulty(value: string | null | undefined): DifficultyLabel {
  switch (String(value ?? '').toUpperCase()) {
    case 'EASY':
    case 'KOLAY':
      return 'Kolay';
    case 'MEDIUM':
    case 'ORTA':
      return 'Orta';
    case 'HARD':
    case 'ZOR':
      return 'Zor';
    default:
      return 'Orta';
  }
}

function toDurationLabel(minutes: number | null | undefined) {
  const mins = toNumber(minutes);

  return mins > 0 ? `${Math.round(mins)} dk` : '0 dk';
}

function toCaloriesLabel(calories: number | null | undefined) {
  const cals = toNumber(calories);

  return cals > 0 ? `${Math.round(cals)} kcal` : '0 kcal';
}

function deriveWorkoutDifficulty(
  exercises: Array<{ exercise?: { difficulty?: string | null } }>,
): DifficultyLabel {
  if (exercises.length === 0) return 'Kolay';

  let score = 0;

  for (const item of exercises) {
    const difficulty = mapDifficulty(item.exercise?.difficulty);

    score += difficulty === 'Kolay' ? 1 : difficulty === 'Orta' ? 2 : 3;
  }

  const avg = score / exercises.length;

  if (avg >= 2.5) return 'Zor';
  if (avg >= 1.7) return 'Orta';

  return 'Kolay';
}

function normalizeWorkout(raw: any): MobileWorkout {
  const exercises = Array.isArray(raw?.exercises) ? raw.exercises : [];

  const normalizedExercises: MobileWorkoutExercise[] = exercises.map(
    (item: any) => ({
      id: String(item?.id ?? ''),
      orderNo: toNumber(item?.orderNo),
      durationSec: item?.durationSec ?? null,
      reps: item?.reps ?? null,
      sets: item?.sets ?? null,
      restSec: item?.restSec ?? null,
      note: item?.note ?? null,
      exercise: {
        id: String(item?.exercise?.id ?? ''),
        name: item?.exercise?.name ?? 'Egzersiz',
        category: item?.exercise?.category
          ? String(item.exercise.category).toUpperCase()
          : null,
        difficulty: mapDifficulty(item?.exercise?.difficulty),
        defaultDurationSec:
          item?.exercise?.defaultDurationSec ?? item?.durationSec ?? null,
        defaultReps: item?.exercise?.defaultReps ?? item?.reps ?? null,
        defaultSets: item?.exercise?.defaultSets ?? item?.sets ?? null,
        defaultRestSec:
          item?.exercise?.defaultRestSec ??
          item?.exercise?.restSec ??
          item?.restSec ??
          60,
      },
    }),
  );

  return {
    id: String(raw?.id ?? ''),
    name: raw?.name ?? 'Antrenman',
    type: mapWorkoutType(raw?.type),
    difficulty: deriveWorkoutDifficulty(normalizedExercises),
    duration: toDurationLabel(raw?.estimatedDurationMin),
    calories: toCaloriesLabel(raw?.estimatedCalories),
    description: raw?.description ?? 'Açıklama bulunamadı.',
    isFavorite: Boolean(raw?.isFavorite),
    exerciseCount: normalizedExercises.length,
    exercises: normalizedExercises.sort((a, b) => a.orderNo - b.orderNo),
  };
}

function normalizeExerciseOption(raw: any): ExerciseOption {
  const restSec = raw?.restSec ?? raw?.defaultRestSec ?? 60;

  return {
    id: String(raw?.id ?? ''),
    name: raw?.name ?? 'Egzersiz',
    category: raw?.category ? String(raw.category).toUpperCase() : null,
    muscleGroup: raw?.muscleGroup ?? null,
    metValue: raw?.metValue ?? null,
    description: raw?.description ?? null,
    instructions: raw?.instructions ?? null,
    difficulty: raw?.difficulty ?? null,
    defaultDurationSec: raw?.defaultDurationSec ?? null,
    defaultReps: raw?.defaultReps ?? null,
    defaultSets: raw?.defaultSets ?? null,
    defaultRestSec: restSec,
    restSec,
  };
}

function normalizeWaterResponse(response: any): WaterResponse {
  const consumedMl = toNumber(
    response?.consumedMl ??
      response?.totalMl ??
      response?.amountMl ??
      response?.waterMl ??
      response?.ml ??
      response?.summary?.consumedMl ??
      response?.summary?.totalMl,
  );

  const goalMl = toNumber(
    response?.goalMl ??
      response?.targetMl ??
      response?.dailyGoalMl ??
      response?.waterGoalMl ??
      response?.summary?.goalMl ??
      response?.summary?.targetMl,
    2500,
  );

  return {
    consumedMl,
    goalMl,
    date: response?.date ?? todayString(),
  };
}

function normalizeActivitySummary(response: any): ActivitySummaryResponse {
  if (Array.isArray(response)) {
    const completed = response.filter(
      (session) => session?.status === 'COMPLETED',
    );

    const totalSec = completed.reduce(
      (sum, session) => sum + toNumber(session?.totalDurationSec),
      0,
    );

    const totalCal = completed.reduce(
      (sum, session) => sum + toNumber(session?.totalCaloriesBurned),
      0,
    );

    return {
      totalDurationMinutes:
        totalSec > 0 ? Math.max(1, Math.round(totalSec / 60)) : 0,
      totalCaloriesBurned: totalCal,
      date: todayString(),
    };
  }

  const totalDurationMinutes = toNumber(
    response?.totalExerciseMinutes ??
      response?.totalDurationMinutes ??
      response?.durationMinutes ??
      response?.totalMinutes ??
      response?.minutes ??
      response?.duration ??
      response?.summary?.totalDurationMinutes,
  );

  const totalDurationSec = toNumber(
    response?.totalDurationSec ??
      response?.durationSec ??
      response?.total_seconds ??
      response?.summary?.totalDurationSec,
  );

  return {
    totalDurationMinutes:
      totalDurationMinutes > 0
        ? totalDurationMinutes
        : totalDurationSec > 0
          ? Math.max(1, Math.round(totalDurationSec / 60))
          : 0,
    totalCaloriesBurned: toNumber(
      response?.totalCaloriesBurned ??
        response?.caloriesBurned ??
        response?.burnedCalories ??
        response?.calories ??
        response?.summary?.totalCaloriesBurned ??
        response?.summary?.caloriesBurned,
    ),
    date: response?.date ?? todayString(),
  };
}

// ─── API Fonksiyonları ────────────────────────────────────────────────────────

export async function getWorkouts(): Promise<MobileWorkout[]> {
  const response = await apiRequest<any[]>('/api/activity/workouts', {
    method: 'GET',
  });

  return Array.isArray(response) ? response.map(normalizeWorkout) : [];
}

export async function getWorkoutById(
  id: string | number,
): Promise<MobileWorkout> {
  const response = await apiRequest<any>(`/api/activity/workouts/${id}`, {
    method: 'GET',
  });

  return normalizeWorkout(response);
}

/**
 * Backend'de /api/activity/exercises endpoint'i olmadığı için
 * egzersiz seçeneklerini mevcut /api/activity/workouts response içinden topluyoruz.
 */
export async function getExerciseOptions(
  category?: string,
): Promise<ExerciseOption[]> {
  const workouts = await getWorkouts();
  const byId = new Map<string, ExerciseOption>();
  const selectedCategory = category ? String(category).toUpperCase() : null;

  for (const workout of workouts) {
    for (const item of workout.exercises) {
      const exercise = item.exercise;

      if (!exercise?.id) continue;

      const exerciseCategory = exercise.category
        ? String(exercise.category).toUpperCase()
        : null;

      if (selectedCategory && exerciseCategory !== selectedCategory) {
        continue;
      }

      if (byId.has(exercise.id)) continue;

      byId.set(
        exercise.id,
        normalizeExerciseOption({
          id: exercise.id,
          name: exercise.name,
          category: exerciseCategory,
          difficulty: exercise.difficulty,
          defaultDurationSec:
            exercise.defaultDurationSec ?? item.durationSec ?? null,
          defaultReps: exercise.defaultReps ?? item.reps ?? null,
          defaultSets: exercise.defaultSets ?? item.sets ?? null,
          defaultRestSec: exercise.defaultRestSec ?? item.restSec ?? 60,
          restSec: exercise.defaultRestSec ?? item.restSec ?? 60,
        }),
      );
    }
  }

  return Array.from(byId.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'tr'),
  );
}

/**
 * Backend'de tek exercise endpoint'i olmadığı için
 * şimdilik tüm workout içindeki egzersizlerden arar.
 */
export async function getExerciseById(
  id: string | number,
): Promise<ExerciseOption> {
  const exercises = await getExerciseOptions();
  const found = exercises.find((exercise) => exercise.id === String(id));

  if (!found) {
    throw new Error('Egzersiz bulunamadı.');
  }

  return found;
}

export async function getExerciseOptionsFromWorkouts(): Promise<
  ExerciseOption[]
> {
  return getExerciseOptions();
}

// ─── Workout oluşturma ────────────────────────────────────────────────────────

type CreateWorkoutInput = {
  name: string;
  type: WorkoutTypeLabel;
  description?: string;
  estimatedDurationMin?: number;
  estimatedCalories?: number;
  exercises: Array<{
    exerciseId: string | number;
    orderNo: number;
    durationSec?: number;
    reps?: number;
    sets?: number;
    restSec?: number;
    note?: string;
  }>;
};

function toBackendExerciseId(id: string | number): string | number {
  const raw = String(id);
  const numeric = Number(raw);

  return Number.isFinite(numeric) && raw.trim() !== '' ? numeric : raw;
}

function cleanNumber(value?: number) {
  if (value == null) return undefined;

  const numeric = Number(value);

  return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
}

export async function createWorkout(
  input: CreateWorkoutInput,
): Promise<MobileWorkout> {
  const payload = {
    name: input.name.trim(),
    type: input.type,
    description: input.description?.trim() || undefined,
    estimatedDurationMin: cleanNumber(input.estimatedDurationMin),
    estimatedCalories: cleanNumber(input.estimatedCalories),
    exercises: input.exercises.map((exercise) => ({
      exerciseId: toBackendExerciseId(exercise.exerciseId),
      orderNo: exercise.orderNo,
      durationSec: cleanNumber(exercise.durationSec),
      reps: cleanNumber(exercise.reps),
      sets: cleanNumber(exercise.sets),
      restSec: cleanNumber(exercise.restSec),
      note: exercise.note?.trim() || undefined,
    })),
  };

  console.log('CREATE_WORKOUT_PAYLOAD', JSON.stringify(payload, null, 2));

  const response = await apiRequest<any>('/api/activity/workouts', {
    method: 'POST',
    body: payload,
  });

  return normalizeWorkout(response);
}

// ─── Workout Session ──────────────────────────────────────────────────────────

export async function startWorkoutSession(workoutId: string | number) {
  return apiRequest<WorkoutSession>('/api/activity/workout-sessions/start', {
    method: 'POST',
    body: {
      workoutId: String(workoutId),
    },
  });
}

export async function pauseWorkoutSession(sessionId: string | number) {
  return apiRequest<WorkoutSession>(
    `/api/activity/workout-sessions/${sessionId}/pause`,
    {
      method: 'PATCH',
    },
  );
}

export async function resumeWorkoutSession(sessionId: string | number) {
  return apiRequest<WorkoutSession>(
    `/api/activity/workout-sessions/${sessionId}/resume`,
    {
      method: 'PATCH',
    },
  );
}

export async function completeWorkoutSession(sessionId: string | number) {
  return apiRequest<WorkoutSession>(
    `/api/activity/workout-sessions/${sessionId}/complete`,
    {
      method: 'PATCH',
    },
  );
}

export async function cancelWorkoutSession(sessionId: string | number) {
  return apiRequest<WorkoutSession>(
    `/api/activity/workout-sessions/${sessionId}/cancel`,
    {
      method: 'PATCH',
    },
  );
}

export async function completeWorkoutSessionExercise(
  sessionId: string | number,
  sessionExerciseId: string | number,
) {
  return apiRequest(
    `/api/activity/workout-sessions/${sessionId}/exercises/${sessionExerciseId}/complete`,
    {
      method: 'PATCH',
    },
  );
}

export async function skipWorkoutSessionExercise(
  sessionId: string | number,
  sessionExerciseId: string | number,
) {
  return apiRequest(
    `/api/activity/workout-sessions/${sessionId}/exercises/${sessionExerciseId}/skip`,
    {
      method: 'PATCH',
    },
  );
}

// ─── Su / Adım / Özet ─────────────────────────────────────────────────────────

export async function getWater(): Promise<WaterResponse> {
  const response = await apiRequest<any>(
    `/api/activity/water?date=${todayString()}`,
    {
      method: 'GET',
    },
  );

  return normalizeWaterResponse(response);
}

export async function saveWater(
  consumedMl: number,
  goalMl: number,
): Promise<WaterResponse> {
  const normalizedConsumedMl = Math.max(0, Math.round(toNumber(consumedMl)));
  const normalizedGoalMl = Math.max(250, Math.round(toNumber(goalMl, 2500)));

  const response = await apiRequest<any>('/api/activity/water', {
    method: 'POST',
    body: {
      amountMl: normalizedConsumedMl,
    },
  });

  return normalizeWaterResponse({
    ...response,
    consumedMl: response?.amountMl ?? normalizedConsumedMl,
    goalMl: normalizedGoalMl,
  });
}

export async function addWater(
  amountMl: number,
  currentConsumedMl: number,
  goalMl: number,
): Promise<WaterResponse> {
  const normalizedAmount = Math.round(toNumber(amountMl));
  const normalizedCurrent = Math.max(0, Math.round(toNumber(currentConsumedMl)));
  const normalizedGoalMl = Math.max(250, Math.round(toNumber(goalMl, 2500)));

  if (normalizedAmount <= 0) {
    throw new Error('Su miktarı 0\'dan büyük olmalıdır.');
  }

  return saveWater(normalizedCurrent + normalizedAmount, normalizedGoalMl);
}

export async function getActivitySummary(): Promise<ActivitySummaryResponse> {
  const response = await apiRequest<any>(
    `/api/activity/summary?date=${todayString()}`,
    {
      method: 'GET',
    },
  );

  return normalizeActivitySummary(response);
}

export async function getStepsFromBackend(): Promise<StepsResponse> {
  const response = await apiRequest<any>(
    `/api/activity/steps?date=${todayString()}`,
    {
      method: 'GET',
    },
  );

  return {
    steps: toNumber(response?.steps),
    date: response?.date ?? todayString(),
  };
}