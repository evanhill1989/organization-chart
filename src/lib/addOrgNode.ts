import { supabase } from "./db/supabaseClient";
import type { OrgNode, OrgNodeRow } from "../types/orgChart";
import { buildOrgTree } from "./buildOrgTree";

// Returns the complete tree for the tab, not just the inserted row
export async function addOrgNode({
  name,
  type,
  details,
  urgency,
  importance,
  parent_id,
  tab_name,
  root_category,
}: {
  name: string;
  type: "category" | "task";
  details?: string;
  urgency?: number;
  importance?: number;
  parent_id?: number;
  tab_name: string;
  root_category: string;
}): Promise<OrgNode> {
  // Insert the new node
  const { data: insertedNode, error: insertError } = await supabase
    .from("org_nodes")
    .insert([
      {
        name,
        type,
        details,
        urgency: type === "task" ? urgency ?? 1 : undefined,
        importance: type === "task" ? importance ?? 1 : undefined,
        parent_id,
        tab_name,
        root_category,
      },
    ])
    .select()
    .single();

  if (insertError) throw insertError;

  // Fetch all nodes for this root_category to rebuild the complete tree
  const { data: allNodes, error: fetchError } = await supabase
    .from("org_nodes")
    .select("*")
    .eq("root_category", root_category);

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
