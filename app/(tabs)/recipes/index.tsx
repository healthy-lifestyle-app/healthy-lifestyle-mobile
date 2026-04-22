import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Search, Heart, Plus, BookOpen, Bot, Clock3, Users } from 'lucide-react-native';
import Screen from '@/components/Screen';
import { getAllRecipes, type Recipe, type RecipeCategory } from '@/lib/recipesStore';

type FilterCategory = 'Hepsi' | RecipeCategory;

const COLORS = {
  background: '#F8F6EC',
  text: '#1F2430',
  muted: '#7E8695',
  primary: '#5E578F',
  green: '#A8C85A',
  greenSoft: '#EEF5DE',
  blue: '#5A97F0',
  blueSoft: '#EAF3FF',
  yellow: '#F2CF7B',
  yellowSoft: '#FFF4DA',
  purple: '#C9C3EA',
  purpleSoft: '#F0EDFA',
  orange: '#FF6B1A',
  orangeSoft: '#FDE5DA',
  border: '#E6E2F0',
  white: '#FFFFFF',
};

const CATEGORIES: FilterCategory[] = ['Hepsi', 'Kahvaltı', 'Öğle', 'Akşam', 'Atıştırma'];

function getCardTone(category: RecipeCategory) {
  if (category === 'Kahvaltı') {
    return { bg: COLORS.greenSoft, border: 'rgba(168, 200, 90, 0.35)', accent: COLORS.green };
  }
  if (category === 'Öğle') {
    return { bg: COLORS.blueSoft, border: 'rgba(90, 151, 240, 0.35)', accent: COLORS.blue };
  }
  if (category === 'Akşam') {
    return { bg: COLORS.purpleSoft, border: 'rgba(201, 195, 234, 0.55)', accent: COLORS.primary };
  }
  return { bg: COLORS.greenSoft, border: 'rgba(168, 200, 90, 0.35)', accent: COLORS.green };
}

export default function RecipesScreen() {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('Hepsi');
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const loadRecipes = useCallback(async () => {
    const data = await getAllRecipes();
    setRecipes(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [loadRecipes]),
  );

  const visibleRecipes = useMemo(() => {
    if (activeCategory === 'Hepsi') return recipes;
    return recipes.filter((recipe) => recipe.category === activeCategory);
  }, [activeCategory, recipes]);

  return (
    <Screen backgroundColor={COLORS.background} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Tarifler</Text>
            <Text style={styles.subtitle}>Sağlıklı ve lezzetli</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.iconButton}>
              <Search size={20} color={COLORS.primary} strokeWidth={2.4} />
            </Pressable>
            <Pressable style={[styles.iconButton, styles.iconButtonAlt]}>
              <Heart size={20} color={COLORS.orange} strokeWidth={2.4} />
            </Pressable>
          </View>
        </View>

        <View style={styles.quickGrid}>
          <Pressable
            style={[styles.quickCard, { backgroundColor: COLORS.greenSoft, borderColor: 'rgba(168, 200, 90, 0.35)' }]}
            onPress={() => router.push('/recipes/add')}>
            <View style={[styles.quickIconWrap, { backgroundColor: COLORS.green }]}>
              <Plus size={24} color={COLORS.white} strokeWidth={2.4} />
            </View>
            <Text style={styles.quickTitle}>Tarif Ekle</Text>
            <Text style={styles.quickSub}>Kendi tarifini oluştur</Text>
          </Pressable>

          <Pressable
            style={[styles.quickCard, { backgroundColor: COLORS.blueSoft, borderColor: 'rgba(90, 151, 240, 0.35)' }]}
            onPress={() => router.push('/recipes/my-recipes')}>
            <View style={[styles.quickIconWrap, { backgroundColor: COLORS.blue }]}>
              <BookOpen size={22} color={COLORS.white} strokeWidth={2.2} />
            </View>
            <Text style={styles.quickTitle}>Tariflerim</Text>
            <Text style={styles.quickSub}>Kaydettiğin tarifler</Text>
          </Pressable>
        </View>

        <Pressable style={styles.aiCard}>
          <View style={styles.aiIcon}>
            <Bot size={22} color={COLORS.white} strokeWidth={2.2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiTitle}>AI Önerisi</Text>
            <Text style={styles.aiSub}>Bugün için protein açığını kapatacak yemekler</Text>
          </View>
          <View style={styles.aiAction}>
            <Text style={styles.aiActionText}>Gör</Text>
          </View>
        </Pressable>

        <View style={styles.segmentedRow}>
          {CATEGORIES.map((category) => {
            const active = category === activeCategory;
            return (
              <Pressable
                key={category}
                onPress={() => setActiveCategory(category)}
                style={[styles.segmentItem, active && styles.segmentItemActive]}>
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.recipeList}>
          {visibleRecipes.map((recipe) => {
            const tone = getCardTone(recipe.category);
            return (
            <View
              key={recipe.id}
              style={[
                styles.recipeCard,
                { backgroundColor: tone.bg, borderColor: tone.border },
              ]}>
              <View style={styles.recipeTopRow}>
                <Text style={[styles.categoryPill, { color: tone.accent }]}>
                  {recipe.category}
                </Text>
                <Pressable style={styles.heartGhost}>
                  <Heart size={17} color="#B8BFCD" strokeWidth={2.4} />
                </Pressable>
              </View>

              <Text style={styles.recipeTitle}>{recipe.title}</Text>

              <View style={styles.recipeMetaRow}>
                <View style={styles.metaItem}>
                  <Clock3 size={16} color={COLORS.muted} strokeWidth={2.3} />
                  <Text style={styles.metaText}>{recipe.durationMin} dk</Text>
                </View>
                <View style={styles.metaItem}>
                  <Users size={16} color={COLORS.muted} strokeWidth={2.3} />
                  <Text style={styles.metaText}>{recipe.servings} kişi</Text>
                </View>
                <Text style={[styles.kcalText, { color: tone.accent }]}>{recipe.calories} kcal</Text>
              </View>

              <View style={styles.tagRow}>
                {recipe.tags.map((tag) => (
                  <View key={`${recipe.id}-${tag}`} style={styles.tag}>
                    <Text style={[styles.tagText, { color: tone.accent }]}>{tag}</Text>
                  </View>
                ))}
              </View>
              <Pressable
                style={styles.cardHitArea}
                onPress={() =>
                  router.push({
                    pathname: '/recipes/[id]',
                    params: { id: recipe.id },
                  })
                }
              />
            </View>
          );
          })}
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 120,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: COLORS.primary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 15,
    color: '#4E535F',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#E7E4EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonAlt: {
    backgroundColor: '#EAF3FF',
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickCard: {
    flex: 1,
    borderRadius: 26,
    borderWidth: 1,
    minHeight: 170,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  quickIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  quickSub: {
    marginTop: 8,
    fontSize: 13,
    color: '#596172',
    textAlign: 'center',
    fontWeight: '500',
  },
  aiCard: {
    borderRadius: 26,
    backgroundColor: '#F0EDFA',
    borderWidth: 1,
    borderColor: 'rgba(201, 195, 234, 0.55)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  aiIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  aiTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 4,
  },
  aiSub: {
    fontSize: 13,
    color: '#4E5563',
    fontWeight: '500',
    lineHeight: 19,
  },
  aiAction: {
    height: 40,
    minWidth: 62,
    borderRadius: 20,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  aiActionText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
  },
  segmentedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  segmentItem: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#ECE9F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentItemActive: {
    backgroundColor: COLORS.primary,
  },
  segmentText: {
    color: '#727888',
    fontSize: 18,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: COLORS.white,
  },
  recipeList: {
    gap: 14,
  },
  recipeCard: {
    position: 'relative',
    borderRadius: 28,
    borderWidth: 1,
    padding: 16,
  },
  cardHitArea: {
    ...StyleSheet.absoluteFillObject,
  },
  recipeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '800',
  },
  heartGhost: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 10,
  },
  recipeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 16,
    color: '#4B5361',
    fontWeight: '500',
  },
  kcalText: {
    fontSize: 17,
    fontWeight: '800',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  tagText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
});