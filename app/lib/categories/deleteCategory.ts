import { supabase } from "../data/supabaseClient";

// Check if category has any org_nodes before deleting
export async function checkCategoryHasNodes(categoryId: string): Promise<number> {
  const { count, error } = await supabase
    .from("org_nodes")
    .select("*", { count: "exact", head: true })
    .eq("category_id", categoryId);

  if (error) {
    console.error("Error checking category nodes:", error);
    throw new Error(error.message);
  }

  return count || 0;
}

// Delete a category (will cascade delete org_nodes due to foreign key)
export async function deleteCategory(categoryId: string): Promise<void> {
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);

  if (error) {
    console.error("Error deleting category:", error);
    throw new Error(error.message);
  }
}
