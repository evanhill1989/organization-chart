import { supabase } from "./db/supabaseClient";
import type { OrgNodeRow } from "../types/orgChart";

// Just update the node and return the updated row - no need for tree rebuilding
export async function editOrgNode({
  id,
  name,
  details,
}: {
  id?: number;
  name?: string;
  details?: string;
}): Promise<OrgNodeRow> {
  const { data, error } = await supabase
    .from("org_nodes")
    .update({ name, details })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as OrgNodeRow;
}
