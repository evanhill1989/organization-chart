import type { OrgNode, OrgNodeRow } from "../types/orgChart";
import { buildOrgTree } from "./buildOrgTree";
import { supabase } from "./data/supabaseClient";

// Returns the complete tree for the tab, not just the inserted row
export async function addOrgNode({
  name,
  type,
  details,
  importance,
  deadline,
  completion_time,
  unique_days_required,
  parent_id,
  tab_name,
  root_category,
}: {
  name: string;
  type: "category" | "task";
  details?: string;
  importance?: number;
  deadline?: string;
  completion_time?: number;
  unique_days_required?: number;
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
        // Removed urgency as it's now calculated
        importance: type === "task" ? (importance ?? 1) : undefined,
        // New deadline-related fields (only for tasks)
        deadline: type === "task" ? deadline : undefined,
        completion_time: type === "task" ? completion_time : undefined,
        unique_days_required:
          type === "task" ? unique_days_required : undefined,
        parent_id,
        tab_name,
        root_category,
      },
    ])
    .select()
    .single();

  console.log(insertedNode);
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
