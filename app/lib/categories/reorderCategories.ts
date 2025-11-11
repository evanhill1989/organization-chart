import { supabase } from "../data/supabaseClient";
import type { Category } from "../../types/orgChart";

interface ReorderInput {
  id: string;
  order_index: number;
}

// Batch update order_index for multiple categories
export async function reorderCategories(
  updates: ReorderInput[]
): Promise<Category[]> {
  // Update each category's order_index
  const promises = updates.map((update) =>
    supabase
      .from("categories")
      .update({ order_index: update.order_index })
      .eq("id", update.id)
      .select()
      .single()
  );

  const results = await Promise.all(promises);

  // Check for any errors
  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    console.error("Error reordering categories:", errors);
    throw new Error("Failed to reorder categories");
  }

  return results.map((r) => r.data!);
}
