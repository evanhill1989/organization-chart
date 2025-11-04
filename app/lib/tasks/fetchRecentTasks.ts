import { supabase } from "../data/supabaseClient";

export async function fetchRecentTasks() {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("org_nodes")
    .select("*")
    .eq("type", "task")
    .eq("user_id", user.id) // Filter by user_id
    .not("is_completed", "is", true)
    .order("last_touched_at", { ascending: false })
    .limit(10);

  return data;
}
