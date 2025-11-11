// app/lib/foodPlanning/groceryList.ts
import { supabase } from "../data/supabaseClient";
import type {
  GroceryListItem,
  GroceryListItemRow,
  CreateGroceryItemInput,
  GroceryCategory,
} from "../../types/foodPlanning";

// Fetch all grocery list items
export async function fetchGroceryList(): Promise<GroceryListItem[]> {
  const { data, error } = await supabase
    .from("grocery_list_items")
    .select("*")
    .order("category", { ascending: true })
    .order("ingredient_name", { ascending: true });

  if (error) throw error;

  return (data as GroceryListItemRow[]).map(convertRowToGroceryItem);
}

// Fetch unchecked grocery list items
export async function fetchUncheckedGroceryItems(): Promise<GroceryListItem[]> {
  const { data, error } = await supabase
    .from("grocery_list_items")
    .select("*")
    .eq("is_checked", false)
    .order("category", { ascending: true })
    .order("ingredient_name", { ascending: true });

  if (error) throw error;

  return (data as GroceryListItemRow[]).map(convertRowToGroceryItem);
}

// Add item to grocery list
export async function addGroceryItem(
  input: CreateGroceryItemInput
): Promise<GroceryListItem> {
  const { data, error } = await supabase
    .from("grocery_list_items")
    .insert({
      ingredient_name: input.ingredient_name,
      quantity: input.quantity,
      category: input.category ?? "Other",
      source_meal_id: input.source_meal_id,
    })
    .select()
    .single();

  if (error) throw error;

  return convertRowToGroceryItem(data as GroceryListItemRow);
}

// Toggle item checked status
export async function toggleGroceryItemChecked(
  id: string,
  isChecked: boolean
): Promise<GroceryListItem> {
  const { data, error } = await supabase
    .from("grocery_list_items")
    .update({
      is_checked: isChecked,
      checked_at: isChecked ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return convertRowToGroceryItem(data as GroceryListItemRow);
}

// Update grocery item
export async function updateGroceryItem(
  id: string,
  updates: {
    ingredient_name?: string;
    quantity?: string;
    category?: GroceryCategory;
  }
): Promise<GroceryListItem> {
  const { data, error } = await supabase
    .from("grocery_list_items")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return convertRowToGroceryItem(data as GroceryListItemRow);
}

// Delete grocery item
export async function deleteGroceryItem(id: string): Promise<void> {
  const { error } = await supabase
    .from("grocery_list_items")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// Clear all checked items
export async function clearCheckedItems(): Promise<void> {
  const { error } = await supabase
    .from("grocery_list_items")
    .delete()
    .eq("is_checked", true);

  if (error) throw error;
}

// Helper: Convert database row to GroceryListItem
function convertRowToGroceryItem(row: GroceryListItemRow): GroceryListItem {
  return {
    id: row.id,
    ingredient_name: row.ingredient_name,
    quantity: row.quantity ?? undefined,
    category: (row.category as GroceryCategory) ?? undefined,
    is_checked: row.is_checked,
    source_meal_id: row.source_meal_id ?? undefined,
    added_at: row.added_at,
    checked_at: row.checked_at ?? undefined,
  };
}
