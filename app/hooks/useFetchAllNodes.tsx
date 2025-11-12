// app/hooks/useFetchAllNodes.tsx
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/data/supabaseClient";
import type { OrgNodeRow } from "../types/orgChart";

/**
 * Fetch all nodes (categories and tasks) across all tabs
 * Filters out completed tasks for search purposes
 */
async function fetchAllNodes(): Promise<OrgNodeRow[]> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data: nodes, error } = await supabase
    .from("org_nodes")
    .select("*")
    .eq("user_id", user.id)
    .not("is_completed", "is", true); // Filter out completed tasks

  if (error) throw error;

  return nodes || [];
}

/**
 * Hook to fetch all nodes for global search
 * Cached with React Query for fast searching
 */
export function useFetchAllNodes() {
  return useQuery({
    queryKey: ["allNodes"],
    queryFn: fetchAllNodes,
    staleTime: 1000 * 60 * 5, // Keep data fresh for 5 minutes
  });
}
