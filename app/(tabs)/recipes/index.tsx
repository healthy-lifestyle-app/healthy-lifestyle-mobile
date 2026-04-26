import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import {
  Search,
  Heart,
  Plus,
  BookOpen,
  Bot,
  Clock3,
  Users,
  Trash2,
} from 'lucide-react-native';

import Screen from '@/components/Screen';
import {
  deleteRecipe,
  getRecipes,
  mapCategoryFromBackend,
  mapCategoryToBackend,
  type BackendRecipe,
} from '@/lib/recipesApi';

type FilterCategory = 'Hepsi' | 'Kahvaltı' | 'Öğle' | 'Akşam' | 'Atıştırma';

const FAVORITE_RECIPE_IDS_KEY = 'favorite_recipe_ids';

const COLORS = {
  background: '#F8F6EC',
  text: '#1F2430',
  muted: '#7E8695',
  primary: '#5E578F',
  green: '#A8C85A',
  greenSoft: '#EEF5DE',
  blue: '#5A97F0',
  blueSoft: '#EAF3FF',
  purpleSoft: '#F0EDFA',
  orange: '#FF6B1A',
  orangeSoft: '#FDE5DA',
  danger: '#C04A1A',
  dangerSoft: '#FDE5DA',
  border: '#E6E2F0',
  white: '#FFFFFF',
};

const CATEGORIES: FilterCategory[] = [
  'Hepsi',
  'Kahvaltı',
  'Öğle',
  'Akşam',
  'Atıştırma',
];

async function getStoredFavoriteIds() {
  try {
    let storedValue: string | null = null;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      storedValue = window.localStorage.getItem(FAVORITE_RECIPE_IDS_KEY);
    } else {
      storedValue = await SecureStore.getItemAsync(FAVORITE_RECIPE_IDS_KEY);
    }

    if (!storedValue) {
      return [];
    }

    const parsed = JSON.parse(storedValue);

    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch (error) {
    console.log('GET_FAVORITE_RECIPES_ERROR', error);
    return [];
  }
}

async function setStoredFavoriteIds(ids: string[]) {
  try {
    const value = JSON.stringify(ids);

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.setItem(FAVORITE_RECIPE_IDS_KEY, value);
      return;
    }

    await SecureStore.setItemAsync(FAVORITE_RECIPE_IDS_KEY, value);
  } catch (error) {
    console.log('SET_FAVORITE_RECIPES_ERROR', error);
  }
}

function getCardTone(category: string) {
  if (category === 'Kahvaltı') {
    return {
      bg: COLORS.greenSoft,
      border: 'rgba(168, 200, 90, 0.35)',
      accent: COLORS.green,
    };
  }

  if (category === 'Öğle') {
    return {
      bg: COLORS.blueSoft,
      border: 'rgba(90, 151, 240, 0.35)',
      accent: COLORS.blue,
    };
  }

  if (category === 'Akşam') {
    return {
      bg: COLORS.purpleSoft,
      border: 'rgba(201, 195, 234, 0.55)',
      accent: COLORS.primary,
    };
  }

  return {
    bg: COLORS.greenSoft,
    border: 'rgba(168, 200, 90, 0.35)',
    accent: COLORS.green,
  };
}

export default function RecipesScreen() {
  const searchInputRef = useRef<TextInput>(null);

  const [activeCategory, setActiveCategory] =
    useState<FilterCategory>('Hepsi');
  const [recipes, setRecipes] = useState<BackendRecipe[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingRecipeId, setDeletingRecipeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadRecipes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [recipeData, storedFavorites] = await Promise.all([
        getRecipes(),
        getStoredFavoriteIds(),
      ]);

      setRecipes(recipeData);
      setFavoriteIds(storedFavorites);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Tarifler yüklenemedi.';

      setError(msg);
      console.log('GET_RECIPES_ERROR', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [loadRecipes]),
  );

  const toggleFavorite = useCallback(
    async (recipeId: string) => {
      const nextFavoriteIds = favoriteIds.includes(recipeId)
        ? favoriteIds.filter((id) => id !== recipeId)
        : [...favoriteIds, recipeId];

      setFavoriteIds(nextFavoriteIds);
      await setStoredFavoriteIds(nextFavoriteIds);
    },
    [favoriteIds],
  );

  const handleDeleteRecipe = useCallback(
    async (recipeId: string) => {
      const runDelete = async () => {
        try {
          setDeletingRecipeId(recipeId);

          await deleteRecipe(recipeId);

          setRecipes((prevRecipes) =>
            prevRecipes.filter((recipe) => String(recipe.id) !== recipeId),
          );

          const nextFavoriteIds = favoriteIds.filter((id) => id !== recipeId);
          setFavoriteIds(nextFavoriteIds);
          await setStoredFavoriteIds(nextFavoriteIds);
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Tarif silinemedi.';

          console.log('DELETE_RECIPE_ERROR', err);
          Alert.alert('Silinemedi', message);
        } finally {
          setDeletingRecipeId(null);
        }
      };

      if (Platform.OS === 'web') {
        const confirmed = window.confirm(
          'Bu tarifi silmek istediğine emin misin?',
        );

        if (confirmed) {
          await runDelete();
        }

        return;
      }

      Alert.alert(
        'Tarifi Sil',
        'Bu tarifi silmek istediğine emin misin?',
        [
          {
            text: 'Vazgeç',
            style: 'cancel',
          },
          {
            text: 'Sil',
            style: 'destructive',
            onPress: runDelete,
          },
        ],
      );
    },
    [favoriteIds],
  );

  const visibleRecipes = useMemo(() => {
    let filtered = recipes;

    if (activeCategory !== 'Hepsi') {
      const backendCat = mapCategoryToBackend(activeCategory);

      filtered = filtered.filter((recipe) => recipe.category === backendCat);
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter((recipe) =>
        favoriteIds.includes(String(recipe.id)),
      );
    }

    const normalizedSearch = searchText.trim().toLowerCase();

    if (normalizedSearch.length > 0) {
      filtered = filtered.filter((recipe) => {
        const title = recipe.title?.toLowerCase() ?? '';
        const name = recipe.name?.toLowerCase() ?? '';
        const description = recipe.description?.toLowerCase() ?? '';
        const category = mapCategoryFromBackend(recipe.category).toLowerCase();
        const tags = (recipe.tags ?? []).join(' ').toLowerCase();

        return `${title} ${name} ${description} ${category} ${tags}`.includes(
          normalizedSearch,
        );
      });
    }

    return filtered;
  }, [
    activeCategory,
    favoriteIds,
    recipes,
    searchText,
    showFavoritesOnly,
  ]);

  const emptyMessage = useMemo(() => {
    if (searchText.trim()) {
      return 'Aramana uygun tarif bulunamadı.';
    }

    if (showFavoritesOnly) {
      return 'Henüz favori tarifin yok.';
    }

    return 'Henüz tarif bulunamadı.';
  }, [searchText, showFavoritesOnly]);

  return (
    <Screen backgroundColor={COLORS.background} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Tarifler</Text>
            <Text style={styles.subtitle}>Sağlıklı ve lezzetli</Text>
          </View>

          <Pressable
            style={[
              styles.iconButton,
              showFavoritesOnly && styles.iconButtonActive,
            ]}
            onPress={() => setShowFavoritesOnly((prev) => !prev)}>
            <Heart
              size={20}
              color={COLORS.orange}
              fill={showFavoritesOnly ? COLORS.orange : 'transparent'}
              strokeWidth={2.4}
            />
          </Pressable>
        </View>

        <View style={styles.quickGrid}>
          <Pressable
            style={[
              styles.quickCard,
              {
                backgroundColor: COLORS.greenSoft,
                borderColor: 'rgba(168, 200, 90, 0.35)',
              },
            ]}
            onPress={() => router.push('/recipes/add')}>
            <View
              style={[
                styles.quickIconWrap,
                { backgroundColor: COLORS.green },
              ]}>
              <Plus size={24} color={COLORS.white} strokeWidth={2.4} />
            </View>

            <Text style={styles.quickTitle}>Tarif Ekle</Text>
            <Text style={styles.quickSub}>Kendi tarifini oluştur</Text>
          </Pressable>

          <Pressable
            style={[
              styles.quickCard,
              {
                backgroundColor: COLORS.blueSoft,
                borderColor: 'rgba(90, 151, 240, 0.35)',
              },
            ]}
            onPress={() => router.push('/recipes/my-recipes')}>
            <View
              style={[styles.quickIconWrap, { backgroundColor: COLORS.blue }]}>
              <BookOpen size={22} color={COLORS.white} strokeWidth={2.2} />
            </View>

            <Text style={styles.quickTitle}>Tariflerim</Text>
            <Text style={styles.quickSub}>Kaydettiğin tarifler</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.aiCard}
          onPress={() => router.push('/recipes/ai-suggestions')}>
          <View style={styles.aiIcon}>
            <Bot size={22} color={COLORS.white} strokeWidth={2.2} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.aiTitle}>AI Önerisi</Text>
            <Text style={styles.aiSub}>
              Bugün için protein açığını kapatacak yemekler
            </Text>
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
                style={[
                  styles.segmentItem,
                  active && styles.segmentItemActive,
                ]}>
                <Text
                  style={[
                    styles.segmentText,
                    active && styles.segmentTextActive,
                  ]}>
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={styles.searchBox}
          onPress={() => searchInputRef.current?.focus()}>
          <Search size={18} color={COLORS.muted} strokeWidth={2.3} />

          <TextInput
            ref={searchInputRef}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Tarif ara..."
            placeholderTextColor={COLORS.muted}
            style={styles.searchInput}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
        </Pressable>

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Tarifler yükleniyor...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>

            <Pressable style={styles.retryBtn} onPress={loadRecipes}>
              <Text style={styles.retryText}>Tekrar Dene</Text>
            </Pressable>
          </View>
        ) : visibleRecipes.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>{emptyMessage}</Text>
          </View>
        ) : (
          <View style={styles.recipeList}>
            {visibleRecipes.map((recipe) => {
              const recipeId = String(recipe.id);
              const displayCategory = mapCategoryFromBackend(recipe.category);
              const tone = getCardTone(displayCategory);
              const isFavorite = favoriteIds.includes(recipeId);
              const isDeleting = deletingRecipeId === recipeId;

              return (
                <Pressable
                  key={recipeId}
                  style={[
                    styles.recipeCard,
                    {
                      backgroundColor: tone.bg,
                      borderColor: tone.border,
                      opacity: isDeleting ? 0.55 : 1,
                    },
                  ]}
                  disabled={isDeleting}
                  onPress={() =>
                    router.push({
                      pathname: '/recipes/[id]',
                      params: { id: recipeId },
                    })
                  }>
                  <View style={styles.recipeTopRow}>
                    <Text
                      style={[
                        styles.categoryPill,
                        { color: tone.accent },
                      ]}>
                      {displayCategory}
                    </Text>

                    <View style={styles.cardActions}>
                      <Pressable
                        style={styles.cardActionButton}
                        disabled={isDeleting}
                        onPress={(event) => {
                          event.stopPropagation();
                          toggleFavorite(recipeId);
                        }}>
                        <Heart
                          size={17}
                          color={isFavorite ? COLORS.orange : '#B8BFCD'}
                          fill={isFavorite ? COLORS.orange : 'transparent'}
                          strokeWidth={2.4}
                        />
                      </Pressable>

                      <Pressable
                        style={[
                          styles.cardActionButton,
                          styles.deleteActionButton,
                        ]}
                        disabled={isDeleting}
                        onPress={(event) => {
                          event.stopPropagation();
                          handleDeleteRecipe(recipeId);
                        }}>
                        {isDeleting ? (
                          <ActivityIndicator
                            size="small"
                            color={COLORS.danger}
                          />
                        ) : (
                          <Trash2
                            size={17}
                            color={COLORS.danger}
                            strokeWidth={2.3}
                          />
                        )}
                      </Pressable>
                    </View>
                  </View>

                  <Text style={styles.recipeTitle}>
                    {recipe.title ?? recipe.name ?? 'İsimsiz Tarif'}
                  </Text>

                  {recipe.description ? (
                    <Text style={styles.recipeDescription} numberOfLines={2}>
                      {recipe.description}
                    </Text>
                  ) : null}

                  <View style={styles.recipeMetaRow}>
                    <View style={styles.metaItem}>
                      <Clock3
                        size={16}
                        color={COLORS.muted}
                        strokeWidth={2.3}
                      />
                      <Text style={styles.metaText}>
                        {recipe.prepTimeMin ?? 0} dk
                      </Text>
                    </View>

                    <View style={styles.metaItem}>
                      <Users
                        size={16}
                        color={COLORS.muted}
                        strokeWidth={2.3}
                      />
                      <Text style={styles.metaText}>
                        {recipe.servings ?? 1} kişi
                      </Text>
                    </View>

                    <Text style={[styles.kcalText, { color: tone.accent }]}>
                      {recipe.caloriesKcal ?? recipe.calories ?? 0} kcal
                    </Text>
                  </View>

                  {(recipe.tags ?? []).length > 0 ? (
                    <View style={styles.tagRow}>
                      {(recipe.tags ?? []).map((tag) => (
                        <View key={`${recipeId}-${tag}`} style={styles.tag}>
                          <Text
                            style={[
                              styles.tagText,
                              { color: tone.accent },
                            ]}>
                            {String(tag)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        )}
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
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primary,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#4E535F',
    fontWeight: '500',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E7E4EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonActive: {
    backgroundColor: COLORS.orangeSoft,
    borderWidth: 1,
    borderColor: 'rgba(255,107,26,0.28)',
  },
  searchBox: {
    height: 54,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
    paddingVertical: 0,
    borderWidth: 0,
    ...(Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          boxShadow: 'none',
        } as object)
      : {}),
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 130,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  quickIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  quickSub: {
    marginTop: 4,
    fontSize: 12,
    color: '#596172',
    textAlign: 'center',
    fontWeight: '500',
  },
  aiCard: {
    borderRadius: 20,
    backgroundColor: COLORS.purpleSoft,
    borderWidth: 1,
    borderColor: 'rgba(201, 195, 234, 0.55)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  aiIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: 2,
  },
  aiSub: {
    fontSize: 12,
    color: '#4E5563',
    fontWeight: '500',
    lineHeight: 17,
  },
  aiAction: {
    height: 36,
    minWidth: 52,
    borderRadius: 18,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  aiActionText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  segmentedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  segmentItem: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ECE9F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentItemActive: {
    backgroundColor: COLORS.primary,
  },
  segmentText: {
    color: '#727888',
    fontSize: 12,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: COLORS.white,
  },
  centerState: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.muted,
    fontWeight: '700',
  },
  errorCard: {
    borderRadius: 18,
    backgroundColor: COLORS.orangeSoft,
    borderWidth: 1,
    borderColor: 'rgba(255,107,26,0.25)',
    padding: 18,
    alignItems: 'center',
    gap: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#C04A1A',
    fontWeight: '600',
    textAlign: 'center',
  },
  retryBtn: {
    height: 38,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14,
  },
  emptyCard: {
    borderRadius: 18,
    backgroundColor: COLORS.purpleSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 28,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.muted,
    fontWeight: '600',
    textAlign: 'center',
  },
  recipeList: {
    gap: 12,
  },
  recipeCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
  },
  recipeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '700',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardActionButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteActionButton: {
    backgroundColor: 'rgba(253, 229, 218, 0.88)',
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  recipeDescription: {
    fontSize: 12,
    color: '#596172',
    fontWeight: '500',
    lineHeight: 17,
    marginBottom: 8,
  },
  recipeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#4B5361',
    fontWeight: '500',
  },
  kcalText: {
    fontSize: 13,
    fontWeight: '800',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
});