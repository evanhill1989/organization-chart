import { supabase } from "./db/supabaseClient";
import type { OrgNodeRow } from "../types/orgChart";

// Returns the inserted row or throws error
export async function addOrgNode({
  name,
  type,
  details,
  parent_id,
  tab_name,
  root_category,
}: {
  name: string;
  type: "category" | "task";
  details?: string;
  parent_id?: number;
  tab_name: string;
  root_category: string;
}): Promise<OrgNodeRow> {
  const { data, error } = await supabase
    .from("org_nodes")
    .insert([
      {
        name,
        type,
        details,
        parent_id,
        tab_name,
        root_category,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as OrgNodeRow;
}
