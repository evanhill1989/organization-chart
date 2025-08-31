import { supabase } from "./data/supabaseClient";

export async function deleteOrgNode(id: number): Promise<void> {
  const { error } = await supabase.from("org_nodes").delete().eq("id", id);

  if (error) throw error;
}
