import React, { useCallback, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
 StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const STORAGE_KEY = 'nutrition_meals';

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
};

const summary = {
  consumed: 1630,
  target: 2000,
  carbs: { value: 45, target: 60 },
  protein: { value: 85, target: 120 },
  fat: { value: 35, target: 50 },
};

const initialMeals = [
  {
    key: 'breakfast',
    title: 'Kahvaltı',
    consumed: 450,
    target: 500,
    bg: '#EEF5DE',
    border: '#A8C85A',
    accent: '#A8C85A',
    foods: ['Yumurta', 'Avokado', 'Tam buğday ekmeği'],
  },
  {
    key: 'lunch',
    title: 'Öğle',
    consumed: 620,
    target: 700,
    bg: '#FFF4DA',
    border: '#F2CF7B',
    accent: '#F2CF7B',
    foods: ['Tavuk salatası', 'Quinoa', 'Sebzeler'],
  },
  {
    key: 'dinner',
    title: 'Akşam',
    consumed: 380,
    target: 600,
    bg: '#F0EDFA',
    border: '#C9C3EA',
    accent: '#C9C3EA',
    foods: ['Somon', 'Buharda sebze'],
  },
  {
    key: 'snack',
    title: 'Atıştırma',
    consumed: 180,
    target: 200,
    bg: '#FDE5DA',
    border: '#FFB38F',
    accent: '#FF6B1A',
    foods: ['Badem', 'Meyve'],
  },
];

type Meal = {
  key: string;
  title: string;
  consumed: number;
  target: number;
  bg: string;
  border: string;
  accent: string;
  foods: string[];
};

async function getStoredMeals(): Promise<Meal[]> {
  const rawMeals = await AsyncStorage.getItem(STORAGE_KEY);

  if (!rawMeals) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialMeals));
    return initialMeals;
  }

  return JSON.parse(rawMeals) as Meal[];
}

function ProgressBar({
  progress,
  color = COLORS.primary,
  trackColor = COLORS.primaryLight,
  height = 8,
}: {
  progress: number;
  color?: string;
  trackColor?: string;
  height?: number;
}) {
  return (
    <View style={[styles.progressTrack, { backgroundColor: trackColor, height }]}>
      <View
        style={[
          styles.progressFill,
          {
            backgroundColor: color,
            width: `${Math.min(progress * 100, 100)}%`,
            height,
          },
        ]}
      />
    </View>
  );
}

function MacroCard({
  value,
  target,
  label,
  color,
  bg,
}: {
  value: number;
  target: number;
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <View style={[styles.macroCard, { backgroundColor: bg, borderColor: color }]}>
      <Text style={[styles.macroValue, { color }]}>{value}g</Text>
      <Text style={styles.macroTarget}>/ {target}g</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

function FoodTag({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <View style={styles.foodTag}>
      <Text style={styles.foodTagText}>{label}</Text>

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.foodTagRemoveButton}
        onPress={onRemove}
      >
        <Ionicons name='close' size={12} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

function MealCard({
  mealKey,
  title,
  consumed,
  target,
  bg,
  border,
  accent,
  foods,
  onRemoveFood,
}: {
  mealKey: string;
  title: string;
  consumed: number;
  target: number;
  bg: string;
  border: string;
  accent: string;
  foods: string[];
  onRemoveFood: (mealKey: string, food: string) => void;
}) {
  return (
    <View style={[styles.mealCard, { backgroundColor: bg, borderColor: border }]}>
      <View style={styles.mealHeader}>
        <View>
          <Text style={styles.mealTitle}>{title}</Text>
          <Text style={styles.mealCalories}>
            <Text style={{ color: accent }}>{consumed} kcal</Text>
            <Text style={styles.mealCaloriesMuted}> / {target} kcal</Text>
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.addIconButton, { backgroundColor: accent }]}
          onPress={() => router.push(`/nutrition/add-meal?meal=${mealKey}`)}
        >
          <Ionicons name='add' size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ProgressBar progress={consumed / target} />

      <View style={styles.foodTagsWrap}>
        {foods.length > 0 ? (
          foods.map((food, index) => (
            <FoodTag
              key={`${food}-${index}`}
              label={food}
              onRemove={() => onRemoveFood(mealKey, food)}
            />
          ))
        ) : (
          <Text style={styles.emptyFoodsText}>Henüz besin eklenmedi</Text>
        )}
      </View>
    </View>
  );
}

export default function NutritionScreen() {
  const [meals, setMeals] = useState<Meal[]>(initialMeals);

  const remaining = summary.target - summary.consumed;
  const completion = Math.round((summary.consumed / summary.target) * 100);

  const loadMeals = useCallback(async () => {
    try {
      const storedMeals = await getStoredMeals();
      setMeals(storedMeals);
    } catch (error) {
      console.log('Öğünler yüklenemedi:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, [loadMeals]),
  );

  const handleRemoveFood = async (mealKey: string, foodToRemove: string) => {
    try {
      const updatedMeals = meals.map((meal) =>
        meal.key === mealKey
          ? {
              ...meal,
              foods: meal.foods.filter((food) => food !== foodToRemove),
            }
          : meal,
      );

      setMeals(updatedMeals);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMeals));
    } catch (error) {
      console.log("Besin silinemedi:", error);
    }
  };

  const visibleMeals = useMemo(() => meals, [meals]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} activeOpacity={0.85}>
            <Ionicons name='chevron-back' size={20} color={COLORS.text} />
          </TouchableOpacity>

          <View>
            <Text style={styles.title}>Beslenme</Text>
            <Text style={styles.subtitle}>Bugün 16 Ocak</Text>
          </View>
        </View>

        <View style={styles.calorieCard}>
          <Text style={styles.calorieTitle}>Günlük Kalori</Text>

          <View style={styles.calorieValueRow}>
            <Text style={styles.calorieValue}>{summary.consumed.toLocaleString('tr-TR')}</Text>
            <Text style={styles.calorieTarget}>
              {' '}
              / {summary.target.toLocaleString('tr-TR')} kcal
            </Text>
          </View>

          <ProgressBar progress={summary.consumed / summary.target} />

          <View style={styles.calorieFooter}>
            <Text style={styles.calorieFooterText}>Kalan: {remaining} kcal</Text>
            <Text style={styles.calorieFooterText}>%{completion} tamamlandı</Text>
          </View>
        </View>

        <View style={styles.macroRow}>
          <MacroCard
            value={summary.carbs.value}
            target={summary.carbs.target}
            label='Karbonhidrat'
            color={COLORS.green}
            bg={COLORS.greenSoft}
          />
          <MacroCard
            value={summary.protein.value}
            target={summary.protein.target}
            label='Protein'
            color={COLORS.primary}
            bg={COLORS.purpleSoft}
          />
          <MacroCard
            value={summary.fat.value}
            target={summary.fat.target}
            label='Yağ'
            color={COLORS.yellow}
            bg={COLORS.yellowSoft}
          />
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.outlineAction}
            activeOpacity={0.85}
            onPress={() => router.push('/nutrition/add-meal')}
          >
            <Ionicons name='add' size={18} color={COLORS.primary} />
            <Text style={styles.outlineActionText}>Besin Ekle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.photoAction}
            activeOpacity={0.85}
            onPress={() => router.push('/nutrition/scan')}
          >
            <Ionicons name='camera-outline' size={18} color={COLORS.orange} />
            <Text style={styles.photoActionText}>Foto Kalori</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mealsWrap}>
          {visibleMeals.map(({ key, ...meal }) => (
            <MealCard
              key={key}
              mealKey={key}
              onRemoveFood={handleRemoveFood}
              {...meal}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 120,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF1E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 31,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 15,
    color: '#4E535F',
  },

  calorieCard: {
    backgroundColor: '#F2F1F6',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#DED9ED',
    marginBottom: 18,
  },
  calorieTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  calorieValueRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: 18,
  },
  calorieValue: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.green,
  },
  calorieTarget: {
    fontSize: 18,
    fontWeight: '600',
    color: '#747B89',
  },
  calorieFooter: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calorieFooterText: {
    fontSize: 13,
    color: '#6E7380',
    fontWeight: '500',
  },

  progressTrack: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 999,
  },

  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 18,
  },
  macroCard: {
    flex: 1,
    minHeight: 118,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  macroTarget: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7A8090',
    marginBottom: 14,
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#464C59',
    textAlign: 'center',
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  outlineAction: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#BDB6DA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FAF9FE',
  },
  outlineActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  photoAction: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: '#F2B29E',
    backgroundColor: '#FFF1EA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.orange,
  },

  mealsWrap: {
    gap: 16,
  },
  mealCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  mealTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  mealCalories: {
    fontSize: 17,
    fontWeight: '700',
  },
  mealCaloriesMuted: {
    color: '#7C8290',
    fontWeight: '600',
  },
  addIconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  foodTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  foodTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: 999,
    gap: 6,
  },
  foodTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5D6380',
  },
  foodTagRemoveButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyFoodsText: {
    fontSize: 13,
    color: '#7E8695',
    fontWeight: '500',
  },
});