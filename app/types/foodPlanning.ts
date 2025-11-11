// app/types/foodPlanning.ts

export type MealType =
  | 'pre-breakfast'
  | 'smoothie'
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'snack';

export type Person = 'adult' | 'toddler';

export type GroceryCategory =
  | 'Produce'
  | 'Dairy'
  | 'Meat'
  | 'Pantry'
  | 'Frozen'
  | 'Other';

export interface Ingredient {
  name: string;
  quantity?: string; // e.g. "2 cups", "3 slices"
}

// Meal Template - Reusable meal definition
export interface MealTemplate {
  id: string;
  name: string;
  meal_type: MealType;
  person: Person;
  is_fixed: boolean; // Auto-populate daily if true
  ingredients: Ingredient[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Row type from Supabase (ingredients as JSONB)
export interface MealTemplateRow {
  id: string;
  name: string;
  meal_type: string;
  person: string;
  is_fixed: boolean;
  ingredients: Ingredient[] | null; // JSONB field
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Weekly Meal - Scheduled meal on a specific date
export interface WeeklyMeal {
  id: string;
  date: string; // ISO date string
  meal_type: MealType;
  person: Person;
  meal_template_id?: string;
  meal_template?: MealTemplate; // Joined data
  custom_meal_name?: string;
  custom_ingredients?: Ingredient[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Row type from Supabase
export interface WeeklyMealRow {
  id: string;
  date: string;
  meal_type: string;
  person: string;
  meal_template_id: string | null;
  custom_meal_name: string | null;
  custom_ingredients: Ingredient[] | null; // JSONB field
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Grocery List Item
export interface GroceryListItem {
  id: string;
  ingredient_name: string;
  quantity?: string;
  category?: GroceryCategory;
  is_checked: boolean;
  source_meal_id?: string; // Links to weekly_meals
  added_at: string;
  checked_at?: string;
}

// Row type from Supabase
export interface GroceryListItemRow {
  id: string;
  ingredient_name: string;
  quantity: string | null;
  category: string | null;
  is_checked: boolean;
  source_meal_id: string | null;
  added_at: string;
  checked_at: string | null;
}

// Helpers for meal template creation
export interface CreateMealTemplateInput {
  name: string;
  meal_type: MealType;
  person: Person;
  is_fixed?: boolean;
  ingredients?: Ingredient[];
  notes?: string;
}

export interface UpdateMealTemplateInput {
  name?: string;
  meal_type?: MealType;
  person?: Person;
  is_fixed?: boolean;
  ingredients?: Ingredient[];
  notes?: string;
}

// Helpers for weekly meal scheduling
export interface CreateWeeklyMealInput {
  date: string;
  meal_type: MealType;
  person: Person;
  meal_template_id?: string;
  custom_meal_name?: string;
  custom_ingredients?: Ingredient[];
  notes?: string;
}

export interface UpdateWeeklyMealInput {
  date?: string;
  meal_type?: MealType;
  person?: Person;
  meal_template_id?: string;
  custom_meal_name?: string;
  custom_ingredients?: Ingredient[];
  notes?: string;
}

// Helpers for grocery list
export interface CreateGroceryItemInput {
  ingredient_name: string;
  quantity?: string;
  category?: GroceryCategory;
  source_meal_id?: string;
}
