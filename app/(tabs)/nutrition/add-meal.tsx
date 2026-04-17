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

const COLORS = {
  background: '#F8F6EC',
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

const foodLibraryByMeal: Record<string, { id: string; name: string; kcal: number }[]> = {
  breakfast: [
    { id: '1', name: 'Yumurta', kcal: 155 },
    { id: '2', name: 'Avokado', kcal: 160 },
    { id: '3', name: 'Tam buğday ekmeği', kcal: 80 },
    { id: '4', name: 'Yoğurt', kcal: 100 },
    { id: '5', name: 'Elma', kcal: 95 },
  ],
  lunch: [
    { id: '11', name: 'Tavuk salatası', kcal: 220 },
    { id: '12', name: 'Quinoa', kcal: 120 },
    { id: '13', name: 'Sebzeler', kcal: 60 },
    { id: '14', name: 'Yoğurt', kcal: 100 },
    { id: '15', name: 'Pirinç', kcal: 130 },
  ],
  dinner: [
    { id: '21', name: 'Somon', kcal: 208 },
    { id: '22', name: 'Buharda sebze', kcal: 90 },
    { id: '23', name: 'Zeytinyağlı salata', kcal: 110 },
    { id: '24', name: 'Çorba', kcal: 140 },
    { id: '25', name: 'Izgara köfte', kcal: 240 },
  ],
  snack: [
    { id: '31', name: 'Muz', kcal: 105 },
    { id: '32', name: 'Havuç', kcal: 25 },
    { id: '33', name: 'Portakal', kcal: 62 },
    { id: '34', name: 'Çilek', kcal: 32 },
    { id: '35', name: 'Ceviz', kcal: 185 },
  ],
};

export default function AddMealScreen() {
  const params = useLocalSearchParams<{ meal?: string }>();
  const mealParam = typeof params.meal === 'string' ? params.meal : '';
  const validInitialMeal = mealOptions.some((item) => item.key === mealParam)
    ? mealParam
    : null;

  const [selectedMeal, setSelectedMeal] = useState<string | null>(validInitialMeal);
  const [search, setSearch] = useState('');
  const [selectedFoodIds, setSelectedFoodIds] = useState<string[]>([]);

  const selectedMealMeta = mealOptions.find((item) => item.key === selectedMeal);

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
      prev.includes(foodId) ? prev.filter((id) => id !== foodId) : [...prev, foodId],
    );
  };

  const handleSelectMeal = (mealKey: string) => {
    setSelectedMeal(mealKey);
    setSelectedFoodIds([]);
    setSearch('');
  };

  const handleAddFoods = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.85}
            onPress={() => router.back()}
          >
            <Ionicons name='chevron-back' size={20} color={COLORS.text} />
          </TouchableOpacity>

          <View>
            <Text style={styles.title}>Öğün Ekle</Text>
            <Text style={styles.subtitle}>Öğün seç ve besin ekle</Text>
          </View>
        </View>

        {!selectedMeal ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hangi öğüne eklemek istersin?</Text>

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
                  <Text style={[styles.mealOptionText, { color: meal.color }]}>
                    {meal.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.selectedMealHeader}>
              <Text style={styles.sectionTitle}>{selectedMealMeta?.label} - Besin Ekle</Text>

              <TouchableOpacity
                style={styles.changeMealButton}
                activeOpacity={0.85}
                onPress={() => {
                  setSelectedMeal(null);
                  setSelectedFoodIds([]);
                  setSearch('');
                }}
              >
                <Text style={styles.changeMealButtonText}>Değiştir</Text>
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
              <Text style={styles.bottomInfoText}>{selectedFoods.length} besin seçildi</Text>
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
          </View>
        )}
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
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
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
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 14,
    color: '#5D6472',
  },

  section: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 16,
  },

  mealGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mealOptionCard: {
    width: '47%',
    minHeight: 80,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  mealOptionText: {
    fontSize: 16,
    fontWeight: '800',
  },

  selectedMealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changeMealButton: {
    backgroundColor: '#EFEDF8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  changeMealButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },

  searchInput: {
    height: 46,
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
    flex: 1,
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
    marginTop: 12,
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
    height: 50,
    borderRadius: 25,
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