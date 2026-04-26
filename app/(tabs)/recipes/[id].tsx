import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  ChefHat,
  Clock3,
  Heart,
  Lightbulb,
  Users,
} from 'lucide-react-native';

import Screen from '@/components/Screen';
import { getRecipeById, type Recipe } from '@/lib/recipesApi';

const COLORS = {
  background: '#F8F6EC',
  text: '#1F2430',
  muted: '#7E8695',
  primary: '#5E578F',
  green: '#A8C85A',
  greenSoft: '#EEF5DE',
  blue: '#5A97F0',
  blueSoft: '#EAF3FF',
  border: '#E6E2F0',
  white: '#FFFFFF',
  purpleSoft: '#F0EDFA',
};

type RecipeIngredient = {
  id?: string;
  foodId?: string | null;
  name?: string | null;
  amountText?: string | null;
  orderNo?: number;
};

type RecipeStep = {
  id?: string;
  orderNo?: number;
  text?: string | null;
};

function getCategoryLabel(category?: string | null) {
  switch (category) {
    case 'BREAKFAST':
      return 'Kahvaltı';
    case 'LUNCH':
      return 'Öğle';
    case 'DINNER':
      return 'Akşam';
    case 'SNACK':
      return 'Atıştırmalık';
    default:
      return 'Diğer';
  }
}

function getIngredientLabel(ingredient: RecipeIngredient | string) {
  if (typeof ingredient === 'string') {
    return ingredient;
  }

  const name = ingredient.name ?? 'Malzeme';
  const amount = ingredient.amountText ?? '';

  return amount ? `${name} - ${amount}` : name;
}

function getStepLabel(step: RecipeStep | string) {
  if (typeof step === 'string') {
    return step;
  }

  return step.text ?? 'Adım bilgisi bulunamadı.';
}

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (!id) {
        setLoading(false);
        setError('Tarif bilgisi bulunamadı.');
        return;
      }

      let isActive = true;

      async function fetchRecipe() {
        try {
          setLoading(true);
          setError('');

          const data = await getRecipeById(String(id));

          if (isActive) {
            setRecipe(data);
          }
        } catch (err: any) {
          console.log('GET_RECIPE_DETAIL_ERROR', err?.response?.data ?? err);
          if (isActive) {
            setError('Tarif detayı yüklenemedi.');
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      }

      fetchRecipe();

      return () => {
        isActive = false;
      };
    }, [id]),
  );

  if (loading) {
    return (
      <Screen backgroundColor={COLORS.background} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Tarif yükleniyor...</Text>
        </View>
      </Screen>
    );
  }

  if (error || !recipe) {
    return (
      <Screen backgroundColor={COLORS.background} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.notFound}>{error || 'Tarif bulunamadı.'}</Text>
          <Pressable
            style={styles.backMainBtn}
            onPress={() => router.replace('/recipes')}>
            <Text style={styles.backMainBtnText}>Tariflere Dön</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const ingredients = (recipe.ingredients ?? []) as Array<
    RecipeIngredient | string
  >;
  const steps = (recipe.steps ?? []) as Array<RecipeStep | string>;

  return (
    <Screen backgroundColor={COLORS.background} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image
            source={{
              uri:
                recipe.imageUrl ??
                'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
            }}
            style={styles.heroImage}
            contentFit="cover"
          />

          <View style={styles.heroOverlay} />

          <View style={styles.heroActions}>
            <Pressable style={styles.heroBtn} onPress={() => router.back()}>
              <ArrowLeft size={20} color={COLORS.primary} strokeWidth={2.4} />
            </Pressable>

            <Pressable style={styles.heroBtn}>
              <Heart size={20} color="#FF6B1A" strokeWidth={2.2} />
            </Pressable>
          </View>

          <View style={styles.heroBottom}>
            <Text style={styles.heroTitle}>{recipe.title}</Text>

            <View style={styles.heroMeta}>
              <View style={styles.heroMetaItem}>
                <Clock3 size={16} color="#FFFFFF" />
                <Text style={styles.heroMetaText}>
                  {recipe.prepTimeMin ?? 0} dk
                </Text>
              </View>

              <View style={styles.heroMetaItem}>
                <Users size={16} color="#FFFFFF" />
                <Text style={styles.heroMetaText}>
                  {recipe.servings ?? 1} kişi
                </Text>
              </View>

              <Text style={styles.heroMetaText}>
                {recipe.caloriesKcal ?? 0} kcal
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {recipe.description ? (
            <Text style={styles.description}>{recipe.description}</Text>
          ) : null}

          {(recipe.tags ?? []).length > 0 ? (
            <View style={styles.tagRow}>
              {(recipe.tags ?? []).map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.categoryCard}>
            <View style={styles.categoryIcon}>
              <ChefHat size={22} color={COLORS.white} />
            </View>

            <View>
              <Text style={styles.categoryTitle}>
                {getCategoryLabel(recipe.category)}
              </Text>
              <Text style={styles.categorySub}>Öğün kategorisi</Text>
            </View>
          </View>

          <View style={styles.block}>
            <Text style={styles.blockTitle}>Malzemeler</Text>

            {ingredients.length === 0 ? (
              <Text style={styles.rowText}>Malzeme bilgisi bulunamadı.</Text>
            ) : (
              ingredients.map((ingredient, index) => (
                <View
                  key={
                    typeof ingredient === 'string'
                      ? `${recipe.id}-ingredient-${index}`
                      : ingredient.id ?? `${recipe.id}-ingredient-${index}`
                  }
                  style={styles.row}>
                  <View style={styles.numPill}>
                    <Text style={styles.numPillText}>{index + 1}</Text>
                  </View>

                  <Text style={styles.rowText}>
                    {getIngredientLabel(ingredient)}
                  </Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.block}>
            <Text style={styles.blockTitle}>Hazırlanışı</Text>

            {steps.length === 0 ? (
              <Text style={styles.rowText}>Hazırlanış adımı bulunamadı.</Text>
            ) : (
              steps.map((step, index) => (
                <View
                  key={
                    typeof step === 'string'
                      ? `${recipe.id}-step-${index}`
                      : step.id ?? `${recipe.id}-step-${index}`
                  }
                  style={styles.stepCard}>
                  <View style={styles.numPill}>
                    <Text style={styles.numPillText}>{index + 1}</Text>
                  </View>

                  <Text style={styles.stepText}>{getStepLabel(step)}</Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.nutritionCard}>
            <Text style={styles.blockTitle}>Besin Değerleri</Text>

            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {recipe.caloriesKcal ?? 0}
                </Text>
                <Text style={styles.nutritionLabel}>Kalori</Text>
              </View>

              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>
                  {recipe.servings ?? 1}
                </Text>
                <Text style={styles.nutritionLabel}>Porsiyon</Text>
              </View>
            </View>
          </View>

          {recipe.tip ? (
            <View style={styles.tipCard}>
              <Lightbulb size={18} color="#E8BA4E" />

              <View style={{ flex: 1 }}>
                <Text style={styles.tipTitle}>İpucu</Text>
                <Text style={styles.tipText}>{recipe.tip}</Text>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 20,
  },
  loadingText: {
    fontSize: 15,
    color: COLORS.muted,
    fontWeight: '700',
  },
  notFound: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '700',
    textAlign: 'center',
  },
  backMainBtn: {
    height: 44,
    borderRadius: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.green,
  },
  backMainBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 16,
  },
  hero: {
    height: 320,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 20, 28, 0.36)',
  },
  heroActions: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottom: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroMetaText: {
    fontSize: 21,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  content: {
    padding: 16,
    gap: 14,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#273045',
    fontWeight: '600',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.purpleSoft,
  },
  tagText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  categoryCard: {
    borderRadius: 22,
    backgroundColor: COLORS.greenSoft,
    borderWidth: 1,
    borderColor: 'rgba(168, 200, 90, 0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  categoryIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.green,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
  },
  categorySub: {
    fontSize: 16,
    color: COLORS.muted,
  },
  block: {
    borderRadius: 24,
    backgroundColor: COLORS.blueSoft,
    borderWidth: 1,
    borderColor: 'rgba(90, 151, 240, 0.35)',
    padding: 14,
    gap: 10,
  },
  blockTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowText: {
    flex: 1,
    fontSize: 18,
    color: '#273045',
  },
  numPill: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4D588',
  },
  numPillText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14,
  },
  stepCard: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.65)',
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  stepText: {
    flex: 1,
    color: '#273045',
    fontSize: 18,
    lineHeight: 25,
  },
  nutritionCard: {
    borderRadius: 24,
    backgroundColor: COLORS.blueSoft,
    borderWidth: 1,
    borderColor: 'rgba(90, 151, 240, 0.35)',
    padding: 14,
    gap: 10,
  },
  nutritionGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  nutritionItem: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  nutritionValue: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.blue,
  },
  nutritionLabel: {
    fontSize: 16,
    color: '#3D4B5F',
  },
  tipCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(168, 200, 90, 0.35)',
    backgroundColor: COLORS.greenSoft,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 16,
    color: '#273045',
    lineHeight: 24,
  },
});