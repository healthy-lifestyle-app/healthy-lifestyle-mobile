import type { ExerciseAnimationKey } from '@/components/exercise/ExerciseAnimation';

export type ExerciseItem = {
  id: string;
  name: string;
  difficulty: 'Kolay' | 'Orta' | 'Zor';
  duration: string;
  description: string;
  animationKey: ExerciseAnimationKey;
  tips: string[];
};

export const exerciseData: ExerciseItem[] = [
  {
    id: '1',
    name: 'Jumping Jacks',
    difficulty: 'Kolay',
    duration: '30 sn',
    description:
      'Tüm vücudu çalıştıran etkili bir kardiyo hareketidir. Isınma için çok uygundur ve kalp ritmini artırır.',
    animationKey: 'jumping-jack',
    tips: [
      'Ayaklarını açarken kollarını başının üstüne kaldır.',
      'Ritmini kontrollü koru.',
      'Yere yumuşak basmaya dikkat et.',
    ],
  },
  {
    id: '2',
    name: 'High Knees',
    difficulty: 'Orta',
    duration: '40 sn',
    description:
      'Dizleri yukarı çekerek yapılan tempolu bir kardiyo hareketidir. Alt vücut ve core bölgesini aktif çalıştırır.',
    animationKey: 'high-knees',
    tips: [
      'Dizlerini mümkün olduğunca yukarı çek.',
      'Karın kaslarını aktif tut.',
      'Hareket boyunca dik duruşunu koru.',
    ],
  },
  {
    id: '3',
    name: 'Plank',
    difficulty: 'Orta',
    duration: '30 sn',
    description:
      'Karın ve core bölgesini güçlendiren statik bir egzersizdir. Duruş ve denge gelişimine katkı sağlar.',
    animationKey: 'plank',
    tips: [
      'Dirseklerini omuz hizasında tut.',
      'Belini çökertme.',
      'Vücudunu düz bir çizgide sabit tut.',
    ],
  },
  {
    id: '4',
    name: 'Squat',
    difficulty: 'Kolay',
    duration: '45 sn',
    description:
      'Bacak ve kalça kaslarını güçlendiren temel bir egzersizdir. Günlük hareket kapasitesini destekler.',
    animationKey: 'squat',
    tips: [
      'Ayaklarını omuz genişliğinde aç.',
      'Dizlerini kontrollü şekilde bük.',
      'Topuklarından güç alarak yukarı kalk.',
    ],
  },
];