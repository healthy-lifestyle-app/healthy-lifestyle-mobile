import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import ExerciseAnimation from '@/components/exercise/ExerciseAnimation';
import { exerciseData } from '@/data/exerciseData';
import { workoutData } from '@/data/workoutData';
import Screen from '@/components/Screen';

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0'
  )}`;
}

function parseDurationToSeconds(duration: string) {
  if (duration.includes('dk')) {
    const minutes = parseInt(duration, 10);
    return Number.isNaN(minutes) ? 60 : minutes * 60;
  }

  if (duration.includes('sn')) {
    const seconds = parseInt(duration, 10);
    return Number.isNaN(seconds) ? 30 : seconds;
  }

  return 30;
}

export default function ExerciseSessionScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const workoutId = Array.isArray(id) ? id[0] : id;
  const workout = workoutData.find((item) => item.id === workoutId);

  const sessionExercises = useMemo(() => {
    if (!workout) {
      return [];
    }

    return workout.exercises
      .map((workoutExercise) => {
        const matchedExercise = exerciseData.find(
          (exercise) => exercise.id === workoutExercise.exerciseId
        );

        if (!matchedExercise) {
          return null;
        }

        return {
          ...matchedExercise,
          order: workoutExercise.order,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        return (a?.order ?? 0) - (b?.order ?? 0);
      });
  }, [workout]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [cardY, setCardY] = useState(0);
  const scrollRef = useRef<ScrollView | null>(null);

  const currentExercise = sessionExercises[currentIndex];

  const [secondsLeft, setSecondsLeft] = useState(
    currentExercise ? parseDurationToSeconds(currentExercise.duration) : 30
  );

  useEffect(() => {
    if (!currentExercise) {
      return;
    }

    setSecondsLeft(parseDurationToSeconds(currentExercise.duration));
    setIsPaused(false);
  }, [currentIndex, currentExercise]);

  useEffect(() => {
    if (!currentExercise || isPaused || isCompleted) {
      return;
    }

    if (secondsLeft <= 0) {
      handleCompleteExercise();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, isPaused, isCompleted, currentExercise]);

  const handleSkipExercise = () => {
    if (currentIndex === sessionExercises.length - 1) {
      setIsCompleted(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const handleCompleteExercise = () => {
    if (currentIndex === sessionExercises.length - 1) {
      setIsCompleted(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const handleCloseCompletedModal = () => {
    setIsCompleted(false);
    router.replace('/(tabs)/exercise');
  };

  const handleStopSession = () => {
    setIsPaused(true);
    Alert.alert('Antrenmanı Durdur', 'Bu antrenmanı durdurmak istiyor musun?', [
      { text: 'Vazgeç', style: 'cancel', onPress: () => setIsPaused(false) },
      {
        text: 'Durdur',
        style: 'destructive',
        onPress: () => router.replace('/(tabs)/exercise'),
      },
    ]);
  };

  const handleFinishSession = () => {
    setIsPaused(true);
    setIsCompleted(true);
  };

  if (!workout) {
    return (
      <Screen backgroundColor="#FCFBFF" contentStyle={styles.notFoundContainer} edges={['top']}>
        <Text style={styles.notFoundText}>Antrenman bulunamadı</Text>
        <TouchableOpacity
          style={styles.notFoundButton}
          onPress={() => router.back()}
        >
          <Text style={styles.notFoundButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </Screen>
    );
  }

  if (!currentExercise) {
    return (
      <Screen backgroundColor="#FCFBFF" contentStyle={styles.notFoundContainer} edges={['top']}>
        <Text style={styles.notFoundText}>Antrenman içeriği bulunamadı</Text>
        <TouchableOpacity
          style={styles.notFoundButton}
          onPress={() => router.back()}
        >
          <Text style={styles.notFoundButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </Screen>
    );
  }

  return (
    <Screen backgroundColor="#FCFBFF" contentStyle={styles.safeArea} edges={['top']}>
      <ScrollView
        ref={(ref) => {
          scrollRef.current = ref;
        }}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          if (cardY > 0) {
            scrollRef.current?.scrollTo({ y: Math.max(0, cardY - 12), animated: true });
          }
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#5C568E" />
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Egzersiz</Text>
        <Text style={styles.pageSubtitle}>Hareket zamanı!</Text>

        <View
          style={styles.mainCard}
          onLayout={(e) => {
            setCardY(e.nativeEvent.layout.y);
          }}
        >
          <View style={styles.topIconBox}>
            <Ionicons name="fitness" size={26} color="#FFFFFF" />
          </View>

          <Text style={styles.workoutName}>{workout.name}</Text>
          <Text style={styles.exerciseCount}>
            Egzersiz {currentIndex + 1}/{sessionExercises.length}
          </Text>

          <Text style={styles.currentExerciseTitle}>{currentExercise.name}</Text>

          <ExerciseAnimation
            animationKey={currentExercise.animationKey}
            backgroundColor="#F9E8E2"
            height={180}
          />

          <View style={styles.timerCircle}>
            <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.stopButton]}
              onPress={handleStopSession}
            >
              <Text style={styles.stopButtonText}>Durdur</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.pauseButton]}
              onPress={() => setIsPaused((prev) => !prev)}
            >
              <Text style={styles.pauseButtonText}>
                {isPaused ? 'Devam Et' : 'Duraklat'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.doneButton]}
              onPress={handleFinishSession}
            >
              <Ionicons name="flag" size={18} color="#FFFFFF" />
              <Text style={styles.doneButtonText}>Bitir</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.skipLink} onPress={handleSkipExercise}>
            <Text style={styles.skipLinkText}>Bu hareketi atla</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.completeLink} onPress={handleCompleteExercise}>
            <Text style={styles.completeLinkText}>Bu hareketi tamamla</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={isCompleted} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Ionicons name="checkmark" size={34} color="#FFFFFF" />
            </View>

            <Text style={styles.modalTitle}>Tebrikler!</Text>
            <Text style={styles.modalSubtitle}>
              {workout.name} antrenmanını tamamladınız.
            </Text>

            <View style={styles.modalStatsRow}>
              <View style={styles.modalStatItem}>
                <Text style={styles.modalStatValue}>{workout.duration}</Text>
                <Text style={styles.modalStatLabel}>süre</Text>
              </View>

              <View style={styles.modalStatItem}>
                <Text style={[styles.modalStatValue, { color: '#F7672C' }]}>
                  {workout.calories}
                </Text>
                <Text style={styles.modalStatLabel}>kalori</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleCloseCompletedModal}
            >
              <Text style={styles.modalButtonText}>Harika!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FCFBFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  backButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#F3F1FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#5C568E',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#4E5567',
    fontWeight: '500',
    marginBottom: 20,
  },
  mainCard: {
    backgroundColor: '#F9E8E2',
    borderRadius: 32,
    padding: 22,
    alignItems: 'center',
    marginBottom: 12,
  },
  topIconBox: {
    width: 74,
    height: 74,
    borderRadius: 22,
    backgroundColor: '#F7672C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  workoutName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
  },
  exerciseCount: {
    fontSize: 18,
    color: '#4E5567',
    fontWeight: '600',
    marginBottom: 18,
  },
  currentExerciseTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F7672C',
    textAlign: 'center',
    marginBottom: 16,
  },
  timerCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 10,
    borderColor: '#F7672C',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF7F4',
    marginBottom: 24,
    marginTop: 6,
  },
  timerText: {
    fontSize: 54,
    fontWeight: '800',
    color: '#F7672C',
  },
  buttonRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  stopButton: {
    backgroundColor: '#F4EFF6',
  },
  pauseButton: {
    backgroundColor: '#F7672C',
  },
  doneButton: {
    backgroundColor: '#A8C85A',
  },
  stopButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#5C568E',
  },
  pauseButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  skipLink: {
    marginTop: 14,
  },
  skipLinkText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#5C568E',
    textAlign: 'center',
  },
  completeLink: {
    marginTop: 8,
  },
  completeLinkText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F7672C',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.28)',
    justifyContent: 'flex-end',
    padding: 18,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 28,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalIcon: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#A8C85A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#4E5567',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 22,
  },
  modalStatsRow: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 24,
  },
  modalStatItem: {
    alignItems: 'center',
  },
  modalStatValue: {
    fontSize: 30,
    fontWeight: '800',
    color: '#A8C85A',
    marginBottom: 4,
  },
  modalStatLabel: {
    fontSize: 16,
    color: '#4E5567',
    fontWeight: '500',
  },
  modalButton: {
    width: '100%',
    height: 58,
    borderRadius: 20,
    backgroundColor: '#5C568E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  notFoundContainer: {
    flex: 1,
    backgroundColor: '#FCFBFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  notFoundButton: {
    backgroundColor: '#A8C85A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  notFoundButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});