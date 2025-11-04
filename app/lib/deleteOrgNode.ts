import { supabase } from "./data/supabaseClient";

export async function deleteOrgNode(id: number): Promise<void> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("org_nodes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id); // Safety: only delete nodes owned by current user

  if (error) throw error;
}
