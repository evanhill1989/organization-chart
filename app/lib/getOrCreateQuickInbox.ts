import { supabase } from "./data/supabaseClient";

/**
 * Gets or creates the "Quick Inbox" subcategory under the Orphans category.
 * This serves as the default parent for quick-add tasks.
 *
 * @returns The parent_id (node ID) of the Quick Inbox category
 * @throws Error if user is not authenticated or if operations fail
 */
export async function getOrCreateQuickInbox(): Promise<number> {
  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("User must be authenticated to use quick add");
  }

  // Get the Orphans category UUID for this user
  const { data: orphansCategory, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("user_id", user.id)
    .eq("name", "Orphans")
    .single();

  if (categoryError || !orphansCategory) {
    throw new Error("Orphans category not found. Please contact support.");
  }

  const orphansCategoryId = orphansCategory.id;

  // Check if Quick Inbox already exists
  const { data: existingInbox, error: searchError } = await supabase
    .from("org_nodes")
    .select("id, name, type")
    .eq("user_id", user.id)
    .eq("category_id", orphansCategoryId)
    .eq("name", "Quick Inbox")
    .eq("type", "category")
    .maybeSingle();

  if (searchError) {
    throw new Error(`Failed to search for Quick Inbox: ${searchError.message}`);
  }

  // If it exists, return its ID
  if (existingInbox) {
    return existingInbox.id;
  }

  // Otherwise, create the Quick Inbox subcategory
  const { data: newInbox, error: createError } = await supabase
    .from("org_nodes")
    .insert({
      name: "Quick Inbox",
      type: "category",
      category_id: orphansCategoryId,
      user_id: user.id,
      parent_id: null, // Top-level category under Orphans
      details: "Temporary inbox for quick task capture. Organize these tasks later.",
      importance: null, // Categories don't need importance
      is_completed: false,
    })
    .select()
    .single();

  if (createError || !newInbox) {
    throw new Error(`Failed to create Quick Inbox: ${createError?.message || "Unknown error"}`);
  }

  return newInbox.id;
}
