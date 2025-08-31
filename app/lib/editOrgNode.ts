import { supabase } from "./data/supabaseClient";
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
  is_completed,
  completed_at,
  completion_comment,
}: {
  id?: number;
  name?: string;
  details?: string;
  importance?: number;
  deadline?: string;
  completion_time?: number;
  unique_days_required?: number;
  is_completed?: boolean;
  completed_at?: string | null;
  completion_comment?: string;
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
  // Completion tracking fields
  if (is_completed !== undefined) updateData.is_completed = is_completed;
  if (completed_at !== undefined)
    updateData.completed_at = completed_at ?? undefined;
  if (completion_comment !== undefined)
    updateData.completion_comment = completion_comment;

  const { data, error } = await supabase
    .from("org_nodes")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as OrgNodeRow;
}
