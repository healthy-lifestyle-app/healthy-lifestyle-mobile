import { SetStateAction, useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ArrowLeft, FilePenLine } from 'lucide-react-native';
import Screen from '@/components/Screen';
import {
  getRecipes,
  mapCategoryFromBackend,
  type BackendRecipe,
} from '@/lib/recipesApi';

const COLORS = {
  background: '#F8F6EC',
  text: '#1F2430',
  muted: '#7E8695',
  primary: '#5E578F',
  green: '#A8C85A',
  blue: '#5A97F0',
  blueSoft: '#EAF3FF',
  greenSoft: '#EEF5DE',
  yellowSoft: '#FFF4DA',
  purpleSoft: '#F0EDFA',
  border: '#E6E2F0',
  white: '#FFFFFF',
};

function recipeTone(category: BackendRecipe['category']) {
  if (category === 'BREAKFAST') return COLORS.greenSoft;
  if (category === 'LUNCH') return COLORS.blueSoft;
  if (category === 'DINNER') return COLORS.purpleSoft;
  return COLORS.greenSoft;
}

export default function MyRecipesScreen() {
  const [recipes, setRecipes] = useState<BackendRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setError(null);
      getRecipes()
        .then(setRecipes)
        .catch((err: { message: SetStateAction<string | null>; }) => {
          setError(
            err instanceof Error ? err.message : 'Tarifler yüklenemedi.',
          );
        })
        .finally(() => setLoading(false));
    }, []),
  );

  return (
    <Screen backgroundColor={COLORS.background} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={COLORS.primary} strokeWidth={2.4} />
          </Pressable>
          <View>
            <Text style={styles.title}>Tariflerim</Text>
            <Text style={styles.subtitle}>
              {loading ? '...' : `${recipes.length} adet tarif`}
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : recipes.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <FilePenLine size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>Henüz tarif eklemedin</Text>
            <Text style={styles.emptySub}>
              Kendi tariflerini ekleyerek koleksiyonunu oluştur
            </Text>
            <Pressable
              style={styles.primaryBtn}
              onPress={() => router.push('/recipes/add')}>
              <Text style={styles.primaryBtnText}>Tarif Ekle</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.list}>
            {recipes.map((recipe) => (
              <Pressable
                key={recipe.id}
                style={[
                  styles.recipeItem,
                  { backgroundColor: recipeTone(recipe.category) },
                ]}
                onPress={() =>
                  router.push({
                    pathname: '/recipes/[id]',
                    params: { id: recipe.id },
                  })
                }>
                <Text style={styles.recipeTitle}>{recipe.title}</Text>
                <Text style={styles.recipeMeta}>
                  {mapCategoryFromBackend(recipe.category)} •{' '}
                  {recipe.prepTimeMin ?? 0} dk • {recipe.caloriesKcal ?? 0} kcal
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#EDEAF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 13,
    color: '#4E535F',
    fontWeight: '500',
  },
  centerState: {
    paddingVertical: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorCard: {
    borderRadius: 18,
    backgroundColor: '#FDE5DA',
    padding: 18,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#C04A1A',
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyCard: {
    marginTop: 8,
    backgroundColor: COLORS.purpleSoft,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 19,
    color: COLORS.primary,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 21,
  },
  primaryBtn: {
    marginTop: 6,
    width: '100%',
    height: 46,
    borderRadius: 18,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
  },
  list: {
    gap: 10,
  },
  recipeItem: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  recipeMeta: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: '500',
  },
});