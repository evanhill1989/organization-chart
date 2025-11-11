// app/lib/addOrgNode.ts
import type { OrgNode, OrgNodeRow, RecurrenceType } from "../types/orgChart";
import { buildOrgTree } from "./buildOrgTree";
import { supabase } from "./data/supabaseClient";

// Returns the complete tree for the category, not just the inserted row
export async function addOrgNode({
  name,
  type,
  details,
  importance,
  deadline,
  completion_time,
  unique_days_required,
  parent_id,
  category_id,
  tab_name, // Keep for backward compatibility with buildOrgTree
  root_category, // Keep for backward compatibility with buildOrgTree
  // Add recurrence fields
  recurrence_type = "none",
  recurrence_interval,
  recurrence_day_of_week,
  recurrence_day_of_month,
  recurrence_end_date,
  is_recurring_template = false,
}: {
  name: string;
  type: "category" | "task";
  details?: string;
  importance?: number;
  deadline?: string;
  completion_time?: number;
  unique_days_required?: number;
  parent_id?: number;
  category_id: string; // New UUID reference (required)
  tab_name: string; // Keep for backward compatibility
  root_category: string; // Keep for backward compatibility
  // Add recurrence field types
  recurrence_type?: RecurrenceType;
  recurrence_interval?: number;
  recurrence_day_of_week?: number;
  recurrence_day_of_month?: number;
  recurrence_end_date?: string;
  is_recurring_template?: boolean;
}): Promise<OrgNode> {
  console.log("🔥 addOrgNode: Received data:", {
    name,
    type,
    recurrence_type,
    recurrence_interval,
    recurrence_day_of_week,
    recurrence_day_of_month,
    recurrence_end_date,
    is_recurring_template,
  });

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // Insert the new node
  const insertData = {
    name,
    type,
    details,
    importance: type === "task" ? (importance ?? 1) : undefined,
    deadline: type === "task" ? deadline : undefined,
    completion_time: type === "task" ? completion_time : undefined,
    unique_days_required: type === "task" ? unique_days_required : undefined,
    parent_id,
    category_id, // ✅ New UUID reference
    tab_name, // Keep for backward compatibility
    root_category, // Keep for backward compatibility
    // Add recurrence fields
    recurrence_type,
    recurrence_interval,
    recurrence_day_of_week,
    recurrence_day_of_month,
    recurrence_end_date,
    is_recurring_template,
    // Set last_touched_at for tasks
    last_touched_at: type === "task" ? new Date().toISOString() : undefined,
    // Add user_id
    user_id: user.id,
  };

  console.log("🔥 addOrgNode: Inserting to DB:", insertData);

  const { data: insertedNode, error: insertError } = await supabase
    .from("org_nodes")
    .insert([insertData])
    .select()
    .single();

  console.log("🔥 addOrgNode: Insert result:", { insertedNode, insertError });

  if (insertError) {
    console.error("🚨 addOrgNode: Insert failed:", insertError);
    throw insertError;
  }

  // Fetch all nodes for this category_id to rebuild the complete tree
  const { data: allNodes, error: fetchError } = await supabase
    .from("org_nodes")
    .select("*")
    .eq("category_id", category_id)
    .eq("user_id", user.id);

  if (fetchError) throw fetchError;

  const typedData = allNodes as OrgNodeRow[];
  const tree = buildOrgTree(typedData ?? []);

  // Return the complete tree for this category (using root_category name for backward compatibility)
  return (
    tree[root_category] ?? {
      id: 0,
      name: root_category,
      type: "category",
      root_category,
      category_id,
      children: [],
    }
  );
}
