import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ArrowLeft, FilePenLine } from 'lucide-react-native';
import Screen from '@/components/Screen';
import { getMyRecipes, type Recipe } from '@/lib/recipesStore';

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
  orangeSoft: '#FDE5DA',
  border: '#E6E2F0',
  white: '#FFFFFF',
};

function recipeTone(category: Recipe['category']) {
  if (category === 'Kahvaltı') return COLORS.greenSoft;
  if (category === 'Öğle') return COLORS.blueSoft;
  if (category === 'Akşam') return COLORS.purpleSoft;
  return COLORS.greenSoft;
}

export default function MyRecipesScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useFocusEffect(
    useCallback(() => {
      getMyRecipes().then(setRecipes);
    }, []),
  );

  return (
    <Screen backgroundColor={COLORS.background} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={22} color={COLORS.primary} strokeWidth={2.4} />
          </Pressable>
          <View>
            <Text style={styles.title}>Tariflerim</Text>
            <Text style={styles.subtitle}>{recipes.length} adet tarif</Text>
          </View>
        </View>

        {recipes.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <FilePenLine size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>Henüz tarif eklemedin</Text>
            <Text style={styles.emptySub}>Kendi tariflerini ekleyerek koleksiyonunu oluştur</Text>
            <Pressable style={styles.primaryBtn} onPress={() => router.push('/recipes/add')}>
              <Text style={styles.primaryBtnText}>Tarif Ekle</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.list}>
            {recipes.map((recipe) => (
              <Pressable
                key={recipe.id}
                style={[styles.recipeItem, { backgroundColor: recipeTone(recipe.category) }]}
                onPress={() =>
                  router.push({
                    pathname: '/recipes/[id]',
                    params: { id: recipe.id },
                  })
                }>
                <Text style={styles.recipeTitle}>{recipe.title}</Text>
                <Text style={styles.recipeMeta}>
                  {recipe.category} • {recipe.durationMin} dk • {recipe.calories} kcal
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
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#EDEAF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 15,
    color: '#4E535F',
  },
  emptyCard: {
    marginTop: 8,
    backgroundColor: COLORS.purpleSoft,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 22,
    alignItems: 'center',
    gap: 14,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: '800',
  },
  emptySub: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  primaryBtn: {
    marginTop: 8,
    width: '100%',
    height: 48,
    borderRadius: 20,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 18,
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
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  recipeMeta: {
    fontSize: 15,
    color: COLORS.muted,
  },
});
