import { supabase } from "../data/supabaseClient";
import type { Category } from "../../types/orgChart";

interface EditCategoryInput {
  id: string;
  name?: string;
  description?: string;
  color?: string;
  order_index?: number;
}

export async function editCategory(input: EditCategoryInput): Promise<Category> {
  const { id, ...updates } = input;

  const { data, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error editing category:", error);
    throw new Error(error.message);
  }

  return data;
}
