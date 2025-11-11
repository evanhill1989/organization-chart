import { supabase } from "../data/supabaseClient";
import type { Category } from "../../types/orgChart";

// Archive a category (soft delete)
export async function archiveCategory(categoryId: string): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .update({
      archived: true,
      archived_at: new Date().toISOString(),
    })
    .eq("id", categoryId)
    .select()
    .single();

  if (error) {
    console.error("Error archiving category:", error);
    throw new Error(error.message);
  }

  return data;
}

// Unarchive a category (restore)
export async function unarchiveCategory(categoryId: string): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .update({
      archived: false,
      archived_at: null,
    })
    .eq("id", categoryId)
    .select()
    .single();

  if (error) {
    console.error("Error unarchiving category:", error);
    throw new Error(error.message);
  }

  return data;
}
