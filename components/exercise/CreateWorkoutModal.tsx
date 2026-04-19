import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { exerciseData } from '@/data/exerciseData';
import type { WorkoutItem, WorkoutType } from '@/data/workoutData';

type CreateWorkoutModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (workout: WorkoutItem) => void;
};

type SelectedExerciseItem = {
  exerciseId: string;
  order: number;
  duration: string;
  sets?: number;
  reps?: number;
};

const WORKOUT_TYPES: WorkoutType[] = ['HIIT', 'Güç', 'Yoga', 'Kardiyo'];

export default function CreateWorkoutModal({
  visible,
  onClose,
  onSave,
}: CreateWorkoutModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<WorkoutType>('HIIT');
  const [duration, setDuration] = useState('30');
  const [calories, setCalories] = useState('200');

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    exerciseData[0]?.id ?? ''
  );
  const [exerciseDuration, setExerciseDuration] = useState('30');
  const [exerciseSets, setExerciseSets] = useState('');
  const [exerciseReps, setExerciseReps] = useState('');

  const [selectedExercises, setSelectedExercises] = useState<
    SelectedExerciseItem[]
  >([]);

  const selectedExercise = useMemo(() => {
    return exerciseData.find((item) => item.id === selectedExerciseId);
  }, [selectedExerciseId]);

  const selectedExerciseObjects = useMemo(() => {
    return selectedExercises
      .map((item) => {
        const exercise = exerciseData.find((e) => e.id === item.exerciseId);

        if (!exercise) {
          return null;
        }

        return {
          ...exercise,
          order: item.order,
          selectedDuration: item.duration,
          sets: item.sets,
          reps: item.reps,
        };
      })
      .filter(Boolean);
  }, [selectedExercises]);

  const resetForm = () => {
    setName('');
    setType('HIIT');
    setDuration('30');
    setCalories('200');
    setSelectedExerciseId(exerciseData[0]?.id ?? '');
    setExerciseDuration('30');
    setExerciseSets('');
    setExerciseReps('');
    setSelectedExercises([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddExercise = () => {
    if (!selectedExerciseId) {
      Alert.alert('Uyarı', 'Lütfen bir egzersiz seçin.');
      return;
    }

    const parsedSets = exerciseSets.trim() ? Number(exerciseSets) : undefined;
    const parsedReps = exerciseReps.trim() ? Number(exerciseReps) : undefined;

    if (exerciseSets.trim() && Number.isNaN(parsedSets)) {
      Alert.alert('Uyarı', 'Set değeri sayı olmalıdır.');
      return;
    }

    if (exerciseReps.trim() && Number.isNaN(parsedReps)) {
      Alert.alert('Uyarı', 'Tekrar değeri sayı olmalıdır.');
      return;
    }

    setSelectedExercises((prev) => [
      ...prev,
      {
        exerciseId: selectedExerciseId,
        order: prev.length + 1,
        duration: exerciseDuration.trim() || '30',
        sets: parsedSets,
        reps: parsedReps,
      },
    ]);

    setExerciseDuration('30');
    setExerciseSets('');
    setExerciseReps('');
  };

  const handleRemoveExercise = (index: number) => {
    setSelectedExercises((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((item, i) => ({
          ...item,
          order: i + 1,
        }))
    );
  };

  const handleSave = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert('Uyarı', 'Lütfen antrenman adını girin.');
      return;
    }

    if (selectedExercises.length === 0) {
      Alert.alert('Uyarı', 'Lütfen en az bir egzersiz ekleyin.');
      return;
    }

    const firstExercise = exerciseData.find(
      (item) => item.id === selectedExercises[0]?.exerciseId
    );

    const newWorkout: WorkoutItem = {
      id: `custom-${Date.now()}`,
      name: trimmedName,
      type,
      duration: `${duration || '30'} dk`,
      calories: `${calories || '200'} kcal`,
      difficulty: 'Orta',
      coverAnimationKey: firstExercise?.animationKey ?? 'jumping-jack',
      description: 'Kullanıcı tarafından oluşturulan antrenman.',
      exercises: selectedExercises.map((item, index) => ({
        exerciseId: item.exerciseId,
        order: index + 1,
      })),
      isFavorite: false,
    };

    onSave(newWorkout);
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <View style={styles.sheet}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetContent}
          >
            <View style={styles.headerRow}>
              <Text style={styles.title}>Yeni Antrenman Oluştur</Text>

              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Ionicons name="close" size={24} color="#5C568E" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Antrenman Adı</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Örn: Sabah Koşusu"
              placeholderTextColor="#A1A1AA"
              style={styles.input}
            />

            <Text style={styles.label}>Antrenman Tipi</Text>
            <View style={styles.typeGrid}>
              {WORKOUT_TYPES.map((item) => {
                const isActive = item === type;

                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.typeButton, isActive && styles.typeButtonActive]}
                    onPress={() => setType(item)}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        isActive && styles.typeButtonTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>Süre (dk)</Text>
                <TextInput
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                  placeholder="30"
                  placeholderTextColor="#A1A1AA"
                  style={styles.input}
                />
              </View>

              <View style={styles.half}>
                <Text style={styles.label}>Kalori</Text>
                <TextInput
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="numeric"
                  placeholder="200"
                  placeholderTextColor="#A1A1AA"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Egzersiz Ekle</Text>

            <View style={styles.exercisePickerBox}>
              <Text style={styles.pickerLabel}>Egzersiz Seç</Text>
              <View style={styles.exerciseOptions}>
                {exerciseData.map((exercise) => {
                  const isSelected = selectedExerciseId === exercise.id;

                  return (
                    <TouchableOpacity
                      key={exercise.id}
                      style={[
                        styles.exerciseOption,
                        isSelected && styles.exerciseOptionActive,
                      ]}
                      onPress={() => {
                        setSelectedExerciseId(exercise.id);
                        const onlyNumber = exercise.duration.replace(/\D/g, '');
                        setExerciseDuration(onlyNumber || '30');
                      }}
                    >
                      <Text
                        style={[
                          styles.exerciseOptionText,
                          isSelected && styles.exerciseOptionTextActive,
                        ]}
                      >
                        {exercise.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.smallInfoRow}>
              <TextInput
                value={exerciseDuration}
                onChangeText={setExerciseDuration}
                keyboardType="numeric"
                placeholder="Süre"
                placeholderTextColor="#A1A1AA"
                style={styles.smallInput}
              />

              <TextInput
                value={exerciseSets}
                onChangeText={setExerciseSets}
                keyboardType="numeric"
                placeholder="Set"
                placeholderTextColor="#A1A1AA"
                style={styles.smallInput}
              />

              <TextInput
                value={exerciseReps}
                onChangeText={setExerciseReps}
                keyboardType="numeric"
                placeholder="Tekrar"
                placeholderTextColor="#A1A1AA"
                style={styles.smallInput}
              />
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddExercise}>
              <Ionicons name="add" size={22} color="#A8C85A" />
              <Text style={styles.addButtonText}>Ekle</Text>
            </TouchableOpacity>

            {selectedExerciseObjects.length > 0 && (
              <View style={styles.selectedList}>
                <Text style={styles.selectedListTitle}>Eklenen Egzersizler</Text>

                {selectedExerciseObjects.map((exercise, index) => {
                  if (!exercise) {
                    return null;
                  }

                  return (
                    <View key={`${exercise.id}-${index}`} style={styles.selectedRow}>
                      <View style={styles.selectedLeft}>
                        <View style={styles.orderBadge}>
                          <Text style={styles.orderBadgeText}>{index + 1}</Text>
                        </View>

                        <View style={styles.selectedTextArea}>
                          <Text style={styles.selectedName}>{exercise.name}</Text>
                          <Text style={styles.selectedMeta}>
                            {exercise.selectedDuration} dk
                            {exercise.sets ? ` • ${exercise.sets} set` : ''}
                            {exercise.reps ? ` • ${exercise.reps} tekrar` : ''}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity onPress={() => handleRemoveExercise(index)}>
                        <Ionicons name="close-circle" size={22} color="#F7672C" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Antrenmanı Kaydet</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(17, 24, 39, 0.25)',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '88%',
    paddingTop: 18,
  },
  sheetContent: {
    paddingHorizontal: 22,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#5C568E',
    flex: 1,
    marginRight: 12,
  },
  closeButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F3F1FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
    marginTop: 6,
  },
  input: {
    height: 56,
    borderRadius: 18,
    backgroundColor: '#F6F4FA',
    paddingHorizontal: 18,
    fontSize: 16,
    color: '#111827',
    marginBottom: 18,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },
  typeButton: {
    width: '48%',
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: '#F6F4FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#F7672C',
  },
  typeButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#5C568E',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    gap: 14,
  },
  half: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#E9E7F0',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  exercisePickerBox: {
    marginBottom: 14,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 10,
  },
  exerciseOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  exerciseOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#F6F4FA',
  },
  exerciseOptionActive: {
    backgroundColor: '#EEF1E0',
  },
  exerciseOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5C568E',
  },
  exerciseOptionTextActive: {
    color: '#A8C85A',
  },
  smallInfoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  smallInput: {
    flex: 1,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#F6F4FA',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  addButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: '#EEF1E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#A8C85A',
  },
  selectedList: {
    backgroundColor: '#FCFBFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 22,
  },
  selectedListTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  selectedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  selectedTextArea: {
    flex: 1,
  },
  orderBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EEF1E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#A8C85A',
  },
  selectedName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  selectedMeta: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  saveButton: {
    height: 58,
    borderRadius: 20,
    backgroundColor: '#B8B2D5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});