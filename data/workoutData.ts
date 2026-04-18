import type { ExerciseAnimationKey } from '@/components/exercise/ExerciseAnimation';

export type WorkoutType = 'HIIT' | 'Güç' | 'Yoga' | 'Kardiyo';

export type WorkoutExerciseItem = {
  exerciseId: string;
  order: number;
};

export type WorkoutItem = {
  id: string;
  name: string;
  type: WorkoutType;
  duration: string;
  calories: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  coverAnimationKey: ExerciseAnimationKey;
  description: string;
  exercises: WorkoutExerciseItem[];
  isFavorite?: boolean;
};

export const workoutData: WorkoutItem[] = [
  {
    id: 'hiit-1',
    name: 'HIIT Antrenmanı',
    type: 'HIIT',
    duration: '20 dk',
    calories: '250 kcal',
    difficulty: 'Orta',
    coverAnimationKey: 'jumping-jack',
    description:
      'Kısa sürede tempoyu yükselten, yağ yakımını destekleyen dinamik bir antrenmandır.',
    exercises: [
      { exerciseId: '1', order: 1 },
      { exerciseId: '2', order: 2 },
      { exerciseId: '1', order: 3 },
      { exerciseId: '2', order: 4 },
    ],
    isFavorite: true,
  },
  {
    id: 'strength-1',
    name: 'Güç Antrenmanı',
    type: 'Güç',
    duration: '45 dk',
    calories: '300 kcal',
    difficulty: 'Orta',
    coverAnimationKey: 'squat',
    description:
      'Kas dayanıklılığı ve kuvvet gelişimi için temel hareketlerden oluşan antrenmandır.',
    exercises: [
      { exerciseId: '4', order: 1 },
      { exerciseId: '3', order: 2 },
      { exerciseId: '4', order: 3 },
    ],
    isFavorite: false,
  },
  {
    id: 'yoga-1',
    name: 'Sabah Yogası',
    type: 'Yoga',
    duration: '30 dk',
    calories: '120 kcal',
    difficulty: 'Kolay',
    coverAnimationKey: 'plank',
    description:
      'Güne daha esnek ve dengeli başlamak için nefes ve duruş odaklı sakin bir akıştır.',
    exercises: [
      { exerciseId: '3', order: 1 },
      { exerciseId: '3', order: 2 },
    ],
    isFavorite: false,
  },
  {
    id: 'cardio-1',
    name: 'Kardiyo Başlangıç',
    type: 'Kardiyo',
    duration: '30 dk',
    calories: '150 kcal',
    difficulty: 'Kolay',
    coverAnimationKey: 'high-knees',
    description:
      'Başlangıç seviyesine uygun, kalp ritmini artıran temel kardiyo hareketlerinden oluşur.',
    exercises: [
      { exerciseId: '1', order: 1 },
      { exerciseId: '2', order: 2 },
    ],
    isFavorite: false,
  },
];