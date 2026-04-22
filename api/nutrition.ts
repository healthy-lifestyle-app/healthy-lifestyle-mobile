import { apiRequest } from '@/api/client';

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export type Food = {
  id: string;
  name: string;
  source: string;
  servingSizeG: number;
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
};

export type FoodsResponse = {
  items: Food[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type MealItem = {
  id?: string | number;
  foodId: string;
  foodName: string;
  quantity: number;
  amountG?: number | null;
  caloriesKcal: number;
  carbsG: number;
  fatG: number;
  proteinG: number;
};

export type NutritionMeal = {
  id: number;
  mealType: MealType;
  mealTime: string;
  items: MealItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
};

export type NutritionSummary = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type CreateMealPayload = {
  mealType: MealType;
  mealTime: string;
  items: Array<{
    foodId: string;
    quantity: number;
    amountG?: number;
  }>;
};

function toQueryString(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

function normalizeFood(raw: any): Food {
  return {
    id: String(raw.id),
    name: raw.name ?? '',
    source: raw.source ?? '',
    servingSizeG: Number(raw.servingSizeG ?? raw.serving_size_g ?? 0),
    caloriesKcal: Number(raw.caloriesKcal ?? raw.calories_kcal ?? 0),
    proteinG: Number(raw.proteinG ?? raw.protein_g ?? 0),
    carbsG: Number(raw.carbsG ?? raw.carbs_g ?? 0),
    fatG: Number(raw.fatG ?? raw.fat_g ?? 0),
    fiberG: Number(raw.fiberG ?? raw.fiber_g ?? 0),
    sugarG: Number(raw.sugarG ?? raw.sugar_g ?? 0),
    sodiumMg: Number(raw.sodiumMg ?? raw.sodium_mg ?? 0),
  };
}

function normalizeMealItem(raw: any): MealItem {
  return {
    id: raw.id,
    foodId: String(raw.foodId ?? raw.food_id ?? raw.food?.id ?? ''),
    foodName: raw.foodName ?? raw.food_name ?? raw.food?.name ?? 'Besin',
    quantity: Number(raw.quantity ?? 1),
    amountG: raw.amountG ?? raw.amount_g ?? null,
    caloriesKcal: Number(raw.caloriesKcal ?? raw.calories_kcal ?? 0),
    carbsG: Number(raw.carbsG ?? raw.carbs_g ?? 0),
    fatG: Number(raw.fatG ?? raw.fat_g ?? 0),
    proteinG: Number(raw.proteinG ?? raw.protein_g ?? 0),
  };
}

function normalizeMealType(rawType: any): MealType {
  const value = String(rawType ?? '').trim();
  const upper = value.toUpperCase();

  if (upper === 'BREAKFAST' || value === 'breakfast') return 'BREAKFAST';
  if (upper === 'LUNCH' || value === 'lunch') return 'LUNCH';
  if (upper === 'DINNER' || value === 'dinner') return 'DINNER';
  if (upper === 'SNACK' || value === 'snack') return 'SNACK';

  // Fallback: backend mismatch -> default to snack to avoid losing entries silently
  return 'SNACK';
}

function sumBy(
  items: MealItem[],
  key: keyof Pick<MealItem, 'caloriesKcal' | 'proteinG' | 'carbsG' | 'fatG'>,
) {
  return items.reduce((total, item) => total + Number(item[key] ?? 0), 0);
}

function normalizeMeal(raw: any): NutritionMeal {
  const rawItems = raw.items ?? raw.mealItems ?? raw.meal_items ?? [];
  const items = Array.isArray(rawItems) ? rawItems.map(normalizeMealItem) : [];

  const totals = raw.totals ?? raw.total ?? null;
  const totalCaloriesRaw =
    raw.totalCalories ?? raw.total_calories ?? totals?.calories ?? totals?.totalCalories;
  const totalProteinRaw =
    raw.totalProtein ?? raw.total_protein ?? totals?.protein ?? totals?.totalProtein;
  const totalCarbsRaw = raw.totalCarbs ?? raw.total_carbs ?? totals?.carbs ?? totals?.totalCarbs;
  const totalFatRaw = raw.totalFat ?? raw.total_fat ?? totals?.fat ?? totals?.totalFat;

  return {
    id: Number(raw.id),
    mealType: normalizeMealType(raw.mealType ?? raw.meal_type),
    mealTime: raw.mealTime ?? raw.meal_time ?? '',
    items,
    totalCalories:
      Number(totalCaloriesRaw) || sumBy(items, 'caloriesKcal'),
    totalProtein:
      Number(totalProteinRaw) || sumBy(items, 'proteinG'),
    totalCarbs:
      Number(totalCarbsRaw) || sumBy(items, 'carbsG'),
    totalFat:
      Number(totalFatRaw) || sumBy(items, 'fatG'),
  };
}

function normalizeSummary(raw: any): NutritionSummary {
  const totals = raw?.totals ?? raw?.total ?? raw;
  return {
    calories: Number(totals?.calories ?? totals?.totalCalories ?? totals?.total_calories ?? 0),
    protein: Number(totals?.protein ?? totals?.totalProtein ?? totals?.total_protein ?? 0),
    carbs: Number(totals?.carbs ?? totals?.totalCarbs ?? totals?.total_carbs ?? 0),
    fat: Number(totals?.fat ?? totals?.totalFat ?? totals?.total_fat ?? 0),
  };
}

export async function getFoods(params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<FoodsResponse> {
  const response = await apiRequest<any>(
    `/api/nutrition/foods${toQueryString({
      search: params?.search,
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    })}`,
    {
      method: 'GET',
    },
  );

  return {
    items: Array.isArray(response?.items) ? response.items.map(normalizeFood) : [],
    meta: {
      page: Number(response?.meta?.page ?? 1),
      limit: Number(response?.meta?.limit ?? 20),
      total: Number(response?.meta?.total ?? 0),
      totalPages: Number(response?.meta?.totalPages ?? 1),
    },
  };
}

export async function getFoodById(id: string | number) {
  const response = await apiRequest<any>(`/api/nutrition/foods/${id}`, {
    method: 'GET',
  });

  return normalizeFood(response);
}

export async function getMealsByDate(date: string) {
  const response = await apiRequest<any>(
    `/api/nutrition/meals${toQueryString({ date })}`,
    {
      method: 'GET',
    },
  );

  const meals = Array.isArray(response)
    ? response
    : Array.isArray(response?.meals)
      ? response.meals
      : [];

  return meals.map(normalizeMeal);
}

export async function getNutritionSummary(date: string) {
  const response = await apiRequest<any>(
    `/api/nutrition/summary${toQueryString({ date })}`,
    {
      method: 'GET',
    },
  );

  return normalizeSummary(response);
}

export async function createMeal(payload: CreateMealPayload) {
  const response = await apiRequest<any>('/api/nutrition/meals', {
    method: 'POST',
    body: {
      mealType: payload.mealType,
      mealTime: payload.mealTime,
      items: payload.items.map((item) => ({
        foodId: String(item.foodId),
        quantity: Number(item.quantity),
        ...(item.amountG !== undefined ? { amountG: Number(item.amountG) } : {}),
      })),
    },
  });

  return normalizeMeal(response);
}

export async function deleteMeal(id: number) {
  return apiRequest<void>(`/api/nutrition/meals/${id}`, {
    method: 'DELETE',
  });
}

export async function deleteMealItem(id: number | string) {
  return apiRequest<void>(`/api/nutrition/meal-items/${id}`, {
    method: 'DELETE',
  });
}