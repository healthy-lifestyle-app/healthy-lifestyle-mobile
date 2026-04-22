import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import Screen from '@/components/Screen';
import ExerciseAnimation from '@/components/exercise/ExerciseAnimation';
import { exerciseData } from '@/data/exerciseData';

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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
  const asNum = parseInt(duration, 10);
  return Number.isNaN(asNum) ? 30 : asNum;
}

export default function SingleExerciseSessionScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const exerciseId = Array.isArray(id) ? id[0] : id;
  const exercise = exerciseData.find((item) => item.id === exerciseId);

  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(
    exercise ? parseDurationToSeconds(exercise.duration) : 30,
  );

  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    if (!exercise) return;
    setSecondsLeft(parseDurationToSeconds(exercise.duration));
  }, [exercise]);

  useEffect(() => {
    if (!exercise || isPaused || isCompleted) return;
    if (secondsLeft <= 0) {
      setIsCompleted(true);
      return;
    }
    const timer = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, isPaused, isCompleted, exercise]);

  const handleStop = () => {
    setIsPaused(true);
    Alert.alert('Egzersizi Durdur', 'Bu egzersizi durdurmak istiyor musun?', [
      { text: 'Vazgeç', style: 'cancel', onPress: () => setIsPaused(false) },
      { text: 'Durdur', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  const handleFinish = () => {
    setIsPaused(true);
    setIsCompleted(true);
  };

  if (!exercise) {
    return (
      <Screen backgroundColor="#FCFBFF" contentStyle={styles.notFound} edges={['top']}>
        <Text style={styles.notFoundText}>Egzersiz bulunamadı</Text>
        <TouchableOpacity style={styles.notFoundButton} onPress={() => router.back()}>
          <Text style={styles.notFoundButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </Screen>
    );
  }

  return (
    <Screen backgroundColor="#FCFBFF" edges={['top']}>
      <ScrollView
        ref={(ref) => {
          scrollRef.current = ref;
        }}
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#5C568E" />
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Egzersiz</Text>
        <Text style={styles.pageSubtitle}>Aktif oturum</Text>

        <View style={styles.mainCard}>
          <View style={styles.topIconBox}>
            <Ionicons name="fitness" size={26} color="#FFFFFF" />
          </View>

          <Text style={styles.exerciseName}>{exercise.name}</Text>

          <ExerciseAnimation
            animationKey={exercise.animationKey}
            backgroundColor="#F9E8E2"
            height={180}
          />

          <View style={styles.timerCircle}>
            <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.actionButton, styles.stopButton]} onPress={handleStop}>
              <Text style={styles.stopButtonText}>Durdur</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.pauseButton]}
              onPress={() => setIsPaused((prev) => !prev)}
            >
              <Text style={styles.pauseButtonText}>{isPaused ? 'Devam Et' : 'Duraklat'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.doneButton]} onPress={handleFinish}>
              <Ionicons name="flag" size={18} color="#FFFFFF" />
              <Text style={styles.doneButtonText}>Bitir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal visible={isCompleted} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <Ionicons name="checkmark" size={34} color="#FFFFFF" />
            </View>
            <Text style={styles.modalTitle}>Tebrikler!</Text>
            <Text style={styles.modalSubtitle}>Egzersizi tamamladınız.</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => router.back()}>
              <Text style={styles.modalButtonText}>Harika!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
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
  exerciseName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 14,
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
  notFound: {
    flex: 1,
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

