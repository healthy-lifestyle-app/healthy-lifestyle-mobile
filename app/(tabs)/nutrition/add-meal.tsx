import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'nutrition_meals';

const COLORS = {
  background: '#F8F6EC',
  overlay: 'rgba(28, 24, 45, 0.18)',
  sheet: '#F8F7FB',
  text: '#222532',
  muted: '#7C8393',
  primary: '#5E578F',
  border: '#E3DEEF',
  green: '#A8C85A',
  greenSoft: '#EEF5DE',
  yellow: '#F2CF7B',
  yellowSoft: '#FFF4DA',
  purple: '#C9C3EA',
  purpleSoft: '#F0EDFA',
  orange: '#FF6B1A',
  orangeSoft: '#FDE5DA',
  white: '#FFFFFF',
};

const mealOptions = [
  { key: 'breakfast', label: 'Kahvaltı', color: COLORS.green, bg: COLORS.greenSoft },
  { key: 'lunch', label: 'Öğle', color: COLORS.yellow, bg: COLORS.yellowSoft },
  { key: 'dinner', label: 'Akşam', color: '#B7B1E2', bg: COLORS.purpleSoft },
  { key: 'snack', label: 'Atıştırma', color: COLORS.orange, bg: COLORS.orangeSoft },
];

const defaultMeals = [
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

const foodLibraryByMeal: Record<string, { id: string; name: string; kcal: number }[]> = {
  breakfast: [
    { id: '1', name: 'Yumurta', kcal: 155 },
    { id: '2', name: 'Avokado', kcal: 160 },
    { id: '3', name: 'Tam buğday ekmeği', kcal: 80 },
    { id: '4', name: 'Tavuk göğsü', kcal: 165 },
    { id: '5', name: 'Somon', kcal: 208 },
    { id: '6', name: 'Quinoa', kcal: 120 },
    { id: '7', name: 'Brokoli', kcal: 55 },
    { id: '8', name: 'Badem', kcal: 160 },
    { id: '9', name: 'Yoğurt', kcal: 100 },
    { id: '10', name: 'Elma', kcal: 95 },
  ],
  lunch: [
    { id: '11', name: 'Tavuk salatası', kcal: 220 },
    { id: '12', name: 'Quinoa', kcal: 120 },
    { id: '13', name: 'Sebzeler', kcal: 60 },
    { id: '14', name: 'Yoğurt', kcal: 100 },
    { id: '15', name: 'Pirinç', kcal: 130 },
    { id: '16', name: 'Izgara tavuk', kcal: 185 },
    { id: '17', name: 'Mercimek', kcal: 116 },
    { id: '18', name: 'Ayran', kcal: 75 },
  ],
  dinner: [
    { id: '19', name: 'Somon', kcal: 208 },
    { id: '20', name: 'Buharda sebze', kcal: 90 },
    { id: '21', name: 'Zeytinyağlı salata', kcal: 110 },
    { id: '22', name: 'Yoğurt', kcal: 100 },
    { id: '23', name: 'Çorba', kcal: 140 },
    { id: '24', name: 'Izgara köfte', kcal: 240 },
    { id: '25', name: 'Bulgur', kcal: 150 },
    { id: '26', name: 'Kabuklu badem', kcal: 160 },
  ],
  snack: [
    { id: '27', name: 'Muz', kcal: 105 },
    { id: '28', name: 'Havuç', kcal: 25 },
    { id: '29', name: 'Pirinç', kcal: 130 },
    { id: '30', name: 'Makarna', kcal: 158 },
    { id: '31', name: 'Peynir', kcal: 113 },
    { id: '32', name: 'Süt', kcal: 61 },
    { id: '33', name: 'Portakal', kcal: 62 },
    { id: '34', name: 'Çilek', kcal: 32 },
    { id: '35', name: 'Ceviz', kcal: 185 },
    { id: '36', name: 'Zeytin', kcal: 115 },
  ],
};

export default function AddMealScreen() {
  const params = useLocalSearchParams();
  const mealParam = Array.isArray(params.meal) ? params.meal[0] : params.meal;
  const initialMeal = typeof mealParam === 'string' ? mealParam : '';

  const [selectedMeal, setSelectedMeal] = useState<string | null>(initialMeal || null);
  const [search, setSearch] = useState('');
  const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>([]);

  const selectedMealMeta = mealOptions.find((item) => item.key === selectedMeal);
  const sheetTitle = `${selectedMealMeta?.label ?? 'Öğün'} - Besin Ekle`;

  const foods = useMemo(() => {
    if (!selectedMeal) return [];
    const baseList = foodLibraryByMeal[selectedMeal] ?? [];
    const keyword = search.trim().toLowerCase();

    if (!keyword) return baseList;

    return baseList.filter((food) => food.name.toLowerCase().includes(keyword));
  }, [search, selectedMeal]);

  const selectedFoods = useMemo(() => {
    if (!selectedMeal) return [];
    const allFoods = foodLibraryByMeal[selectedMeal] ?? [];
    return allFoods.filter((food) => selectedFoodIds.includes(food.id));
  }, [selectedFoodIds, selectedMeal]);

  const totalCalories = selectedFoods.reduce((sum, food) => sum + food.kcal, 0);

  const toggleFood = (foodId: string) => {
    setSelectedFoodIds((prev) =>
      prev.includes(foodId)
        ? prev.filter((id) => id !== foodId)
        : [...prev, foodId],
    );
  };

  const handleSelectMeal = (mealKey: string) => {
    setSelectedMeal(mealKey);
    setSelectedFoodIds([]);
    setSearch('');
  };

  const handleAddFoods = async () => {
    if (!selectedMeal || selectedFoods.length === 0) return;

    try {
      const rawMeals = await AsyncStorage.getItem(STORAGE_KEY);
      const currentMeals = rawMeals ? JSON.parse(rawMeals) : defaultMeals;

      const addedFoodNames = selectedFoods.map((food) => food.name);

      const updatedMeals = currentMeals.map((meal: (typeof defaultMeals)[number]) => {
        if (meal.key !== selectedMeal) return meal;

        const mergedFoods = Array.from(new Set([...meal.foods, ...addedFoodNames]));

        return {
          ...meal,
          foods: mergedFoods,
        };
      });

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMeals));
      router.back();
    } catch (error) {
      console.log('Besin eklenemedi:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.backgroundContent}>
          <Text style={styles.fakeTitle}>Beslenme</Text>
          <Text style={styles.fakeSubtitle}>Bugün 16 Ocak</Text>

          <View style={styles.fakeCard} />
          <View style={styles.fakeMacroRow}>
            <View style={styles.fakeMacroCard} />
            <View style={styles.fakeMacroCard} />
            <View style={styles.fakeMacroCard} />
          </View>
        </View>

        <View style={styles.overlay} />

        <View style={styles.sheet}>
          {!selectedMeal ? (
            <>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Hangi Öğüne Eklemek İstersiniz?</Text>

                <TouchableOpacity
                  style={styles.closeButton}
                  activeOpacity={0.85}
                  onPress={() => router.back()}
                >
                  <Ionicons name='close' size={18} color={COLORS.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.mealGrid}>
                {mealOptions.map((meal) => (
                  <TouchableOpacity
                    key={meal.key}
                    activeOpacity={0.88}
                    style={[
                      styles.mealOptionCard,
                      { backgroundColor: meal.bg, borderColor: meal.color },
                    ]}
                    onPress={() => handleSelectMeal(meal.key)}
                  >
                    <Text style={styles.mealOptionText}>{meal.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            <>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{sheetTitle}</Text>

                <TouchableOpacity
                  style={styles.closeButton}
                  activeOpacity={0.85}
                  onPress={() => router.back()}
                >
                  <Ionicons name='close' size={18} color={COLORS.primary} />
                </TouchableOpacity>
              </View>

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder='Besin ara...'
                placeholderTextColor='#9AA1AF'
                style={styles.searchInput}
              />

              <ScrollView
                style={styles.foodList}
                contentContainerStyle={styles.foodListContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.foodGrid}>
                  {foods.map((food) => {
                    const selected = selectedFoodIds.includes(food.id);

                    return (
                      <TouchableOpacity
                        key={food.id}
                        activeOpacity={0.88}
                        style={[
                          styles.foodCard,
                          selected && {
                            borderColor: COLORS.green,
                            backgroundColor: COLORS.white,
                          },
                        ]}
                        onPress={() => toggleFood(food.id)}
                      >
                        {selected && (
                          <View style={styles.checkBadge}>
                            <Ionicons name='checkmark' size={12} color={COLORS.white} />
                          </View>
                        )}

                        <Text style={styles.foodName}>{food.name}</Text>
                        <Text style={styles.foodCalories}>{food.kcal} kcal</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              <View style={styles.bottomInfoRow}>
                <Text style={styles.bottomInfoText}>
                  {selectedFoods.length} besin seçildi
                </Text>
                <Text style={styles.totalText}>Toplam: {totalCalories} kcal</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.88}
                style={[
                  styles.primaryButton,
                  selectedFoods.length === 0 && styles.disabledButton,
                ]}
                disabled={selectedFoods.length === 0}
                onPress={handleAddFoods}
              >
                <Text
                  style={[
                    styles.primaryButtonText,
                    selectedFoods.length === 0 && styles.disabledButtonText,
                  ]}
                >
                  {selectedFoods.length > 0
                    ? `${selectedFoods.length} Besini Ekle`
                    : 'Besin Seç'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screen: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: COLORS.background,
  },

  backgroundContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  fakeTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#222532',
    marginBottom: 4,
  },
  fakeSubtitle: {
    fontSize: 15,
    color: '#555B67',
    marginBottom: 18,
  },
  fakeCard: {
    height: 190,
    borderRadius: 28,
    backgroundColor: '#ECEAF4',
    marginBottom: 16,
  },
  fakeMacroRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fakeMacroCard: {
    flex: 1,
    height: 116,
    borderRadius: 22,
    backgroundColor: '#EEF1E6',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },

  sheet: {
    minHeight: 300,
    maxHeight: '72%',
    backgroundColor: COLORS.sheet,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
    paddingRight: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFEDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mealGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mealOptionCard: {
    width: '47%',
    minHeight: 72,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  mealOptionText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  searchInput: {
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDD9EA',
    backgroundColor: '#FBFAFE',
    paddingHorizontal: 14,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 14,
  },

  foodList: {
    flexGrow: 0,
  },
  foodListContent: {
    paddingBottom: 12,
  },
  foodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  foodCard: {
    width: '47.5%',
    minHeight: 76,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E4F0',
    backgroundColor: '#F3F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    position: 'relative',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  foodCalories: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.green,
    textAlign: 'center',
  },

  bottomInfoRow: {
    marginTop: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomInfoText: {
    fontSize: 14,
    color: '#6E7483',
    fontWeight: '500',
  },
  totalText: {
    fontSize: 14,
    color: COLORS.green,
    fontWeight: '800',
  },

  primaryButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#E7E7EA',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.white,
  },
  disabledButtonText: {
    color: '#B5B7BD',
  },
});