import { apiRequest } from '@/api/client';

export type WorkoutTypeLabel = 'HIIT' | 'Güç' | 'Yoga' | 'Kardiyo' | 'Özel';
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
  difficulty: DifficultyLabel;
  defaultDurationSec: number | null;
};

function mapWorkoutType(type: string): WorkoutTypeLabel {
  const upper = String(type ?? '').toUpperCase();
  if (upper === 'HIIT') return 'HIIT';
  if (upper === 'YOGA') return 'Yoga';
  if (upper === 'WALKING' || upper === 'CARDIO') return 'Kardiyo';
  if (upper === 'STRENGTH') return 'Güç';
  return 'Özel';
}

function mapDifficulty(value: string | null | undefined): DifficultyLabel {
  const upper = String(value ?? '').toUpperCase();
  if (upper === 'EASY' || upper === 'KOLAY') return 'Kolay';
  if (upper === 'MEDIUM' || upper === 'ORTA') return 'Orta';
  if (upper === 'HARD' || upper === 'ZOR') return 'Zor';
  return 'Orta';
}

function toDurationLabel(minutes: number | null | undefined) {
  const mins = Number(minutes ?? 0);
  if (!Number.isFinite(mins) || mins <= 0) return '0 dk';
  return `${Math.round(mins)} dk`;
}

function toCaloriesLabel(calories: number | null | undefined) {
  const cals = Number(calories ?? 0);
  if (!Number.isFinite(cals) || cals <= 0) return '0 kcal';
  return `${Math.round(cals)} kcal`;
}

function deriveWorkoutDifficulty(exercises: Array<{ exercise?: { difficulty?: string | null } }>) {
  let score = 0;
  for (const item of exercises) {
    const d = mapDifficulty(item.exercise?.difficulty);
    score += d === 'Kolay' ? 1 : d === 'Orta' ? 2 : 3;
  }
  if (exercises.length === 0) return 'Kolay';
  const avg = score / exercises.length;
  if (avg >= 2.5) return 'Zor';
  if (avg >= 1.7) return 'Orta';
  return 'Kolay';
}

function normalizeWorkout(raw: any): MobileWorkout {
  const exercises = Array.isArray(raw?.exercises) ? raw.exercises : [];

  const normalizedExercises: MobileWorkoutExercise[] = exercises.map((item: any) => ({
    id: String(item?.id ?? ''),
    orderNo: Number(item?.orderNo ?? 0),
    durationSec: item?.durationSec ?? null,
    reps: item?.reps ?? null,
    sets: item?.sets ?? null,
    restSec: item?.restSec ?? null,
    note: item?.note ?? null,
    exercise: {
      id: String(item?.exercise?.id ?? ''),
      name: item?.exercise?.name ?? 'Egzersiz',
      category: item?.exercise?.category ?? null,
      difficulty: mapDifficulty(item?.exercise?.difficulty),
      defaultDurationSec: item?.exercise?.defaultDurationSec ?? null,
    },
  }));

  return {
    id: String(raw?.id ?? ''),
    name: raw?.name ?? 'Antrenman',
    type: mapWorkoutType(raw?.type),
    difficulty: deriveWorkoutDifficulty(normalizedExercises),
    duration: toDurationLabel(raw?.estimatedDurationMin),
    calories: toCaloriesLabel(raw?.estimatedCalories),
    description: raw?.description ?? 'Açıklama bulunamadı.',
    isFavorite: Boolean(raw?.isFavorite),
    exercises: normalizedExercises.sort((a, b) => a.orderNo - b.orderNo),
  };
}

export async function getWorkouts() {
  const response = await apiRequest<any[]>('/api/activity/workouts', { method: 'GET' });
  return Array.isArray(response) ? response.map(normalizeWorkout) : [];
}

export async function getWorkoutById(id: string | number) {
  const response = await apiRequest<any>(`/api/activity/workouts/${id}`, { method: 'GET' });
  return normalizeWorkout(response);
}

export async function getExerciseOptionsFromWorkouts() {
  const workouts = await getWorkouts();
  const byId = new Map<string, ExerciseOption>();

  for (const workout of workouts) {
    for (const item of workout.exercises) {
      if (!item.exercise.id) continue;
      if (!byId.has(item.exercise.id)) {
        byId.set(item.exercise.id, {
          id: item.exercise.id,
          name: item.exercise.name,
          category: item.exercise.category,
          difficulty: item.exercise.difficulty,
          defaultDurationSec: item.exercise.defaultDurationSec,
        });
      }
    }
  }

  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name, 'tr'));
}

type CreateWorkoutInput = {
  name: string;
  type: WorkoutTypeLabel;
  description?: string;
  estimatedDurationMin?: number;
  estimatedCalories?: number;
  color?: string;
  icon?: string;
  isPublic?: boolean;
  exercises: Array<{
    exerciseId: number;
    orderNo: number;
    durationSec?: number;
    reps?: number;
    sets?: number;
    restSec?: number;
    note?: string;
  }>;
};

function toBackendWorkoutType(type: WorkoutTypeLabel) {
  if (type === 'Güç') return 'STRENGTH';
  if (type === 'Kardiyo') return 'WALKING';
  if (type === 'Yoga') return 'YOGA';
  if (type === 'HIIT') return 'HIIT';
  return 'CUSTOM';
}

export async function createWorkout(input: CreateWorkoutInput) {
  const response = await apiRequest<any>('/api/activity/workouts', {
    method: 'POST',
    body: {
      name: input.name,
      type: toBackendWorkoutType(input.type),
      description: input.description,
      estimatedDurationMin: input.estimatedDurationMin,
      estimatedCalories: input.estimatedCalories,
      color: input.color,
      icon: input.icon,
      isPublic: input.isPublic ?? false,
      exercises: input.exercises,
    },
  });

  return normalizeWorkout(response);
}

export async function startWorkoutSession(workoutId: string | number) {
  return apiRequest<WorkoutSession>('/api/activity/workout-sessions/start', {
    method: 'POST',
    body: { workoutId: Number(workoutId) },
  });
}

export async function pauseWorkoutSession(sessionId: string | number) {
  return apiRequest<WorkoutSession>(`/api/activity/workout-sessions/${sessionId}/pause`, {
    method: 'PATCH',
  });
}

export async function resumeWorkoutSession(sessionId: string | number) {
  return apiRequest<WorkoutSession>(`/api/activity/workout-sessions/${sessionId}/resume`, {
    method: 'PATCH',
  });
}

export async function completeWorkoutSession(sessionId: string | number) {
  return apiRequest<WorkoutSession>(`/api/activity/workout-sessions/${sessionId}/complete`, {
    method: 'PATCH',
  });
}

export async function cancelWorkoutSession(sessionId: string | number) {
  return apiRequest<WorkoutSession>(`/api/activity/workout-sessions/${sessionId}/cancel`, {
    method: 'PATCH',
  });
}

export async function completeWorkoutSessionExercise(
  sessionId: string | number,
  sessionExerciseId: string | number,
) {
  return apiRequest(`/api/activity/workout-sessions/${sessionId}/exercises/${sessionExerciseId}/complete`, {
    method: 'PATCH',
  });
}

export async function skipWorkoutSessionExercise(
  sessionId: string | number,
  sessionExerciseId: string | number,
) {
  return apiRequest(`/api/activity/workout-sessions/${sessionId}/exercises/${sessionExerciseId}/skip`, {
    method: 'PATCH',
  });
}
