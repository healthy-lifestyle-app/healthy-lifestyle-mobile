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
import {
  getRecipeById,
  mapCategoryFromBackend,
  getRecipeTitle,
  getRecipeCalories,
  getRecipeTime,
  getIngredientLabel,
  getStepLabel,
  type BackendRecipe,
} from '@/lib/recipesApi';

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
  orange: '#FF6B1A',
};

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recipe, setRecipe] = useState<BackendRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFav, setIsFav] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      setLoading(true);
      setError(null);
      getRecipeById(String(id))
        .then((data) => {
          setRecipe(data);
          setIsFav(data.isFavorite ?? false);
        })
        .catch((err: unknown) => {
          setError(
            err instanceof Error ? err.message : 'Tarif yüklenemedi.',
          );
        })
        .finally(() => setLoading(false));
    }, [id]),
  );

  if (loading) {
    return (
      <Screen backgroundColor={COLORS.background} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </Screen>
    );
  }

  if (error || !recipe) {
    return (
      <Screen backgroundColor={COLORS.background} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.notFound}>{error ?? 'Tarif bulunamadı.'}</Text>
          <Pressable
            style={styles.backMainBtn}
            onPress={() => router.replace('/recipes')}>
            <Text style={styles.backMainBtnText}>Tariflere Dön</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const title = getRecipeTitle(recipe);
  const calories = getRecipeCalories(recipe);
  const time = getRecipeTime(recipe);
  const displayCategory = mapCategoryFromBackend(recipe.category ?? '');

  const ingredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients
    : [];

  const rawSteps = Array.isArray(recipe.steps)
    ? recipe.steps
    : Array.isArray(recipe.instructions)
    ? (recipe.instructions as Array<{ text?: string } | string>)
    : typeof recipe.instructions === 'string'
    ? [recipe.instructions]
    : [];

  return (
    <Screen backgroundColor={COLORS.background} edges={['top']}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* HERO */}
        <View style={styles.hero}>
          <Image
            source={
              recipe.imageUrl
                ? { uri: recipe.imageUrl }
                : {
                    uri: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
                  }
            }
            style={styles.heroImage}
            contentFit="cover"
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroActions}>
            <Pressable style={styles.heroBtn} onPress={() => router.back()}>
              <ArrowLeft size={20} color={COLORS.primary} strokeWidth={2.4} />
            </Pressable>
            <Pressable
              style={styles.heroBtn}
              onPress={() => setIsFav((prev) => !prev)}>
              <Heart
                size={20}
                color={isFav ? COLORS.orange : '#B8BFCD'}
                fill={isFav ? COLORS.orange : 'transparent'}
                strokeWidth={2.2}
              />
            </Pressable>
          </View>
          <View style={styles.heroBottom}>
            <Text style={styles.heroTitle}>{title}</Text>
            <View style={styles.heroMeta}>
              <View style={styles.heroMetaItem}>
                <Clock3 size={14} color="#FFFFFF" />
                <Text style={styles.heroMetaText}>{time} dk</Text>
              </View>
              <View style={styles.heroMetaItem}>
                <Users size={14} color="#FFFFFF" />
                <Text style={styles.heroMetaText}>
                  {recipe.servings ?? 1} kişi
                </Text>
              </View>
              <Text style={styles.heroMetaText}>{calories} kcal</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* TAGS */}
          {(recipe.tags ?? []).length > 0 && (
            <View style={styles.tagRow}>
              {(recipe.tags ?? []).map((tag, i) => (
                <View key={`tag-${i}`} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* KATEGORİ */}
          <View style={styles.categoryCard}>
            <View style={styles.categoryIcon}>
              <ChefHat size={20} color={COLORS.white} />
            </View>
            <View>
              <Text style={styles.categoryTitle}>{displayCategory}</Text>
              <Text style={styles.categorySub}>Öğün kategorisi</Text>
            </View>
          </View>

          {/* AÇIKLAMA */}
          {recipe.description ? (
            <View style={styles.descCard}>
              <Text style={styles.descText}>{recipe.description}</Text>
            </View>
          ) : null}

          {/* MALZEMELER */}
          {ingredients.length > 0 && (
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Malzemeler</Text>
              {ingredients.map((ingredient, index) => (
                <View key={`ing-${index}`} style={styles.row}>
                  <View style={styles.numPill}>
                    <Text style={styles.numPillText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.rowText}>
                    {getIngredientLabel(ingredient)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* HAZIRLANIŞ */}
          {rawSteps.length > 0 && (
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Hazırlanışı</Text>
              {rawSteps.map((step, index) => (
                <View key={`step-${index}`} style={styles.stepCard}>
                  <View style={styles.numPill}>
                    <Text style={styles.numPillText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{getStepLabel(step)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* BESİN DEĞERLERİ */}
          <View style={styles.nutritionCard}>
            <Text style={styles.blockTitle}>Besin Değerleri</Text>
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionValue}>{calories}</Text>
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

          {/* İPUCU */}
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
  container: { flex: 1, backgroundColor: COLORS.background },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  notFound: { fontSize: 16, color: COLORS.primary, fontWeight: '700' },
  backMainBtn: {
    height: 42,
    borderRadius: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.green,
  },
  backMainBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },
  hero: { height: 300, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 20, 28, 0.38)',
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
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottom: { position: 'absolute', left: 16, right: 16, bottom: 16 },
  heroTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroMetaText: { fontSize: 13, color: '#FFFFFF', fontWeight: '600' },
  content: { padding: 16, gap: 12 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.purpleSoft,
  },
  tagText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  categoryCard: {
    borderRadius: 18,
    backgroundColor: COLORS.greenSoft,
    borderWidth: 1,
    borderColor: 'rgba(168, 200, 90, 0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  categoryIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.green,
  },
  categoryTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  categorySub: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  descCard: {
    borderRadius: 16,
    backgroundColor: COLORS.purpleSoft,
    borderWidth: 1,
    borderColor: 'rgba(201, 195, 234, 0.45)',
    padding: 12,
  },
  descText: { fontSize: 14, color: '#273045', lineHeight: 21 },
  block: {
    borderRadius: 20,
    backgroundColor: COLORS.blueSoft,
    borderWidth: 1,
    borderColor: 'rgba(90, 151, 240, 0.35)',
    padding: 14,
    gap: 10,
  },
  blockTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowText: { flex: 1, fontSize: 14, color: '#273045' },
  numPill: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4D588',
  },
  numPillText: { color: COLORS.white, fontWeight: '800', fontSize: 12 },
  stepCard: {
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.65)',
    padding: 10,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  stepText: { flex: 1, color: '#273045', fontSize: 14, lineHeight: 21 },
  nutritionCard: {
    borderRadius: 20,
    backgroundColor: COLORS.blueSoft,
    borderWidth: 1,
    borderColor: 'rgba(90, 151, 240, 0.35)',
    padding: 14,
    gap: 10,
  },
  nutritionGrid: { flexDirection: 'row', gap: 10 },
  nutritionItem: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  nutritionValue: { fontSize: 28, fontWeight: '900', color: COLORS.blue },
  nutritionLabel: { fontSize: 12, color: '#3D4B5F', marginTop: 2 },
  tipCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(168, 200, 90, 0.35)',
    backgroundColor: COLORS.greenSoft,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 3,
  },
  tipText: { fontSize: 13, color: '#273045', lineHeight: 20 },
});