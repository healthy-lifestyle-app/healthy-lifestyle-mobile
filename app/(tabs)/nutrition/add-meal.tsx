import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import {
  createMeal,
  getFoods,
  type Food,
  type MealType,
} from '@/api/nutrition';
import Screen from '@/components/Screen';

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
  softInput: '#FBFAFE',
  disabled: '#E7E7EA',
  disabledText: '#B5B7BD',
};

const MEAL_OPTIONS: {
  label: string;
  value: MealType;
  color: string;
  bg: string;
}[] = [
  {
    label: 'Kahvaltı',
    value: 'BREAKFAST',
    color: COLORS.green,
    bg: COLORS.greenSoft,
  },
  {
    label: 'Öğle',
    value: 'LUNCH',
    color: COLORS.yellow,
    bg: COLORS.yellowSoft,
  },
  {
    label: 'Akşam',
    value: 'DINNER',
    color: COLORS.purple,
    bg: COLORS.purpleSoft,
  },
  {
    label: 'Ara Öğün',
    value: 'SNACK',
    color: COLORS.orange,
    bg: COLORS.orangeSoft,
  },
];

type SelectedFoodItem = {
  food: Food;
  quantity: string;
};

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function getMealLabel(mealType: MealType) {
  return MEAL_OPTIONS.find((item) => item.value === mealType)?.label ?? 'Öğün';
}

function parseQuantity(value: string) {
  const parsed = Number(value.replace(',', '.'));
  if (Number.isNaN(parsed) || parsed <= 0) return 0;
  return parsed;
}

export default function AddMealScreen() {
  const params = useLocalSearchParams<{ mealType?: string; meal?: string }>();

  const initialMealType = useMemo<MealType>(() => {
    const value = params.mealType ?? params.meal;
    const normalized = typeof value === 'string' ? value.trim() : '';
    const upper = normalized.toUpperCase();

    if (
      upper === 'BREAKFAST' ||
      upper === 'LUNCH' ||
      upper === 'DINNER' ||
      upper === 'SNACK'
    ) {
      return upper as MealType;
    }

    if (normalized === 'breakfast') return 'BREAKFAST';
    if (normalized === 'lunch') return 'LUNCH';
    if (normalized === 'dinner') return 'DINNER';
    if (normalized === 'snack') return 'SNACK';

    return 'BREAKFAST';
  }, [params.mealType, params.meal]);

  const [mealType, setMealType] = useState<MealType>(initialMealType);
  const [search, setSearch] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState<SelectedFoodItem[]>([]);

  useEffect(() => {
    setMealType(initialMealType);
  }, [initialMealType]);

  useEffect(() => {
    let isMounted = true;

    async function loadFoods() {
      try {
        setLoadingFoods(true);

        const response = await getFoods({
          search: search.trim() || undefined,
          page: 1,
          limit: 20,
        });

        if (!isMounted) return;
        setFoods(response.items ?? []);
      } catch (error) {
        if (!isMounted) return;
        const message =
          error instanceof Error ? error.message : 'Besinler alınamadı.';
        Alert.alert('Hata', message);
      } finally {
        if (isMounted) {
          setLoadingFoods(false);
        }
      }
    }

    const timeout = setTimeout(loadFoods, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [search]);

  const toggleFood = (food: Food) => {
    setSelectedFoods((prev) => {
      const exists = prev.some((item) => item.food.id === food.id);

      if (exists) {
        return prev.filter((item) => item.food.id !== food.id);
      }

      return [...prev, { food, quantity: '1' }];
    });
  };

  const updateFoodQuantity = (foodId: number | string, value: string) => {
    setSelectedFoods((prev) =>
      prev.map((item) =>
        item.food.id === foodId ? { ...item, quantity: value } : item,
      ),
    );
  };

  const isFoodSelected = (foodId: number | string) => {
    return selectedFoods.some((item) => item.food.id === foodId);
  };

  const totals = useMemo(() => {
    return selectedFoods.reduce(
      (acc, item) => {
        const qty = parseQuantity(item.quantity);
        if (qty <= 0) return acc;

        acc.totalGram += (item.food.servingSizeG ?? 0) * qty;
        acc.calories += (item.food.caloriesKcal ?? 0) * qty;
        acc.protein += (item.food.proteinG ?? 0) * qty;
        acc.carbs += (item.food.carbsG ?? 0) * qty;
        acc.fat += (item.food.fatG ?? 0) * qty;

        return acc;
      },
      {
        totalGram: 0,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      },
    );
  }, [selectedFoods]);

  const validItems = useMemo(() => {
  return selectedFoods
    .map((item) => {
      const qty = parseQuantity(item.quantity);
      const servingSize = Number(item.food.servingSizeG ?? 0);

      return {
        foodId: String(item.food.id),
        quantity: 1,
        amountG: qty * servingSize,
      };
    })
    .filter((item) => item.amountG > 0);
}, [selectedFoods]);

  const canSubmit = validItems.length > 0 && !saving;

  const handleSave = async () => {
    if (validItems.length === 0) {
      Alert.alert('Uyarı', 'En az bir besin seçip geçerli miktar girmelisin.');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        mealType,
        mealTime: new Date().toISOString(),
        items: validItems,
      };

      console.log('CREATE_MEAL_PAYLOAD', payload);

      const createdMeal = await createMeal(payload);

      console.log('CREATE_MEAL_RESPONSE', createdMeal);

      router.replace('/(tabs)/nutrition');
    } catch (error) {
      console.error('CREATE_MEAL_ERROR', error);

      const message =
        error instanceof Error ? error.message : 'Öğün eklenemedi.';
      Alert.alert('Hata', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen backgroundColor={COLORS.background} contentStyle={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.screen}>
          <View style={styles.backgroundContent}>
            <Text style={styles.fakeTitle}>Beslenme</Text>
            <Text style={styles.fakeSubtitle}>Bugün</Text>

            <View style={styles.fakeCard} />
            <View style={styles.fakeMacroRow}>
              <View style={styles.fakeMacroCard} />
              <View style={styles.fakeMacroCard} />
            </View>
            <View style={[styles.fakeMacroRow, { marginTop: 12 }]}>
              <View style={styles.fakeMacroCard} />
              <View style={styles.fakeMacroCard} />
            </View>
          </View>

          <View style={styles.overlay} />

          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {getMealLabel(mealType)} - Besin Ekle
              </Text>

              <Pressable
                style={styles.closeButton}
                onPress={() => router.replace('/(tabs)/nutrition')}>
                <Ionicons name="close" size={18} color={COLORS.primary} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetContent}>
              <Text style={styles.sectionLabel}>Öğün Türü</Text>
              <View style={styles.mealGrid}>
                {MEAL_OPTIONS.map((item) => {
                  const active = item.value === mealType;

                  return (
                    <Pressable
                      key={item.value}
                      onPress={() => setMealType(item.value)}
                      style={[
                        styles.mealOptionCard,
                        { backgroundColor: item.bg, borderColor: item.color },
                        active && styles.mealOptionCardActive,
                      ]}>
                      <Text
                        style={[
                          styles.mealOptionText,
                          { color: active ? item.color : COLORS.primary },
                        ]}>
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.sectionLabel}>Besin Ara</Text>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Örn: yumurta, tavuk, muz"
                placeholderTextColor="#9AA1AF"
                style={styles.searchInput}
              />

              <Text style={styles.sectionLabel}>Besin Seç</Text>

              {loadingFoods ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator color={COLORS.primary} />
                </View>
              ) : foods.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>Sonuç bulunamadı.</Text>
                </View>
              ) : (
                <View style={styles.foodGrid}>
                  {foods.map((food) => {
                    const selected = isFoodSelected(food.id);

                    return (
                      <Pressable
                        key={String(food.id)}
                        onPress={() => toggleFood(food)}
                        style={[
                          styles.foodCard,
                          selected && styles.foodCardSelected,
                        ]}>
                        {selected && (
                          <View style={styles.checkBadge}>
                            <Ionicons
                              name="checkmark"
                              size={12}
                              color={COLORS.white}
                            />
                          </View>
                        )}

                        <Text style={styles.foodName} numberOfLines={2}>
                          {food.name}
                        </Text>

                        <Text style={styles.foodMeta}>
                          {food.servingSizeG} g • {food.caloriesKcal} kcal
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {selectedFoods.length > 0 && (
                <>
                  <Text style={styles.sectionLabel}>Seçilen Besinler</Text>

                  <View style={styles.selectedList}>
                    {selectedFoods.map((item) => (
                      <View key={String(item.food.id)} style={styles.selectedCard}>
                        <View style={styles.selectedTopRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.selectedFoodName}>
                              {item.food.name}
                            </Text>
                            <Text style={styles.selectedFoodMeta}>
                              {item.food.servingSizeG} g • {item.food.caloriesKcal} kcal
                            </Text>
                          </View>

                          <Pressable
                            onPress={() => toggleFood(item.food)}
                            style={styles.removeButton}>
                            <Ionicons
                              name="close"
                              size={16}
                              color={COLORS.primary}
                            />
                          </Pressable>
                        </View>

                        <Text style={styles.quantityLabel}>Porsiyon Adedi</Text>
                        <TextInput
                          value={item.quantity}
                          onChangeText={(value) =>
                            updateFoodQuantity(item.food.id, value)
                          }
                          placeholder="1"
                          keyboardType="numeric"
                          placeholderTextColor="#9AA1AF"
                          style={styles.quantityInput}
                        />
                      </View>
                    ))}
                  </View>
                </>
              )}

              <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>Seçilen Öğün Özeti</Text>
                <Text style={styles.previewLine}>
                  Besin sayısı: {selectedFoods.length}
                </Text>
                <Text style={styles.previewLine}>
                  Toplam gram: {round1(totals.totalGram)} g
                </Text>
                <Text style={styles.previewLine}>
                  Kalori: {round1(totals.calories)} kcal
                </Text>
                <Text style={styles.previewLine}>
                  Protein: {round1(totals.protein)} g
                </Text>
                <Text style={styles.previewLine}>
                  Karbonhidrat: {round1(totals.carbs)} g
                </Text>
                <Text style={styles.previewLine}>
                  Yağ: {round1(totals.fat)} g
                </Text>
              </View>

              <Pressable
                onPress={handleSave}
                disabled={!canSubmit}
                style={[
                  styles.primaryButton,
                  !canSubmit && styles.disabledButton,
                ]}>
                <Text
                  style={[
                    styles.primaryButtonText,
                    !canSubmit && styles.disabledButtonText,
                  ]}>
                  {saving ? 'Kaydediliyor...' : 'Öğünü Kaydet'}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
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
    color: COLORS.text,
    marginBottom: 4,
  },
  fakeSubtitle: {
    fontSize: 15,
    color: '#555B67',
    marginBottom: 18,
  },
  fakeCard: {
    height: 160,
    borderRadius: 28,
    backgroundColor: '#ECEAF4',
    marginBottom: 16,
  },
  fakeMacroRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fakeMacroCard: {
    flex: 1,
    height: 98,
    borderRadius: 22,
    backgroundColor: '#EEF1E6',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },

  sheet: {
    minHeight: 420,
    maxHeight: '84%',
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
    marginBottom: 14,
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
  sheetContent: {
    paddingBottom: 12,
  },

  sectionLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 10,
    marginTop: 8,
  },

  mealGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  mealOptionCard: {
    width: '47%',
    minHeight: 68,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  mealOptionCardActive: {
    transform: [{ scale: 1.01 }],
    borderWidth: 2.5,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  mealOptionText: {
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },

  searchInput: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDD9EA',
    backgroundColor: COLORS.softInput,
    paddingHorizontal: 14,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
  },

  loadingBox: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECE8F4',
    backgroundColor: '#F6F4FA',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.muted,
    fontWeight: '600',
  },

  foodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  foodCard: {
    width: '47.5%',
    minHeight: 82,
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
  foodCardSelected: {
    borderColor: COLORS.green,
    backgroundColor: COLORS.white,
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
  foodMeta: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.muted,
    textAlign: 'center',
  },

  selectedList: {
    gap: 10,
    marginBottom: 8,
  },
  selectedCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E3DEEF',
    backgroundColor: '#F8F7FB',
    padding: 12,
  },
  selectedTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  selectedFoodName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  selectedFoodMeta: {
    fontSize: 12,
    color: COLORS.muted,
    fontWeight: '700',
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFEDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  quantityInput: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD9EA',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    fontSize: 14,
    color: COLORS.text,
  },

  previewCard: {
    marginTop: 8,
    marginBottom: 14,
    borderRadius: 18,
    backgroundColor: '#F1EEF8',
    borderWidth: 1,
    borderColor: '#E1DAF0',
    padding: 14,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 10,
  },
  previewLine: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 6,
  },

  primaryButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.disabled,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.white,
  },
  disabledButtonText: {
    color: COLORS.disabledText,
  },
});