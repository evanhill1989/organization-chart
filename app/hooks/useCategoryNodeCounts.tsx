import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/data/supabaseClient";
import { useAuth } from "../context/AuthContext";

// Fetch node counts per category for the current user
async function fetchCategoryNodeCounts(
  userId: string
): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("org_nodes")
    .select("category_id")
    .eq("user_id", userId)
    .not("category_id", "is", null);

  if (error) {
    console.error("Error fetching category node counts:", error);
    throw new Error(error.message);
  }

  // Count nodes per category
  const counts: Record<string, number> = {};
  (data || []).forEach((row) => {
    if (row.category_id) {
      counts[row.category_id] = (counts[row.category_id] || 0) + 1;
    }
  });

  return counts;
}

// React Query hook for fetching category node counts
export function useCategoryNodeCounts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["categoryNodeCounts", user?.id],
    queryFn: () => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      return fetchCategoryNodeCounts(user.id);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
  });
}
