// app/lib/fetchOrgTree.ts
import type { OrgNodeRow } from "../types/orgChart";
import { buildOrgTree } from "./buildOrgTree";
import { supabase } from "./data/supabaseClient";

export async function fetchOrgTree(tabName: string) {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("org_nodes")
    .select("*")
    .eq("root_category", tabName)
    .eq("user_id", user.id) // Filter by user_id
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
