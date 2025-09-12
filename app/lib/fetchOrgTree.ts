// app/lib/fetchOrgTree.ts
import type { OrgNodeRow } from "../types/orgChart";
import { buildOrgTree } from "./buildOrgTree";
import { supabase } from "./data/supabaseClient";

export async function fetchOrgTree(tabName: string) {
  const { data, error } = await supabase
    .from("org_nodes")
    .select("*")
    .eq("root_category", tabName)
    .not("is_completed", "is", true); // ✅ Already filtering out completed tasks

  const typedData = data as OrgNodeRow[];

  if (error) throw error;

  const tree = buildOrgTree(typedData ?? []);

  // Always return a valid node (or a default empty node if not found)
  return (
    tree[tabName] ?? {
      id: 0,
      name: tabName,
      type: "category",
      root_category: tabName,
      children: [],
    }
  );
}
