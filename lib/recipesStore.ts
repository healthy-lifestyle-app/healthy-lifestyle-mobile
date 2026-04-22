import AsyncStorage from '@react-native-async-storage/async-storage';

export type RecipeCategory = 'Kahvaltı' | 'Öğle' | 'Akşam' | 'Atıştırma';

export type Recipe = {
  id: string;
  title: string;
  category: RecipeCategory;
  durationMin: number;
  servings: number;
  calories: number;
  tags: string[];
  ingredients: string[];
  steps: string[];
  tip?: string;
  imageUrl?: string;
  isUserCreated: boolean;
  createdAt: string;
};

type CreateRecipeInput = {
  title: string;
  category: RecipeCategory;
  durationMin: number;
  servings: number;
  calories: number;
  tags: string[];
  ingredients: string[];
  steps: string[];
  tip?: string;
  imageUrl?: string;
};

const RECIPES_STORAGE_KEY = 'recipes_user_v1';

const BUILTIN_RECIPES: Recipe[] = [
  {
    id: 'builtin-quinoa-bowl',
    title: 'Quinoa Buddha Bowl',
    category: 'Öğle',
    durationMin: 25,
    servings: 1,
    calories: 450,
    tags: ['Vegan', 'Protein'],
    ingredients: [
      '1 su bardağı quinoa',
      '1 avuç ıspanak',
      '1/2 avokado',
      '1/2 su bardağı nohut',
      'Cherry domates',
      '1 yemek kaşığı tahin',
      'Limon suyu',
      'Zeytinyağı',
    ],
    steps: [
      'Quinoayı bol suda haşlayın ve süzün.',
      'Nohutları baharatlarla karıştırıp fırında kızartın.',
      'Ispanağı hafifçe sote edin.',
      'Servis kasesine quinoayı yerleştirin.',
      'Üzerine ıspanak, avokado, nohut ve domatesleri dizin.',
      'Tahin ve limon suyunu karıştırıp üzerine dökün.',
    ],
    tip: 'Malzemeleri taze kullanırsan tat ve doku çok daha iyi olur.',
    imageUrl:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80',
    isUserCreated: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'builtin-avocado-eggs',
    title: 'Avokadolu Yumurtalar',
    category: 'Kahvaltı',
    durationMin: 15,
    servings: 2,
    calories: 320,
    tags: ['Protein', 'Sağlıklı Yağ'],
    ingredients: ['2 yumurta', '1/2 avokado', '1 dilim tam buğday ekmek', 'Baharatlar'],
    steps: [
      'Yumurtaları haşla.',
      'Avokadoyu ezip baharatlarla karıştır.',
      'Ekmeğin üzerine avokado ve dilimlenmiş yumurtaları yerleştir.',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=80',
    isUserCreated: false,
    createdAt: new Date().toISOString(),
  },
];

async function getUserRecipes(): Promise<Recipe[]> {
  const raw = await AsyncStorage.getItem(RECIPES_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Recipe[];
  } catch {
    return [];
  }
}

async function saveUserRecipes(recipes: Recipe[]) {
  await AsyncStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(recipes));
}

export async function getAllRecipes(): Promise<Recipe[]> {
  const userRecipes = await getUserRecipes();
  return [...userRecipes, ...BUILTIN_RECIPES];
}

export async function getMyRecipes(): Promise<Recipe[]> {
  return getUserRecipes();
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const all = await getAllRecipes();
  return all.find((recipe) => recipe.id === id) ?? null;
}

export async function createRecipe(input: CreateRecipeInput): Promise<Recipe> {
  const nextRecipe: Recipe = {
    id: `user-${Date.now()}`,
    ...input,
    tags: input.tags.filter(Boolean),
    ingredients: input.ingredients.filter((item) => item.trim().length > 0),
    steps: input.steps.filter((item) => item.trim().length > 0),
    isUserCreated: true,
    createdAt: new Date().toISOString(),
  };

  const existing = await getUserRecipes();
  await saveUserRecipes([nextRecipe, ...existing]);

  return nextRecipe;
}
