import { supabase } from "../data/supabaseClient";
import type { OrgNodeRow } from "../../types/orgChart";

// Enriched type with category name
export type EnrichedTask = OrgNodeRow & {
  category_name: string;
};

export async function fetchRecentTasks(): Promise<EnrichedTask[]> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("org_nodes")
    .select("*, categories(name)")
    .eq("type", "task")
    .eq("user_id", user.id) // Filter by user_id
    .not("is_completed", "is", true)
    .order("last_touched_at", { ascending: false })
    .limit(10);

  if (error) throw error;

  // Map to include category_name at top level
  return (data || []).map((task: any) => ({
    ...task,
    category_name: task.categories?.name || "Unknown",
    categories: undefined, // Remove nested object
  })) as EnrichedTask[];
}
