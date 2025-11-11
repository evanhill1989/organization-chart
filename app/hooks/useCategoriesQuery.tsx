import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/data/supabaseClient";
import { QUERY_KEYS } from "../lib/queryKeys";
import type { Category } from "../types/orgChart";
import { useAuth } from "../context/AuthContext";

// Fetch all categories for the current user (excluding archived by default)
async function fetchCategories(userId: string, includeArchived = false): Promise<Category[]> {
  let query = supabase
    .from("categories")
    .select("*")
    .eq("user_id", userId);

  // Filter out archived categories unless explicitly requested
  if (!includeArchived) {
    query = query.eq("archived", false);
  }

  const { data, error } = await query.order("order_index", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    throw new Error(error.message);
  }

  return data || [];
}

// React Query hook for fetching categories
export function useCategoriesQuery() {
  const { user } = useAuth();

  return useQuery({
    queryKey: QUERY_KEYS.allCategories(),
    queryFn: () => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      return fetchCategories(user.id);
    },
    enabled: !!user?.id, // Only run query if user is authenticated
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
