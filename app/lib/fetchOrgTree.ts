// app/lib/fetchOrgTree.ts
import type { OrgNodeRow } from "../types/orgChart";
import { buildOrgTree } from "./buildOrgTree";
import { supabase } from "./data/supabaseClient";

export async function fetchOrgTree(categoryId: string) {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // First, validate that the category exists and belongs to the user
  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id, name, user_id")
    .eq("id", categoryId)
    .eq("user_id", user.id)
    .single();

  if (categoryError || !category) {
    throw new Error("Category not found or access denied");
  }

  // Fetch org nodes for this category
  const { data, error } = await supabase
    .from("org_nodes")
    .select("*")
    .eq("category_id", categoryId)
    .eq("user_id", user.id)
    .not("is_completed", "is", true); // Filter out completed tasks

  const typedData = data as OrgNodeRow[];

  if (error) throw error;

  const tree = buildOrgTree(typedData ?? []);

  // Return the tree for this category (using category name as key)
  // or return a default empty node
  return (
    tree[category.name] ?? {
      id: 0,
      name: category.name,
      type: "category",
      root_category: category.name, // Keep for backward compatibility
      category_id: categoryId,
      children: [],
    }
  );
}
