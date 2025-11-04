// app/lib/addOrgNode.ts
import type { OrgNode, OrgNodeRow, RecurrenceType } from "../types/orgChart";
import { buildOrgTree } from "./buildOrgTree";
import { supabase } from "./data/supabaseClient";

// Returns the complete tree for the tab, not just the inserted row
export async function addOrgNode({
  name,
  type,
  details,
  importance,
  deadline,
  completion_time,
  unique_days_required,
  parent_id,
  tab_name,
  root_category,
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
  tab_name: string;
  root_category: string;
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
    tab_name,
    root_category,
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

  // Fetch all nodes for this root_category to rebuild the complete tree
  const { data: allNodes, error: fetchError } = await supabase
    .from("org_nodes")
    .select("*")
    .eq("root_category", root_category)
    .eq("user_id", user.id); // Filter by user_id

  if (fetchError) throw fetchError;

  const typedData = allNodes as OrgNodeRow[];
  const tree = buildOrgTree(typedData ?? []);

  // Return the complete tree for this root_category
  return (
    tree[root_category] ?? {
      id: 0,
      name: root_category,
      type: "category",
      root_category,
      children: [],
    }
  );
}
