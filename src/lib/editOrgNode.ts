import { supabase } from "./db/supabaseClient";
import type { OrgNodeRow } from "../types/orgChart";

// Just update the node and return the updated row - no need for tree rebuilding
export async function editOrgNode({
  id,
  name,
  details,
  importance,
  deadline,
  completion_time,
  unique_days_required,
}: {
  id?: number;
  name?: string;
  details?: string;
  importance?: number;
  deadline?: string;
  completion_time?: number;
  unique_days_required?: number;
}): Promise<OrgNodeRow> {
  const updateData: Partial<OrgNodeRow> = {};

  if (name !== undefined) updateData.name = name;
  if (details !== undefined) updateData.details = details;
  if (importance !== undefined) updateData.importance = importance;
  // New deadline-related fields
  if (deadline !== undefined) updateData.deadline = deadline;
  if (completion_time !== undefined)
    updateData.completion_time = completion_time;
  if (unique_days_required !== undefined)
    updateData.unique_days_required = unique_days_required;

  const { data, error } = await supabase
    .from("org_nodes")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as OrgNodeRow;
}
