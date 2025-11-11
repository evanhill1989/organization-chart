// app/lib/foodPlanning/mealTemplates.ts
import { supabase } from "../data/supabaseClient";
import type {
  MealTemplate,
  MealTemplateRow,
  CreateMealTemplateInput,
  UpdateMealTemplateInput,
  Person,
  MealType,
} from "../../types/foodPlanning";

// Fetch all meal templates
export async function fetchMealTemplates(): Promise<MealTemplate[]> {
  const { data, error } = await supabase
    .from("meal_templates")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data as MealTemplateRow[]).map(convertRowToMealTemplate);
}

// Fetch meal templates by person
export async function fetchMealTemplatesByPerson(
  person: Person
): Promise<MealTemplate[]> {
  const { data, error } = await supabase
    .from("meal_templates")
    .select("*")
    .eq("person", person)
    .order("meal_type", { ascending: true });

  if (error) throw error;

  return (data as MealTemplateRow[]).map(convertRowToMealTemplate);
}

// Fetch fixed meal templates (auto-populated meals)
export async function fetchFixedMealTemplates(
  person: Person
): Promise<MealTemplate[]> {
  const { data, error } = await supabase
    .from("meal_templates")
    .select("*")
    .eq("person", person)
    .eq("is_fixed", true)
    .order("meal_type", { ascending: true });

  if (error) throw error;

  return (data as MealTemplateRow[]).map(convertRowToMealTemplate);
}

// Create a new meal template
export async function createMealTemplate(
  input: CreateMealTemplateInput
): Promise<MealTemplate> {
  const { data, error } = await supabase
    .from("meal_templates")
    .insert({
      name: input.name,
      meal_type: input.meal_type,
      person: input.person,
      is_fixed: input.is_fixed ?? false,
      ingredients: input.ingredients ?? [],
      notes: input.notes,
    })
    .select()
    .single();

  if (error) throw error;

  return convertRowToMealTemplate(data as MealTemplateRow);
}

// Update a meal template
export async function updateMealTemplate(
  id: string,
  input: UpdateMealTemplateInput
): Promise<MealTemplate> {
  const updateData: Record<string, unknown> = {};

  if (input.name !== undefined) updateData.name = input.name;
  if (input.meal_type !== undefined) updateData.meal_type = input.meal_type;
  if (input.person !== undefined) updateData.person = input.person;
  if (input.is_fixed !== undefined) updateData.is_fixed = input.is_fixed;
  if (input.ingredients !== undefined) updateData.ingredients = input.ingredients;
  if (input.notes !== undefined) updateData.notes = input.notes;

  const { data, error } = await supabase
    .from("meal_templates")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return convertRowToMealTemplate(data as MealTemplateRow);
}

// Delete a meal template
export async function deleteMealTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from("meal_templates")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// Helper: Convert database row to MealTemplate
function convertRowToMealTemplate(row: MealTemplateRow): MealTemplate {
  return {
    id: row.id,
    name: row.name,
    meal_type: row.meal_type as MealType,
    person: row.person as Person,
    is_fixed: row.is_fixed,
    ingredients: row.ingredients ?? [],
    notes: row.notes ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
