import { supabase } from "./db/supabaseClient";
import type { OrgNodeRow } from "../types/orgChart";

// Just update the node and return the updated row - no need for tree rebuilding
export async function editOrgNode({
  id,
  name,
  details,
  urgency,
  importance,
}: {
  id?: number;
  name?: string;
  details?: string;
  urgency?: number;
  importance?: number;
}): Promise<OrgNodeRow> {
  const updateData: Partial<OrgNodeRow> = {};

  if (name !== undefined) updateData.name = name;
  if (details !== undefined) updateData.details = details;
  if (urgency !== undefined) updateData.urgency = urgency;
  if (importance !== undefined) updateData.importance = importance;

  const { data, error } = await supabase
    .from("org_nodes")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as OrgNodeRow;
}
