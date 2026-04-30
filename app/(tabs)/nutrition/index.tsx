import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { CalendarDays, Camera, Plus, Trash2, X } from 'lucide-react-native';

import {
  deleteMealItem,
  getMealsByDate,
  getNutritionSummary,
  type MealItem,
  type NutritionMeal,
  type NutritionSummary,
  type NutritionTargets,
} from '@/api/nutrition';
import Screen from '@/components/Screen';

const COLORS = {
  background: '#F8F6EC',
  text: '#1F2430',
  muted: '#7E8695',
  primary: '#5E578F',
  primaryLight: '#D8D4E8',
  green: '#A8C85A',
  greenSoft: '#EEF5DE',
  yellow: '#F2CF7B',
  yellowSoft: '#FFF4DA',
  purple: '#C9C3EA',
  purpleSoft: '#F0EDFA',
  orange: '#FF6B1A',
  orangeSoft: '#FDE5DA',
  border: '#E6E2F0',
  white: '#FFFFFF',
  danger: '#E25555',
};

const DEFAULT_TARGETS: NutritionTargets = {
  calories: 2000,
  protein: 120,
  carbs: 240,
  fat: 70,
};

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function formatDisplayDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function formatMealType(type: string) {
  switch (type) {
    case 'BREAKFAST':
      return 'Kahvaltı';
    case 'LUNCH':
      return 'Öğle';
    case 'DINNER':
      return 'Akşam';
    case 'SNACK':
      return 'Ara Öğün';
    default:
      return type;
  }
}

function groupMealsByType(meals: NutritionMeal[]) {
  return {
    BREAKFAST: meals.filter((meal) => meal.mealType === 'BREAKFAST'),
    LUNCH: meals.filter((meal) => meal.mealType === 'LUNCH'),
    DINNER: meals.filter((meal) => meal.mealType === 'DINNER'),
    SNACK: meals.filter((meal) => meal.mealType === 'SNACK'),
  };
}

function getMealTypeRouteValue(
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK',
) {
  switch (mealType) {
    case 'BREAKFAST':
      return 'breakfast';
    case 'LUNCH':
      return 'lunch';
    case 'DINNER':
      return 'dinner';
    case 'SNACK':
      return 'snack';
    default:
      return 'breakfast';
  }
}

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function formatInt(value: number) {
  const v = Number(value ?? 0);
  return Number.isFinite(v) ? String(Math.round(v)) : '0';
}

type SummaryCardProps = {
  title: string;
  value: string;
  unit: string;
  bgColor: string;
  valueColor: string;
};

function SummaryCard({
  title,
  value,
  unit,
  bgColor,
  valueColor,
}: SummaryCardProps) {
  return (
    <View style={[styles.summaryCard, { backgroundColor: bgColor }]}>
      <Text style={[styles.summaryValue, { color: valueColor }]}>{value}</Text>
      <Text style={styles.summaryUnit}>{unit}</Text>
      <Text style={styles.summaryTitle}>{title}</Text>
    </View>
  );
}

function ProgressBar({ progress, color }: { progress: number; color: string }) {
  const width = `${Math.round(clamp01(progress) * 100)}%` as const;

  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { backgroundColor: color, width }]} />
    </View>
  );
}

function getMealTargetCalories(
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK',
  dailyTarget: number,
) {
  const target = Math.max(0, Number(dailyTarget ?? 0));
  const ratio =
    mealType === 'BREAKFAST'
      ? 0.25
      : mealType === 'LUNCH'
        ? 0.35
        : mealType === 'DINNER'
          ? 0.3
          : 0.1;

  return Math.max(1, Math.round(target * ratio));
}

function mealItemChips(meals: NutritionMeal[], limit = 12) {
  const chips: Array<{ name: string; itemId: string | number; mealId: number }> = [];

  for (const meal of meals) {
    for (const item of meal.items) {
      const name = String(item.foodName ?? '').trim();
      if (!name) continue;
      if (item.id === undefined || item.id === null) continue;
      chips.push({ name, itemId: item.id, mealId: meal.id });
      if (chips.length >= limit) return chips;
    }
  }
  return chips;
}

function removeMealItemFromMeals(meals: NutritionMeal[], itemId: number | string) {
  const targetId = String(itemId);

  return meals
    .map((meal) => {
      const nextItems = meal.items.filter((item) => String(item.id) !== targetId);
      if (nextItems.length === meal.items.length) return meal;

      const totalCalories = nextItems.reduce((sum, item) => sum + Number(item.caloriesKcal ?? 0), 0);
      const totalProtein = nextItems.reduce((sum, item) => sum + Number(item.proteinG ?? 0), 0);
      const totalCarbs = nextItems.reduce((sum, item) => sum + Number(item.carbsG ?? 0), 0);
      const totalFat = nextItems.reduce((sum, item) => sum + Number(item.fatG ?? 0), 0);

      return {
        ...meal,
        items: nextItems,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
      };
    })
    .filter((meal) => meal.items.length > 0);
}

function TargetsCard({
  summary,
  targets,
}: {
  summary: NutritionSummary;
  targets: NutritionTargets;
}) {
  const calProgress = (summary.calories ?? 0) / Math.max(1, targets.calories);
  const pProgress = (summary.protein ?? 0) / Math.max(1, targets.protein);
  const cProgress = (summary.carbs ?? 0) / Math.max(1, targets.carbs);
  const fProgress = (summary.fat ?? 0) / Math.max(1, targets.fat);

  return (
    <View style={styles.targetsCard}>
      <View style={styles.targetsHeaderRow}>
        <Text style={styles.targetsTitle}>Günlük Özet</Text>
        <Text style={styles.targetsSubtitle}>Alınan / Hedef</Text>
      </View>

      <View style={styles.targetRow}>
        <View style={styles.targetRowTop}>
          <Text style={styles.targetLabel}>Kalori</Text>
          <Text style={styles.targetValue}>
            {formatInt(summary.calories)} / {formatInt(targets.calories)} kcal
          </Text>
        </View>
        <ProgressBar progress={calProgress} color={COLORS.green} />
      </View>

      <View style={styles.macroGrid}>
        <View style={styles.macroCard}>
          <Text style={styles.macroLabel}>Protein</Text>
          <Text style={styles.macroValue}>
            {formatInt(summary.protein)} / {formatInt(targets.protein)} g
          </Text>
          <ProgressBar progress={pProgress} color="#5A97F0" />
        </View>
        <View style={styles.macroCard}>
          <Text style={styles.macroLabel}>Karbonhidrat</Text>
          <Text style={styles.macroValue}>
            {formatInt(summary.carbs)} / {formatInt(targets.carbs)} g
          </Text>
          <ProgressBar progress={cProgress} color="#E56F2D" />
        </View>
        <View style={styles.macroCard}>
          <Text style={styles.macroLabel}>Yağ</Text>
          <Text style={styles.macroValue}>
            {formatInt(summary.fat)} / {formatInt(targets.fat)} g
          </Text>
          <ProgressBar progress={fProgress} color="#8C80E8" />
        </View>
      </View>
    </View>
  );
}

function MealItemRow({ item }: { item: MealItem }) {
  return (
    <View style={styles.itemRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName}>{item.foodName}</Text>
        <Text style={styles.itemMeta}>
          {item.quantity} porsiyon
          {item.amountG ? ` • ${item.amountG} g` : ''}
          {' • '}
          {item.caloriesKcal} kcal
        </Text>
        <Text style={styles.itemMacros}>
          P: {item.proteinG}g • K: {item.carbsG}g • Y: {item.fatG}g
        </Text>
      </View>
    </View>
  );
}

function MealSection({
  title,
  mealType,
  meals,
  onDeleteMealItem,
  bg,
  border,
  accent,
  dailyTargetCalories,
}: {
  title: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  meals: NutritionMeal[];
  onDeleteMealItem: (id: number | string) => void;
  bg: string;
  border: string;
  accent: string;
  dailyTargetCalories: number;
}) {
  const totalCalories = meals.reduce((sum, meal) => sum + meal.totalCalories, 0);
  const targetCalories = getMealTargetCalories(mealType, dailyTargetCalories);
  const chips = mealItemChips(meals, 12);
  const progress = totalCalories / Math.max(1, targetCalories);

  return (
    <View style={[styles.mealSectionCard, { backgroundColor: bg, borderColor: border }]}>
      <View style={styles.mealSectionHeader}>
        <View>
          <Text style={styles.mealSectionTitle}>{title}</Text>
          <Text style={styles.mealSectionCalories}>
            <Text style={{ color: accent, fontWeight: '900' }}>{totalCalories} kcal</Text>
            <Text style={styles.mealSectionCaloriesMuted}> / {targetCalories} kcal</Text>
          </Text>
        </View>

        <Pressable
          style={[styles.addMiniButton, { backgroundColor: accent }]}
          onPress={() =>
            router.push({
              pathname: '/nutrition/add-meal',
              params: { mealType },
            })
          }
        >
          <Plus size={16} color="#FFFFFF" strokeWidth={2.4} />
        </Pressable>
      </View>

      <ProgressBar progress={progress} color={accent} />

      {chips.length > 0 ? (
        <View style={styles.chipRow}>
          {chips.map((chip) => (
            <View key={`${mealType}-${chip.mealId}-${chip.itemId}-${chip.name}`} style={styles.chip}>
              <Text style={styles.chipText} numberOfLines={1}>
                {chip.name}
              </Text>
              <Pressable
                onPress={() => onDeleteMealItem(chip.itemId)}
                hitSlop={10}
                style={styles.chipDelete}
              >
                <X size={14} color={COLORS.danger} strokeWidth={2.6} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      {meals.length === 0 ? <Text style={styles.emptyText}>Bu öğün için kayıt yok.</Text> : null}
    </View>
  );
}

export default function NutritionScreen() {
  const [date] = useState(getTodayDate());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [meals, setMeals] = useState<NutritionMeal[]>([]);
  const [summary, setSummary] = useState<NutritionSummary>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [targets, setTargets] = useState<NutritionTargets>({
    ...DEFAULT_TARGETS,
  });

  const groupedMeals = useMemo(() => groupMealsByType(meals), [meals]);

  const loadData = useCallback(async () => {
    try {
      const [mealsData, summaryData] = await Promise.all([
        getMealsByDate(date),
        getNutritionSummary(date),
      ]);

      setMeals(mealsData);
      setSummary(summaryData);
      setTargets(summaryData.targets ?? DEFAULT_TARGETS);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Beslenme verileri alınamadı.';
      Alert.alert('Hata', message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [date]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const handleDeleteMealItem = async (id: number | string) => {
    const previousMeals = meals;
    setMeals((prev) => removeMealItemFromMeals(prev, id));
    try {
      await deleteMealItem(id);
      await loadData();
    } catch (error) {
      setMeals(previousMeals);
      const message = error instanceof Error ? error.message : 'Besin silinemedi.';
      Alert.alert('Hata', message);
    }
  };

  if (loading) {
    return (
      <Screen backgroundColor={COLORS.background} contentStyle={styles.loadingWrap}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </Screen>
    );
  }

  return (
    <Screen backgroundColor={COLORS.background} contentStyle={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Beslenme</Text>
            <View style={styles.dateRow}>
              <CalendarDays size={16} color={COLORS.muted} strokeWidth={2} />
              <Text style={styles.subtitle}>{formatDisplayDate(date)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={styles.primaryAction}
            onPress={() => router.push('/nutrition/add-meal')}
          >
            <Plus size={18} color={COLORS.white} strokeWidth={2.5} />
            <Text style={styles.primaryActionText}>Besin Ekle</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryAction}
            onPress={() => router.push('/nutrition/scan')}
          >
            <Camera size={18} color={COLORS.primary} strokeWidth={2.3} />
            <Text style={styles.secondaryActionText}>Foto Kalori</Text>
          </Pressable>
        </View>

        <TargetsCard summary={summary} targets={targets} />

        <View style={styles.summaryGrid}>
          <SummaryCard
            title="Kalori"
            value={String(summary.calories ?? 0)}
            unit="kcal"
            bgColor={COLORS.greenSoft}
            valueColor="#94AE3C"
          />
          <SummaryCard
            title="Protein"
            value={String(summary.protein ?? 0)}
            unit="g"
            bgColor="#EAF3FF"
            valueColor="#5A97F0"
          />
          <SummaryCard
            title="Karbonhidrat"
            value={String(summary.carbs ?? 0)}
            unit="g"
            bgColor={COLORS.orangeSoft}
            valueColor="#E56F2D"
          />
          <SummaryCard
            title="Yağ"
            value={String(summary.fat ?? 0)}
            unit="g"
            bgColor={COLORS.purpleSoft}
            valueColor="#8C80E8"
          />
        </View>

        <View style={styles.mealsWrap}>
          <MealSection
            title="Kahvaltı"
            mealType="BREAKFAST"
            meals={groupedMeals.BREAKFAST}
            onDeleteMealItem={handleDeleteMealItem}
            bg={COLORS.greenSoft}
            border="rgba(168, 200, 90, 0.35)"
            accent={COLORS.green}
            dailyTargetCalories={targets.calories}
          />
          <MealSection
            title="Öğle"
            mealType="LUNCH"
            meals={groupedMeals.LUNCH}
            onDeleteMealItem={handleDeleteMealItem}
            bg={COLORS.yellowSoft}
            border="rgba(242, 207, 123, 0.42)"
            accent={COLORS.yellow}
            dailyTargetCalories={targets.calories}
          />
          <MealSection
            title="Akşam"
            mealType="DINNER"
            meals={groupedMeals.DINNER}
            onDeleteMealItem={handleDeleteMealItem}
            bg={COLORS.purpleSoft}
            border="rgba(201, 195, 234, 0.55)"
            accent={COLORS.purple}
            dailyTargetCalories={targets.calories}
          />
          <MealSection
            title="Ara Öğün"
            mealType="SNACK"
            meals={groupedMeals.SNACK}
            onDeleteMealItem={handleDeleteMealItem}
            bg={COLORS.orangeSoft}
            border="rgba(255, 107, 26, 0.22)"
            accent={COLORS.orange}
            dailyTargetCalories={targets.calories}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 120,
  },

  header: {
    marginBottom: 18,
  },
  title: {
    fontSize: 31,
    fontWeight: '800',
    color: COLORS.text,
  },
  dateRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#4E535F',
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  primaryAction: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.white,
  },
  secondaryAction: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E4E0EF',
    backgroundColor: '#F4F2FA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryActionText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },

  targetsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 18,
  },
  targetsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
    gap: 10,
  },
  targetsTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
  },
  targetsSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.muted,
  },
  targetRow: {
    marginBottom: 14,
  },
  targetRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
    gap: 10,
  },
  targetLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  targetValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  macroCard: {
    flexGrow: 1,
    flexBasis: '48%',
    minWidth: 150,
    backgroundColor: '#FAF9FD',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ECE8F5',
    padding: 12,
    gap: 6,
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },
  macroValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6E7483',
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#EFEAF6',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    width: '48.2%',
    minHeight: 126,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 10,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  summaryUnit: {
    fontSize: 14,
    color: '#6F7685',
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },

  mealsWrap: {
    gap: 16,
  },
  mealSectionCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
  },
  mealSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  mealSectionTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  mealSectionCalories: {
    fontSize: 16,
    fontWeight: '700',
  },
  mealSectionCaloriesMuted: {
    color: '#7C8290',
    fontWeight: '800',
  },
  addMiniButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  emptyText: {
    fontSize: 15,
    color: '#7A8090',
    marginTop: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
    marginBottom: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderRadius: 999,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    maxWidth: '100%',
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#5C568E',
    maxWidth: 150,
  },
  chipDelete: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(226, 85, 85, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    zIndex: 2,
  },

  loggedMealCard: {
    marginTop: 12,
    backgroundColor: '#FAF9FD',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECE8F5',
  },
  loggedMealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  loggedMealTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  loggedMealSubtitle: {
    fontSize: 13,
    color: '#6E7483',
    fontWeight: '600',
    lineHeight: 18,
  },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF1F1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  itemsWrap: {
    gap: 10,
  },
  itemRow: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEEAF6',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 13,
    color: '#6E7483',
    marginBottom: 4,
  },
  itemMacros: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
});
