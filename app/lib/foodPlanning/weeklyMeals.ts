// app/lib/foodPlanning/weeklyMeals.ts
import { supabase } from "../data/supabaseClient";
import type {
  WeeklyMeal,
  WeeklyMealRow,
  CreateWeeklyMealInput,
  UpdateWeeklyMealInput,
  Person,
  MealType,
} from "../../types/foodPlanning";

// Fetch weekly meals for a date range
export async function fetchWeeklyMeals(
  startDate: string,
  endDate: string,
  person?: Person
): Promise<WeeklyMeal[]> {
  let query = supabase
    .from("weekly_meals")
    .select(`
      *,
      meal_template:meal_templates(*)
    `)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true })
    .order("meal_type", { ascending: true });

  if (person) {
    query = query.eq("person", person);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data as unknown as WeeklyMealRow[]).map(convertRowToWeeklyMeal);
}

// Fetch meals for a specific date
export async function fetchMealsForDate(
  date: string,
  person?: Person
): Promise<WeeklyMeal[]> {
  let query = supabase
    .from("weekly_meals")
    .select(`
      *,
      meal_template:meal_templates(*)
    `)
    .eq("date", date)
    .order("meal_type", { ascending: true });

  if (person) {
    query = query.eq("person", person);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data as unknown as WeeklyMealRow[]).map(convertRowToWeeklyMeal);
}

// Create a new weekly meal
export async function createWeeklyMeal(
  input: CreateWeeklyMealInput
): Promise<WeeklyMeal> {
  const { data, error } = await supabase
    .from("weekly_meals")
    .insert({
      date: input.date,
      meal_type: input.meal_type,
      person: input.person,
      meal_template_id: input.meal_template_id,
      custom_meal_name: input.custom_meal_name,
      custom_ingredients: input.custom_ingredients ?? [],
      notes: input.notes,
    })
    .select(`
      *,
      meal_template:meal_templates(*)
    `)
    .single();

  if (error) throw error;

  return convertRowToWeeklyMeal(data as unknown as WeeklyMealRow);
}

// Update a weekly meal
export async function updateWeeklyMeal(
  id: string,
  input: UpdateWeeklyMealInput
): Promise<WeeklyMeal> {
  const updateData: Record<string, unknown> = {};

  if (input.date !== undefined) updateData.date = input.date;
  if (input.meal_type !== undefined) updateData.meal_type = input.meal_type;
  if (input.person !== undefined) updateData.person = input.person;
  if (input.meal_template_id !== undefined)
    updateData.meal_template_id = input.meal_template_id;
  if (input.custom_meal_name !== undefined)
    updateData.custom_meal_name = input.custom_meal_name;
  if (input.custom_ingredients !== undefined)
    updateData.custom_ingredients = input.custom_ingredients;
  if (input.notes !== undefined) updateData.notes = input.notes;

  const { data, error } = await supabase
    .from("weekly_meals")
    .update(updateData)
    .eq("id", id)
    .select(`
      *,
      meal_template:meal_templates(*)
    `)
    .single();

  if (error) throw error;

  return convertRowToWeeklyMeal(data as unknown as WeeklyMealRow);
}

// Delete a weekly meal
export async function deleteWeeklyMeal(id: string): Promise<void> {
  const { error } = await supabase.from("weekly_meals").delete().eq("id", id);

  if (error) throw error;
}

// Helper: Convert database row to WeeklyMeal
function convertRowToWeeklyMeal(row: WeeklyMealRow & { meal_template?: unknown }): WeeklyMeal {
  return {
    id: row.id,
    date: row.date,
    meal_type: row.meal_type as MealType,
    person: row.person as Person,
    meal_template_id: row.meal_template_id ?? undefined,
    custom_meal_name: row.custom_meal_name ?? undefined,
    custom_ingredients: row.custom_ingredients ?? undefined,
    notes: row.notes ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
