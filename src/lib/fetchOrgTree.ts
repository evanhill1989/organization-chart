import { buildOrgTree } from "./buildOrgTree";
import { supabase } from "./db/supabaseClient";

export async function fetchOrgTree(tabName: string) {
  const { data, error } = await supabase
    .from("org_nodes")
    .select("*")
    .eq("tab_name", tabName);

  if (error) throw error;

  const tree = buildOrgTree(data ?? []);

  // Always return a valid node (or a default empty node if not found)
  return (
    tree[tabName] ?? {
      name: tabName,
      type: "category",
      children: [],
    }
  );
}
