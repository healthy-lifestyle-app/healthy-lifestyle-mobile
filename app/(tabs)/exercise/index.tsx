// app/(tabs)/exercise/index.tsx

import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';

import {
  createWorkout,
  getExerciseOptions,
  getWorkouts,
  type ExerciseOption,
  type MobileWorkout,
} from '@/api/activity';
import { apiRequest } from '@/api/client';
import CreateWorkoutModal, {
  type CreateWorkoutPayload,
} from '@/components/exercise/CreateWorkoutModal';
import Screen from '@/components/Screen';

const C = {
  bg: '#FCFBFF',
  card: '#FFFFFF',
  text: '#111827',
  muted: '#6B7280',
  primary: '#A8C85A',
  primarySoft: '#EEF7D8',
  purple: '#5C568E',
  purpleSoft: '#F3F1FA',
  orange: '#F7672C',
  border: '#ECEEF4',
};

const QUICK_START_WORKOUT_KEY = 'exercise_quick_start_workout_id';

type TodayStats = {
  workoutCount: number;
  totalCalories: number;
  totalMinutes: number;
};

type WorkoutSessionLike = {
  id?: string | number;
  workoutId?: string | number;
  workout?: {
    id?: string | number;
    estimatedCalories?: string | number | null;
    estimatedDurationMin?: string | number | null;
    calories?: string | number | null;
    duration?: string | number | null;
  };

  startedAt?: string | Date | null;
  startTime?: string | Date | null;
  endedAt?: string | Date | null;
  completedAt?: string | Date | null;
  createdAt?: string | Date | null;
  date?: string | Date | null;

  durationMin?: string | number | null;
  durationMinutes?: string | number | null;
  duration?: string | number | null;
  totalDurationMin?: string | number | null;
  totalMinutes?: string | number | null;

  caloriesBurned?: string | number | null;
  totalCalories?: string | number | null;
  calories?: string | number | null;
};

const CATEGORY_LABEL: Record<string, string> = {
  CARDIO: 'Kardiyo',
  WALKING: 'Yürüyüş',
  HIIT: 'HIIT',
  STRENGTH: 'Güç',
  PILATES: 'Pilates',
  MOBILITY: 'Mobilite',
  YOGA: 'Yoga',
  STRETCHING: 'Esneme',
  CUSTOM: 'Özel',
};

function getCategoryLabel(type: string) {
  return CATEGORY_LABEL[String(type).toUpperCase()] ?? 'Özel';
}

function getWorkoutIcon(type: string): keyof typeof Ionicons.glyphMap {
  switch (String(type).toUpperCase()) {
    case 'HIIT':
      return 'flame';
    case 'STRENGTH':
      return 'barbell';
    case 'YOGA':
      return 'leaf';
    case 'CARDIO':
      return 'heart';
    case 'WALKING':
      return 'walk';
    case 'PILATES':
      return 'body';
    case 'MOBILITY':
      return 'move';
    case 'STRETCHING':
      return 'infinite';
    default:
      return 'fitness';
  }
}

function getWorkoutColors(type: string) {
  switch (String(type).toUpperCase()) {
    case 'HIIT':
      return {
        cardBg: '#FFF0EA',
        iconBg: C.orange,
        accent: C.orange,
      };
    case 'STRENGTH':
      return {
        cardBg: '#F0EEF8',
        iconBg: C.purple,
        accent: C.purple,
      };
    case 'YOGA':
      return {
        cardBg: '#F1F7E4',
        iconBg: C.primary,
        accent: '#5E8E2E',
      };
    case 'CARDIO':
    case 'WALKING':
      return {
        cardBg: '#FFF7E6',
        iconBg: '#F3C96E',
        accent: '#C58B1E',
      };
    case 'PILATES':
    case 'MOBILITY':
    case 'STRETCHING':
      return {
        cardBg: '#EEF7D8',
        iconBg: '#7CAA32',
        accent: '#5E8E2E',
      };
    default:
      return {
        cardBg: '#F5F2FB',
        iconBg: C.primary,
        accent: C.primary,
      };
  }
}

function getDifficultyStyle(difficulty: string) {
  if (difficulty === 'Kolay') return styles.easyBadge;
  if (difficulty === 'Orta') return styles.mediumBadge;

  return styles.hardBadge;
}

function parseFirstNumber(value?: string | number | null) {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  const match = String(value).match(/\d+/);

  return match ? Number(match[0]) : 0;
}

function normalizeSearchText(value: string) {
  return value.trim().toLocaleLowerCase('tr-TR');
}

function formatDateForApi(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function isSameLocalDay(value?: string | Date | null) {
  if (!value) return false;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function getSessionDate(session: WorkoutSessionLike) {
  return (
    session.startedAt ??
    session.startTime ??
    session.completedAt ??
    session.createdAt ??
    session.date ??
    null
  );
}

function getNumberValue(...values: Array<string | number | null | undefined>) {
  for (const value of values) {
    const parsed = parseFirstNumber(value);

    if (parsed > 0) return parsed;
  }

  return 0;
}
function getDurationMinutesFromDates(session: WorkoutSessionLike) {
  const start = session.startedAt ?? session.startTime;
  const end = session.endedAt ?? session.completedAt;

  if (!start || !end) return 0;

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 0;
  }

  const diffMs = endDate.getTime() - startDate.getTime();

  if (diffMs <= 0) return 0;

  return Math.ceil(diffMs / 1000 / 60);
}

function extractSessionList(response: unknown): WorkoutSessionLike[] {
  if (Array.isArray(response)) return response as WorkoutSessionLike[];

  if (!response || typeof response !== 'object') return [];

  const data = response as Record<string, unknown>;
  const possibleLists = [
    data.sessions,
    data.items,
    data.data,
    data.results,
    data.workoutSessions,
  ];

  const list = possibleLists.find(Array.isArray);

  return Array.isArray(list) ? (list as WorkoutSessionLike[]) : [];
}

function extractTodayStats(response: unknown): TodayStats | null {
  if (!response || typeof response !== 'object') return null;

  const data = response as Record<string, unknown>;
  const summary =
    data.summary && typeof data.summary === 'object'
      ? (data.summary as Record<string, unknown>)
      : data;

  const workoutCount = getNumberValue(
    summary.workoutCount as string | number | null | undefined,
    summary.totalWorkouts as string | number | null | undefined,
    summary.completedWorkouts as string | number | null | undefined,
  );
  const totalCalories = getNumberValue(
    summary.totalCalories as string | number | null | undefined,
    summary.caloriesBurned as string | number | null | undefined,
    summary.calories as string | number | null | undefined,
  );
  const totalMinutes = getNumberValue(
    summary.totalMinutes as string | number | null | undefined,
    summary.durationMin as string | number | null | undefined,
    summary.durationMinutes as string | number | null | undefined,
    summary.duration as string | number | null | undefined,
  );

  if (workoutCount === 0 && totalCalories === 0 && totalMinutes === 0) {
    return null;
  }

  return {
    workoutCount,
    totalCalories,
    totalMinutes,
  };
}

function calculateTodayStatsFromSessions(
  sessions: WorkoutSessionLike[],
): TodayStats {
  const todaySessions = sessions.filter((session) =>
    isSameLocalDay(getSessionDate(session)),
  );

  return todaySessions.reduce<TodayStats>(
    (acc, session) => {
      const sessionCalories = getNumberValue(
        session.caloriesBurned,
        session.totalCalories,
        session.calories,
        session.workout?.estimatedCalories,
        session.workout?.calories,
      );

      const sessionMinutes =
        getNumberValue(
          session.durationMin,
          session.durationMinutes,
          session.totalDurationMin,
          session.totalMinutes,
          session.duration,
          session.workout?.estimatedDurationMin,
          session.workout?.duration,
        ) || getDurationMinutesFromDates(session);

      return {
        workoutCount: acc.workoutCount,
        totalCalories: acc.totalCalories + sessionCalories,
        totalMinutes: acc.totalMinutes + sessionMinutes,
      };
    },
    {
      workoutCount: todaySessions.length,
      totalCalories: 0,
      totalMinutes: 0,
    },
  );
}

export default function ExerciseScreen() {
  const router = useRouter();

  const [workouts, setWorkouts] = useState<MobileWorkout[]>([]);
  const [exerciseOptions, setExerciseOptions] = useState<ExerciseOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [favoriteUpdatingId, setFavoriteUpdatingId] = useState<string | null>(
    null,
  );
  const [quickStartWorkoutId, setQuickStartWorkoutId] = useState<string | null>(
    null,
  );
  const [todayStats, setTodayStats] = useState<TodayStats>({
    workoutCount: 0,
    totalCalories: 0,
    totalMinutes: 0,
  });

  const quickStartWorkout = useMemo(() => {
    if (!quickStartWorkoutId) return null;

    return (
      workouts.find(
        (workout) => String(workout.id) === String(quickStartWorkoutId),
      ) ?? null
    );
  }, [quickStartWorkoutId, workouts]);

  const categoryItems = useMemo(() => {
    const categories = new Set<string>();

    exerciseOptions.forEach((item) => {
      if (item.category) {
        categories.add(String(item.category).toUpperCase());
      }
    });

    workouts.forEach((workout) => {
      if (workout.type) {
        categories.add(String(workout.type).toUpperCase());
      }
    });

    if (categories.size === 0) {
      [
        'CARDIO',
        'WALKING',
        'HIIT',
        'STRENGTH',
        'PILATES',
        'MOBILITY',
        'YOGA',
        'STRETCHING',
        'CUSTOM',
      ].forEach((item) => categories.add(item));
    }

    return ['ALL', ...Array.from(categories)];
  }, [exerciseOptions, workouts]);

  const filteredWorkouts = useMemo(() => {
    const query = normalizeSearchText(searchQuery);

    return workouts
      .filter((workout) => {
        if (!showFavoritesOnly) return true;

        return workout.isFavorite;
      })
      .filter((workout) => {
        if (!query) return true;

        const name = normalizeSearchText(workout.name);
        const type = normalizeSearchText(getCategoryLabel(workout.type));

        return name.includes(query) || type.includes(query);
      })
      .filter((workout) => {
        if (selectedCategory === 'ALL') return true;

        return String(workout.type).toUpperCase() === selectedCategory;
      });
  }, [workouts, selectedCategory, searchQuery, showFavoritesOnly]);

  const loadQuickStartWorkout = useCallback(async () => {
    try {
      const storedId = await AsyncStorage.getItem(QUICK_START_WORKOUT_KEY);

      setQuickStartWorkoutId(storedId);
    } catch {
      setQuickStartWorkoutId(null);
    }
  }, []);

  const loadTodayStats = useCallback(async () => {
  try {
    const today = formatDateForApi(new Date());
    const response = await apiRequest(
      `/api/activity/workout-sessions?date=${today}`,
    );
    const sessions = extractSessionList(response);

    if (sessions.length > 0) {
      const calculatedStats = calculateTodayStatsFromSessions(sessions);
      setTodayStats(calculatedStats);
      return;
    }

    const directStats = extractTodayStats(response);

    if (directStats) {
      setTodayStats(directStats);
      return;
    }

    setTodayStats({
      workoutCount: 0,
      totalCalories: 0,
      totalMinutes: 0,
    });
  } catch (error) {
    console.log('TODAY_STATS_ERROR', error);

    setTodayStats({
      workoutCount: 0,
      totalCalories: 0,
      totalMinutes: 0,
    });
  }
}, []);

  const loadWorkouts = useCallback(async () => {
    try {
      const [data, options] = await Promise.all([
        getWorkouts(),
        getExerciseOptions(),
      ]);

      setWorkouts(data);
      setExerciseOptions(options);

      if (selectedCategory !== 'ALL') {
        const categoryExists = data.some(
          (workout) => String(workout.type).toUpperCase() === selectedCategory,
        );

        if (!categoryExists) {
          setSelectedCategory('ALL');
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Antrenmanlar alınamadı.';

      Alert.alert('Hata', message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory]);

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
      loadTodayStats();
      loadQuickStartWorkout();
    }, [loadQuickStartWorkout, loadTodayStats, loadWorkouts]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadWorkouts(),
      loadTodayStats(),
      loadQuickStartWorkout(),
    ]);
  };

  const handleCreateWorkout = async (payload: CreateWorkoutPayload) => {
    console.log('CREATE_WORKOUT_PAYLOAD_BEFORE_SEND', payload);
    await createWorkout({
      name: payload.name,
      type: payload.type,
      estimatedDurationMin: payload.estimatedDurationMin,
      estimatedCalories: payload.estimatedCalories,
      description: 'Mobil uygulamadan oluşturulan antrenman.',
      exercises: payload.exercises,
    });

    await loadWorkouts();
  };

  const handleToggleFavorite = async (workout: MobileWorkout) => {
    if (favoriteUpdatingId) return;

    const wasFavorite = Boolean(workout.isFavorite);

    setFavoriteUpdatingId(workout.id);

    setWorkouts((current) =>
      current.map((item) =>
        item.id === workout.id
          ? {
              ...item,
              isFavorite: !wasFavorite,
            }
          : item,
      ),
    );

    try {
      await apiRequest(`/api/activity/workouts/${workout.id}/favorite`, {
        method: wasFavorite ? 'DELETE' : 'POST',
      });

      await loadWorkouts();
    } catch (error) {
      setWorkouts((current) =>
        current.map((item) =>
          item.id === workout.id
            ? {
                ...item,
                isFavorite: wasFavorite,
              }
            : item,
        ),
      );

      Alert.alert(
        'Hata',
        error instanceof Error
          ? error.message
          : 'Favori durumu güncellenemedi.',
      );
    } finally {
      setFavoriteUpdatingId(null);
    }
  };

  const handleSetQuickStartWorkout = async (workout: MobileWorkout) => {
    try {
      await AsyncStorage.setItem(QUICK_START_WORKOUT_KEY, String(workout.id));
      setQuickStartWorkoutId(String(workout.id));

      Alert.alert(
        'Hızlı Başlat Güncellendi',
        `${workout.name} hızlı başlat antrenmanı olarak seçildi.`,
      );
    } catch {
      Alert.alert('Hata', 'Hızlı başlat antrenmanı kaydedilemedi.');
    }
  };

  const handleStartQuickWorkout = () => {
    if (!quickStartWorkout) {
      Alert.alert(
        'Hızlı Başlat Seçilmedi',
        'Antrenman kartlarından birini hızlı başlat olarak belirlemelisin.',
      );
      return;
    }

    router.push(`/(tabs)/exercise/workout/${quickStartWorkout.id}`);
  };

  return (
    <Screen
      backgroundColor={C.bg}
      contentStyle={styles.safeArea}
      edges={['top']}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={C.primary}
            colors={[C.primary]}
            onRefresh={handleRefresh}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Egzersiz 👋</Text>
            <Text style={styles.subtitle}>Harekete geç, daha iyi hisset!</Text>
          </View>

          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.85}
          >
            <Ionicons name="notifications-outline" size={22} color={C.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Ionicons name="calendar" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.statLabel}>Bugün</Text>
            <Text style={styles.statValue}>{todayStats.workoutCount}</Text>
            <Text style={styles.statUnit}>Antrenman</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Ionicons name="flame" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.statLabel}>Bugün Yakılan</Text>
            <Text style={styles.statValue}>{todayStats.totalCalories}</Text>
            <Text style={styles.statUnit}>kcal</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Ionicons name="time" size={18} color="#FFFFFF" />
            </View>
            <Text style={styles.statLabel}>Bugün Süre</Text>
            <Text style={styles.statValue}>{todayStats.totalMinutes}</Text>
            <Text style={styles.statUnit}>dk</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={C.primary} />
          </View>
        ) : null}

        {!loading ? (
          <View style={styles.quickStartCard}>
            <View style={styles.quickStartContent}>
              <Text style={styles.quickStartLabel}>Hızlı Başlat</Text>

              {quickStartWorkout ? (
                <>
                  <Text style={styles.quickStartTitle} numberOfLines={1}>
                    {quickStartWorkout.name}
                  </Text>

                  <View style={styles.quickStartMetaRow}>
                    <View style={styles.inlineMeta}>
                      <Ionicons name="time-outline" size={15} color="#5E8E2E" />
                      <Text style={styles.inlineMetaText}>
                        {quickStartWorkout.duration}
                      </Text>
                    </View>

                    <View style={styles.inlineMeta}>
                      <Ionicons name="flame" size={15} color={C.orange} />
                      <Text style={styles.inlineMetaText}>
                        {quickStartWorkout.calories}
                      </Text>
                    </View>

                    <View style={styles.quickStartDifficultyPill}>
                      <Text style={styles.quickStartDifficultyText}>
                        {quickStartWorkout.difficulty}
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.quickStartTitle}>
                    Henüz hızlı başlat seçilmedi
                  </Text>
                  <Text style={styles.quickStartEmptyText}>
                    Aşağıdaki antrenmanlardan birini “Hızlı Başlat Yap” ile
                    seçebilirsin.
                  </Text>
                </>
              )}

              <TouchableOpacity
                style={[
                  styles.quickStartButton,
                  !quickStartWorkout && styles.quickStartButtonDisabled,
                ]}
                activeOpacity={0.9}
                onPress={handleStartQuickWorkout}
              >
                <Ionicons name="play" size={16} color="#FFFFFF" />
                <Text style={styles.quickStartButtonText}>Başla</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quickStartVisual}>
              <View style={styles.visualCircleLarge} />
              <View style={styles.visualCircleSmall} />
              <View style={styles.visualIconBox}>
                <Ionicons
                  name={
                    quickStartWorkout
                      ? getWorkoutIcon(quickStartWorkout.type)
                      : 'flash'
                  }
                  size={40}
                  color="#FFFFFF"
                />
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={C.muted} />

          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Antrenman ara..."
            placeholderTextColor="#A1A1AA"
            style={styles.searchInput}
          />

          {searchQuery.trim() ? (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              activeOpacity={0.8}
              style={styles.searchIconButton}
            >
              <Ionicons name="close-circle" size={18} color={C.muted} />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={[
              styles.favoriteFilterButton,
              showFavoritesOnly && styles.favoriteFilterButtonActive,
            ]}
            onPress={() => setShowFavoritesOnly((prev) => !prev)}
            activeOpacity={0.85}
          >
            <Ionicons
              name={showFavoritesOnly ? 'heart' : 'heart-outline'}
              size={20}
              color={showFavoritesOnly ? '#FFFFFF' : C.orange}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.categoryHeader}>
          <Text style={styles.sectionTitle}>Kategoriler</Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setSelectedCategory('ALL')}
          >
            <Text style={styles.seeAllText}>Tümü</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {categoryItems.map((category) => {
            const isAll = category === 'ALL';
            const isActive = selectedCategory === category;

            const colors = isAll
              ? {
                  cardBg: C.primarySoft,
                  accent: '#5E8E2E',
                }
              : getWorkoutColors(category);

            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  { backgroundColor: colors.cardBg },
                  isActive && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={isAll ? 'grid' : getWorkoutIcon(category)}
                  size={18}
                  color={colors.accent}
                />

                <Text
                  style={[styles.categoryChipText, { color: colors.accent }]}
                >
                  {isAll ? 'Tümü' : getCategoryLabel(category)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'ALL'
              ? 'Antrenmanlarım'
              : `${getCategoryLabel(selectedCategory)} Antrenmanları`}
          </Text>

          <TouchableOpacity
            style={styles.newWorkoutButton}
            onPress={() => setIsCreateModalOpen(true)}
            activeOpacity={0.9}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.newWorkoutButtonText}>Yeni</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.list}>
          {!loading && filteredWorkouts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="fitness-outline" size={30} color={C.muted} />
              <Text style={styles.emptyTitle}>
                {searchQuery.trim()
                  ? 'Aramana uygun antrenman yok'
                  : selectedCategory === 'ALL'
                    ? 'Henüz antrenman yok'
                    : 'Bu kategoride antrenman yok'}
              </Text>
            </View>
          ) : null}

          {filteredWorkouts.map((workout) => {
            const colors = getWorkoutColors(workout.type);
            const favoriteDisabled = favoriteUpdatingId === workout.id;

            return (
              <TouchableOpacity
                key={workout.id}
                style={[styles.workoutCard, { backgroundColor: colors.cardBg }]}
                activeOpacity={0.92}
                onPress={() =>
                  router.push(`/(tabs)/exercise/workout/${workout.id}`)
                }
              >
                <View
                  style={[styles.iconBox, { backgroundColor: colors.iconBg }]}
                >
                  <Ionicons
                    name={getWorkoutIcon(workout.type)}
                    size={28}
                    color="#FFFFFF"
                  />
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.workoutName} numberOfLines={1}>
                      {workout.name}
                    </Text>

                    <TouchableOpacity
                      style={[
                        styles.favoriteButton,
                        favoriteUpdatingId === workout.id &&
                          styles.favoriteButtonDisabled,
                      ]}
                      activeOpacity={0.85}
                      disabled={favoriteUpdatingId === workout.id}
                      onPress={(event) => {
                        event.stopPropagation();
                        handleToggleFavorite(workout);
                      }}
                    >
                      <Ionicons
                        name={workout.isFavorite ? 'heart' : 'heart-outline'}
                        size={21}
                        color={workout.isFavorite ? C.orange : C.muted}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.badgeRow}>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>
                        {getCategoryLabel(workout.type)}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.difficultyBadge,
                        getDifficultyStyle(workout.difficulty),
                      ]}
                    >
                      <Text style={styles.difficultyBadgeText}>
                        {workout.difficulty}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.workoutMetaRow}>
                    <View style={styles.workoutMetaItem}>
                      <Ionicons name="time-outline" size={14} color={C.muted} />
                      <Text style={styles.workoutMeta}>{workout.duration}</Text>
                    </View>

                    <View style={styles.workoutMetaItem}>
                      <Ionicons
                        name="flame-outline"
                        size={14}
                        color={C.muted}
                      />
                      <Text style={styles.workoutMeta}>{workout.calories}</Text>
                    </View>

                    <View style={styles.workoutMetaItem}>
                      <Ionicons name="walk-outline" size={14} color={C.muted} />
                      <Text style={styles.workoutMeta}>
                        {workout.exercises.length} hareket
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.setQuickStartButton,
                      String(quickStartWorkoutId) === String(workout.id) &&
                        styles.setQuickStartButtonActive,
                    ]}
                    activeOpacity={0.85}
                    onPress={(event) => {
                      event.stopPropagation();
                      handleSetQuickStartWorkout(workout);
                    }}
                  >
                    <Ionicons
                      name={
                        String(quickStartWorkoutId) === String(workout.id)
                          ? 'flash'
                          : 'flash-outline'
                      }
                      size={13}
                      color={
                        String(quickStartWorkoutId) === String(workout.id)
                          ? '#FFFFFF'
                          : colors.accent
                      }
                    />
                    <Text
                      style={[
                        styles.setQuickStartButtonText,
                        String(quickStartWorkoutId) === String(workout.id) &&
                          styles.setQuickStartButtonTextActive,
                      ]}
                    >
                      {String(quickStartWorkoutId) === String(workout.id)
                        ? 'Hızlı Başlat'
                        : 'Hızlı Başlat Yap'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.cardCta, { borderColor: colors.accent }]}>
                  <Ionicons name="play" size={14} color={colors.accent} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setIsCreateModalOpen(true)}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>

      <CreateWorkoutModal
        visible={isCreateModalOpen}
        exerciseOptions={exerciseOptions}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateWorkout}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.bg,
  },
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 96,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingWrap: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: C.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: C.muted,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
    minHeight: 104,
  },
  statIconBox: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    color: C.muted,
    fontWeight: '700',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 22,
    color: C.text,
    fontWeight: '900',
  },
  statUnit: {
    fontSize: 12,
    color: C.muted,
    fontWeight: '600',
  },
  quickStartCard: {
    minHeight: 142,
    borderRadius: 24,
    backgroundColor: C.primarySoft,
    padding: 18,
    marginBottom: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DDEDBA',
  },
  quickStartContent: {
    flex: 1,
    zIndex: 2,
  },
  quickStartLabel: {
    fontSize: 13,
    color: '#5F6F3A',
    fontWeight: '900',
    marginBottom: 5,
  },
  quickStartTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: C.text,
    marginBottom: 9,
  },
  quickStartEmptyText: {
    fontSize: 13,
    lineHeight: 18,
    color: C.muted,
    fontWeight: '700',
    marginBottom: 12,
    maxWidth: 240,
  },
  quickStartMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  inlineMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inlineMetaText: {
    fontSize: 13,
    color: C.text,
    fontWeight: '800',
  },
  quickStartDifficultyPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#43B047',
  },
  quickStartDifficultyText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  quickStartButton: {
    width: 132,
    height: 40,
    borderRadius: 999,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  quickStartButtonDisabled: {
    opacity: 0.55,
  },
  quickStartButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
  },
  quickStartVisual: {
    width: 118,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visualCircleLarge: {
    position: 'absolute',
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: 'rgba(168, 200, 90, 0.22)',
    right: -18,
    bottom: -20,
  },
  visualCircleSmall: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(168, 200, 90, 0.25)',
    top: 10,
    right: 8,
  },
  visualIconBox: {
    width: 74,
    height: 74,
    borderRadius: 24,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    height: 50,
    borderRadius: 18,
    paddingLeft: 14,
    paddingRight: 8,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: C.text,
    fontWeight: '600',
    padding: 0,
    borderWidth: 0,
    outlineStyle: 'none' as any,
  },
  searchIconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeader: {
    marginTop: 18,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: C.text,
  },
  seeAllText: {
    color: '#5E8E2E',
    fontWeight: '800',
  },
  categoryList: {
    gap: 10,
    paddingRight: 20,
  },
  favoriteFilterButton: {
    width: 38,
    height: 38,
    borderRadius: 15,
    backgroundColor: '#FFF0EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  favoriteFilterButtonActive: {
    backgroundColor: C.orange,
  },
  categoryChip: {
    height: 44,
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    borderColor: C.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '800',
  },
  newWorkoutButton: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: C.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  newWorkoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  list: {
    gap: 12,
  },
  workoutCard: {
    borderRadius: 22,
    padding: 12,
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 7,
  },
  workoutName: {
    flex: 1,
    fontSize: 15,
    color: C.text,
    fontWeight: '900',
  },
  favoriteButton: {
    width: 34,
    height: 34,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButtonDisabled: {
    opacity: 0.55,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: C.purple,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  easyBadge: {
    backgroundColor: '#DCFCE7',
  },
  mediumBadge: {
    backgroundColor: '#FEF3C7',
  },
  hardBadge: {
    backgroundColor: '#FEE2E2',
  },
  difficultyBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#374151',
  },
  workoutMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  workoutMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workoutMeta: {
    fontSize: 12,
    color: C.muted,
    fontWeight: '700',
  },
  setQuickStartButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  setQuickStartButtonActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  setQuickStartButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: C.text,
  },
  setQuickStartButtonTextActive: {
    color: '#FFFFFF',
  },
  cardCta: {
    width: 50,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 22,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  emptyCard: {
    backgroundColor: C.card,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: C.text,
    marginTop: 8,
  },
});