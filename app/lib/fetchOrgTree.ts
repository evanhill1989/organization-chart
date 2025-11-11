// app/lib/fetchOrgTree.ts
import type { OrgNodeRow, OrgNode } from "../types/orgChart";
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

  // Build the tree manually for this specific category
  const nodeMap = new Map<number, OrgNode>();
  const topLevelNodes: OrgNode[] = [];

  // First pass: create all nodes
  (typedData ?? []).forEach((row) => {
    nodeMap.set(row.id, {
      id: row.id,
      name: row.name,
      type: row.type as "top_category" | "category" | "task",
      details: row.details ?? undefined,
      importance: row.importance ?? (row.type === "task" ? 1 : undefined),
      deadline: row.deadline ?? undefined,
      completion_time: row.completion_time ?? undefined,
      unique_days_required: row.unique_days_required ?? undefined,
      is_completed: row.is_completed ?? undefined,
      completed_at: row.completed_at ?? undefined,
      completion_comment: row.completion_comment ?? undefined,
      children: [],
      parent_id: row.parent_id,
      recurrence_type: row.recurrence_type ?? undefined,
      recurrence_interval: row.recurrence_interval ?? undefined,
      recurrence_day_of_week: row.recurrence_day_of_week ?? undefined,
      recurrence_day_of_month: row.recurrence_day_of_month ?? undefined,
      recurrence_end_date: row.recurrence_end_date ?? undefined,
      is_recurring_template: row.is_recurring_template ?? undefined,
      recurring_template_id: row.recurring_template_id ?? undefined,
    });
  });

  // Second pass: build parent-child relationships
  (typedData ?? []).forEach((row) => {
    const node = nodeMap.get(row.id)!;
    if (row.parent_id) {
      const parent = nodeMap.get(row.parent_id);
      if (parent) {
        parent.children!.push(node);
      }
    } else {
      // No parent_id means this is a top-level node
      topLevelNodes.push(node);
    }
  });

  // Return a synthetic root node for the category
  return {
    id: 0,
    name: category.name,
    type: "category" as const,
    category_id: categoryId,
    children: topLevelNodes,
  };
}
