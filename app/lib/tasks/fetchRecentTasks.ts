import { supabase } from "../data/supabaseClient";

export async function fetchRecentTasks() {
  const { data, error } = await supabase
    .from("org_nodes")
    .select("*")
    .eq("type", "task")
    .not("is_completed", "is", true)
    .order("last_touched_at", { ascending: false })
    .limit(10);

  return data;
}
