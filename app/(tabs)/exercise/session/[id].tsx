import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  cancelWorkoutSession,
  completeWorkoutSession,
  completeWorkoutSessionExercise,
  getWorkoutById,
  pauseWorkoutSession,
  resumeWorkoutSession,
  skipWorkoutSessionExercise,
  startWorkoutSession,
  type MobileWorkout,
  type WorkoutSession,
} from '@/api/activity';
import ExerciseAnimation from '@/components/exercise/ExerciseAnimation';
import Screen from '@/components/Screen';

function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0',
  )}`;
}

function getExerciseDurationSec(
  item: WorkoutSession['items'][number] | undefined,
) {
  const value = Number(item?.workoutExercise.durationSec);

  return Number.isFinite(value) && value > 0 ? value : 30;
}

function getRestDurationSec(
  item: WorkoutSession['items'][number] | undefined,
) {
  const value = Number(item?.workoutExercise.restSec);

  return Number.isFinite(value) && value > 0 ? value : 60;
}

export default function ExerciseSessionScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const workoutId = Array.isArray(id) ? id[0] : id;

  const [workout, setWorkout] = useState<MobileWorkout | null>(null);
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isResting, setIsResting] = useState(false);
  const [restSecondsLeft, setRestSecondsLeft] = useState(0);

  const [cardY, setCardY] = useState(0);

  const scrollRef = useRef<ScrollView | null>(null);

  const sessionExercises = session?.items ?? [];
  const currentExercise = sessionExercises[currentIndex];
  const nextExercise = sessionExercises[currentIndex + 1];

  const initializeSession = useCallback(async () => {
    if (!workoutId) return;

    try {
      setLoading(true);
      setIsCompleted(false);
      setIsSaving(false);
      setIsPaused(false);
      setIsResting(false);
      setRestSecondsLeft(0);

      const [workoutData, startedSession] = await Promise.all([
        getWorkoutById(workoutId),
        startWorkoutSession(workoutId),
      ]);

      setWorkout(workoutData);
      setSession(startedSession);
      setCurrentIndex(0);
      setSecondsLeft(getExerciseDurationSec(startedSession.items?.[0]));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Antrenman başlatılamadı.';

      Alert.alert('Hata', message, [
        { text: 'Tamam', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [router, workoutId]);

  useFocusEffect(
    useCallback(() => {
      initializeSession();
    }, [initializeSession]),
  );

  useEffect(() => {
    if (!currentExercise || isResting) return;

    setSecondsLeft(getExerciseDurationSec(currentExercise));
    setIsPaused(false);
  }, [currentIndex, currentExercise, isResting]);

 const moveToNextExercise = useCallback(() => {
  const nextIndex = currentIndex + 1;
  const nextExercise = sessionExercises[nextIndex];

  setIsResting(false);
  setRestSecondsLeft(0);
  setCurrentIndex(nextIndex);
  setSecondsLeft(getExerciseDurationSec(nextExercise));
  setIsPaused(false);
}, [currentIndex, sessionExercises]);

  const startRestOrNext = useCallback(() => {
    const restSec = getRestDurationSec(currentExercise);

    if (restSec > 0) {
      setRestSecondsLeft(restSec);
      setIsResting(true);
      setIsPaused(false);
      return;
    }

    moveToNextExercise();
  }, [currentExercise, moveToNextExercise]);

  const handleCompleteExercise = useCallback(async () => {
    if (!session || !currentExercise || isSaving || isCompleted) return;

    try {
      setIsSaving(true);

      await completeWorkoutSessionExercise(session.id, currentExercise.id);

      const isLastExercise = currentIndex === sessionExercises.length - 1;

      if (isLastExercise) {
        await completeWorkoutSession(session.id);
        setIsCompleted(true);
        setIsPaused(true);
        setIsResting(false);
        return;
      }

      startRestOrNext();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Hareket tamamlanırken bir sorun oluştu.';

      Alert.alert('Hata', message);
    } finally {
      setIsSaving(false);
    }
  }, [
    currentExercise,
    currentIndex,
    isCompleted,
    isSaving,
    session,
    sessionExercises.length,
    startRestOrNext,
  ]);

  const handleSkipExercise = useCallback(async () => {
    if (!session || !currentExercise || isSaving || isCompleted) return;

    try {
      setIsSaving(true);

      await skipWorkoutSessionExercise(session.id, currentExercise.id);

      const isLastExercise = currentIndex === sessionExercises.length - 1;

      if (isLastExercise) {
        await completeWorkoutSession(session.id);
        setIsCompleted(true);
        setIsPaused(true);
        setIsResting(false);
        return;
      }

      moveToNextExercise();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Hareket atlanırken bir sorun oluştu.';

      Alert.alert('Hata', message);
    } finally {
      setIsSaving(false);
    }
  }, [
    currentExercise,
    currentIndex,
    isCompleted,
    isSaving,
    moveToNextExercise,
    session,
    sessionExercises.length,
  ]);

  useEffect(() => {
  if (!currentExercise || isPaused || isCompleted || isSaving || isResting) {
    return;
  }

  // Eğer secondsLeft <= 0 ise önce yeni hareketi set et
  if (secondsLeft <= 0) {
    const nextIndex = currentIndex + 1;
    const nextExercise = sessionExercises[nextIndex];

    if (nextExercise) {
      setCurrentIndex(nextIndex);
      setSecondsLeft(getExerciseDurationSec(nextExercise));
    } else {
      handleCompleteExercise();
    }

    return;
  }

  const timer = setTimeout(() => {
    setSecondsLeft((prev) => Math.max(0, prev - 1));
  }, 1000);

  return () => clearTimeout(timer);
}, [
  currentExercise,
  handleCompleteExercise,
  isCompleted,
  isPaused,
  isResting,
  isSaving,
  secondsLeft,
  currentIndex,
  sessionExercises,
]);
  useEffect(() => {
    if (!isResting || isCompleted || isSaving) return;

    if (restSecondsLeft <= 0) {
      moveToNextExercise();
      return;
    }

    const timer = setTimeout(() => {
      setRestSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    isCompleted,
    isResting,
    isSaving,
    moveToNextExercise,
    restSecondsLeft,
  ]);

  const handlePauseResume = async () => {
    if (!session || isSaving || isCompleted || isResting) return;

    const nextPaused = !isPaused;

    try {
      setIsSaving(true);

      if (nextPaused) {
        await pauseWorkoutSession(session.id);
      } else {
        await resumeWorkoutSession(session.id);
      }

      setIsPaused(nextPaused);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : nextPaused
            ? 'Antrenman duraklatılamadı.'
            : 'Antrenman devam ettirilemedi.';

      Alert.alert('Hata', message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipRest = () => {
    if (isSaving) return;

    moveToNextExercise();
  };

  const handleCloseCompletedModal = () => {
    setIsCompleted(false);
    router.replace('/(tabs)/exercise');
  };

  const handleStopSession = () => {
    if (isSaving) return;

    setIsPaused(true);

    Alert.alert('Antrenmanı Durdur', 'Bu antrenmanı durdurmak istiyor musun?', [
      {
        text: 'Vazgeç',
        style: 'cancel',
        onPress: () => setIsPaused(false),
      },
      {
        text: 'Durdur',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsSaving(true);

            if (session) {
              await cancelWorkoutSession(session.id);
            }

            router.replace('/(tabs)/exercise');
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : 'Antrenman durdurulurken bir sorun oluştu.';

            Alert.alert('Hata', message);
            setIsPaused(false);
          } finally {
            setIsSaving(false);
          }
        },
      },
    ]);
  };

  const handleFinishSession = async () => {
    if (!session || isSaving) return;

    try {
      setIsSaving(true);
      setIsPaused(true);
      setIsResting(false);

      await completeWorkoutSession(session.id);

      setIsCompleted(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Antrenman tamamlanırken bir sorun oluştu.';

      Alert.alert('Hata', message);
      setIsPaused(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Screen
        backgroundColor="#FCFBFF"
        contentStyle={styles.notFoundContainer}
        edges={['top']}
      >
        <Text style={styles.notFoundText}>Antrenman hazırlanıyor...</Text>
      </Screen>
    );
  }

  if (!workout) {
    return (
      <Screen
        backgroundColor="#FCFBFF"
        contentStyle={styles.notFoundContainer}
        edges={['top']}
      >
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
      <Screen
        backgroundColor="#FCFBFF"
        contentStyle={styles.notFoundContainer}
        edges={['top']}
      >
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
    <Screen
      backgroundColor="#FCFBFF"
      contentStyle={styles.safeArea}
      edges={['top']}
    >
      <ScrollView
        ref={(ref) => {
          scrollRef.current = ref;
        }}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          if (cardY > 0) {
            scrollRef.current?.scrollTo({
              y: Math.max(0, cardY - 12),
              animated: true,
            });
          }
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#5C568E" />
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Egzersiz</Text>
        <Text style={styles.pageSubtitle}>
          {isResting ? 'Kısa bir mola!' : 'Hareket zamanı!'}
        </Text>

        <View
          style={[styles.mainCard, isResting && styles.restCard]}
          onLayout={(e) => {
            setCardY(e.nativeEvent.layout.y);
          }}
        >
          {isResting ? (
            <>
              <View style={styles.restIconBox}>
                <Ionicons name="timer" size={32} color="#FFFFFF" />
              </View>

              <Text style={styles.workoutName}>{workout.name}</Text>
              <Text style={styles.exerciseCount}>
                Sıradaki egzersiz: {currentIndex + 2}/{sessionExercises.length}
              </Text>

              <Text style={styles.restTitle}>Set Arası</Text>

              <View style={styles.timerCircle}>
                <Text style={styles.timerText}>
                  {formatTime(restSecondsLeft)}
                </Text>
              </View>

              <Text style={styles.nextExerciseText}>
                Sonraki:{' '}
                {nextExercise?.workoutExercise.exercise.name ?? 'Egzersiz'}
              </Text>

              <TouchableOpacity
                style={[styles.restSkipButton, isSaving && styles.disabledButton]}
                onPress={handleSkipRest}
                disabled={isSaving}
              >
                <Text style={styles.restSkipButtonText}>Dinlenmeyi Atla</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.topIconBox}>
                <Ionicons name="fitness" size={26} color="#FFFFFF" />
              </View>

              <Text style={styles.workoutName}>{workout.name}</Text>
              <Text style={styles.exerciseCount}>
                Egzersiz {currentIndex + 1}/{sessionExercises.length}
              </Text>

              <Text style={styles.currentExerciseTitle}>
                {currentExercise.workoutExercise.exercise.name ?? 'Egzersiz'}
              </Text>

              <ExerciseAnimation
                animationKey={undefined}
                backgroundColor="#F9E8E2"
                height={180}
              />

              <View style={styles.timerCircle}>
                <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
              </View>

              <Text style={styles.exerciseMetaText}>
                {currentExercise.workoutExercise.sets
                  ? `${currentExercise.workoutExercise.sets} set`
                  : 'Set belirtilmedi'}
                {currentExercise.workoutExercise.reps
                  ? ` • ${currentExercise.workoutExercise.reps} tekrar`
                  : ''}
                {currentExercise.workoutExercise.restSec
                  ? ` • ${currentExercise.workoutExercise.restSec} sn dinlenme`
                  : ' • 60 sn dinlenme'}
              </Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.stopButton,
                    isSaving && styles.disabledButton,
                  ]}
                  onPress={handleStopSession}
                  disabled={isSaving}
                >
                  <Text style={styles.stopButtonText}>Durdur</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.pauseButton,
                    isSaving && styles.disabledButton,
                  ]}
                  onPress={handlePauseResume}
                  disabled={isSaving}
                >
                  <Text style={styles.pauseButtonText}>
                    {isPaused ? 'Devam Et' : 'Duraklat'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.doneButton,
                    isSaving && styles.disabledButton,
                  ]}
                  onPress={handleFinishSession}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="flag" size={18} color="#FFFFFF" />
                      <Text style={styles.doneButtonText}>Bitir</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.skipLink, isSaving && styles.disabledButton]}
                onPress={handleSkipExercise}
                disabled={isSaving}
              >
                <Text style={styles.skipLinkText}>
                  {isSaving ? 'Kaydediliyor...' : 'Bu hareketi atla'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.completeLink, isSaving && styles.disabledButton]}
                onPress={handleCompleteExercise}
                disabled={isSaving}
              >
                <Text style={styles.completeLinkText}>
                  {isSaving ? 'Kaydediliyor...' : 'Bu hareketi tamamla'}
                </Text>
              </TouchableOpacity>
            </>
          )}
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
  restCard: {
    backgroundColor: '#EEF7D8',
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
  restIconBox: {
    width: 74,
    height: 74,
    borderRadius: 22,
    backgroundColor: '#A8C85A',
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
  restTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#5E8E2E',
    textAlign: 'center',
    marginBottom: 18,
  },
  nextExerciseText: {
    fontSize: 16,
    color: '#4E5567',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 18,
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
  exerciseMetaText: {
    fontSize: 14,
    color: '#4E5567',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 18,
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
  disabledButton: {
    opacity: 0.6,
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
  restSkipButton: {
    width: '100%',
    height: 56,
    borderRadius: 18,
    backgroundColor: '#5C568E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restSkipButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
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