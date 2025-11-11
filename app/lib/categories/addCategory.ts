import { supabase } from "../data/supabaseClient";
import type { Category } from "../../types/orgChart";

interface AddCategoryInput {
  user_id: string;
  name: string;
  description?: string;
  color?: string;
  order_index: number;
}

export async function addCategory(input: AddCategoryInput): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .insert({
      user_id: input.user_id,
      name: input.name,
      description: input.description,
      color: input.color || "#3B82F6", // Default blue
      order_index: input.order_index,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding category:", error);
    throw new Error(error.message);
  }

  return data;
}
