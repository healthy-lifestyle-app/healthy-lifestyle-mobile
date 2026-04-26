import { getAccessToken } from '@/lib/storage';

const API_BASE_URL = 'http://172.16.50.202:3000/api';

export type RecipeCategory =
  | 'BREAKFAST'
  | 'LUNCH'
  | 'DINNER'
  | 'SNACK'
  | string;

export type RecipeIngredient = {
  id?: string | number;
  foodId?: string | number | null;
  name?: string | null;
  amountText?: string | null;
  amountG?: string | number | null;
  quantity?: string | number | null;
  orderNo?: number | null;
  food?: {
    name?: string | null;
  } | null;
};

export type RecipeStep = {
  id?: string | number;
  orderNo?: number | null;
  text?: string | null;
  description?: string | null;
  instruction?: string | null;
};

export type BackendRecipe = {
  id: string | number;
  userId?: string;
  title?: string | null;
  name?: string | null;
  description?: string | null;
  category?: RecipeCategory | null;
  prepTimeMin?: number | null;
  cookTimeMin?: number | null;
  totalTimeMin?: number | null;
  servings?: number | null;
  caloriesKcal?: number | null;
  calories?: number | null;
  imageUrl?: string | null;
  tags?: string[] | null;
  tip?: string | null;
  isPublic?: boolean;
  isAiGenerated?: boolean;
  isFavorite?: boolean;
  ingredients?: Array<RecipeIngredient | string> | null;
  steps?: Array<RecipeStep | string> | null;
  instructions?: Array<RecipeStep | string> | string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Recipe = BackendRecipe;

type ApiListResponse<T> = T[] | { data?: T[]; recipes?: T[]; items?: T[] };

export type CreateRecipeIngredientPayload = {
  foodId?: string | number | null;
  name: string;
  amountText: string;
  orderNo?: number;
};

export type CreateRecipeStepPayload = {
  text: string;
  orderNo?: number;
};

export type CreateRecipePayload = {
  title: string;
  description?: string | null;
  category: string;
  prepTimeMin?: number | null;
  servings?: number | null;
  caloriesKcal?: number | null;
  imageUrl?: string | null;
  tags?: string[];
  tip?: string | null;
  isPublic?: boolean;
  ingredients: CreateRecipeIngredientPayload[];
  steps: CreateRecipeStepPayload[];
};

async function getAuthHeaders() {
  const token = await getAccessToken();

  console.log('RECIPE_TOKEN_EXISTS', !!token);

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string): Promise<T> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.log('RECIPES_API_ERROR', data);
    throw new Error(data?.message ?? 'Tarif verileri alınamadı.');
  }

  return data as T;
}

async function postRequest<T>(path: string, body: unknown): Promise<T> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.log('RECIPES_API_POST_ERROR', data);
    throw new Error(data?.message ?? 'Tarif kaydedilemedi.');
  }

  return data as T;
}

async function deleteRequest<T>(path: string): Promise<T> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.log('RECIPES_API_DELETE_ERROR', data);
    throw new Error(data?.message ?? 'Tarif silinemedi.');
  }

  return data as T;
}

function normalizeListResponse<T>(response: ApiListResponse<T>): T[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.recipes)) {
    return response.recipes;
  }

  if (Array.isArray(response.items)) {
    return response.items;
  }

  return [];
}

export async function getRecipes(): Promise<BackendRecipe[]> {
  const response = await request<ApiListResponse<BackendRecipe>>('/recipes');

  return normalizeListResponse(response);
}

export async function getRecipeById(
  id: string | number,
): Promise<BackendRecipe> {
  return request<BackendRecipe>(`/recipes/${String(id)}`);
}

export async function createRecipe(
  payload: CreateRecipePayload,
): Promise<BackendRecipe> {
  return postRequest<BackendRecipe>('/recipes', payload);
}

export async function deleteRecipe(id: string | number): Promise<void> {
  await deleteRequest<void>(`/recipes/${String(id)}`);
}

export function mapCategoryFromBackend(category?: string | null) {
  switch (category) {
    case 'BREAKFAST':
      return 'Kahvaltı';
    case 'LUNCH':
      return 'Öğle';
    case 'DINNER':
      return 'Akşam';
    case 'SNACK':
      return 'Atıştırma';
    default:
      return 'Diğer';
  }
}

export function mapCategoryToBackend(category: string) {
  switch (category) {
    case 'Kahvaltı':
      return 'BREAKFAST';
    case 'Öğle':
      return 'LUNCH';
    case 'Akşam':
      return 'DINNER';
    case 'Atıştırma':
      return 'SNACK';
    default:
      return '';
  }
}

export function getRecipeTitle(recipe: BackendRecipe) {
  return recipe.title ?? recipe.name ?? 'İsimsiz Tarif';
}

export function getRecipeCalories(recipe: BackendRecipe) {
  return recipe.caloriesKcal ?? recipe.calories ?? 0;
}

export function getRecipeTime(recipe: BackendRecipe) {
  return recipe.prepTimeMin ?? recipe.totalTimeMin ?? recipe.cookTimeMin ?? 0;
}

export function getIngredientLabel(ingredient: RecipeIngredient | string) {
  if (typeof ingredient === 'string') {
    return ingredient;
  }

  const name = ingredient.name ?? ingredient.food?.name ?? 'Malzeme';

  const amount =
    ingredient.amountText ?? ingredient.amountG ?? ingredient.quantity ?? '';

  return amount ? `${name} - ${amount}` : name;
}

export function getStepLabel(step: RecipeStep | string) {
  if (typeof step === 'string') {
    return step;
  }

  return (
    step.text ??
    step.description ??
    step.instruction ??
    'Adım bilgisi bulunamadı.'
  );
}

export function toDisplayText(value: unknown, fallback = '') {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'object') {
    const objectValue = value as Record<string, unknown>;

    return String(
      objectValue.name ??
        objectValue.title ??
        objectValue.label ??
        objectValue.text ??
        fallback,
    );
  }

  return fallback;
}