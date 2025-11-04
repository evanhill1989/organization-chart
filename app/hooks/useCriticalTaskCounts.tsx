// app/hooks/useCriticalTaskCounts.tsx
import { useQueries } from "@tanstack/react-query";
import { supabase } from "../lib/data/supabaseClient";
import { TABS } from "../lib/consts/TABS";
import { QUERY_KEYS } from "../lib/queryKeys";
import { calculateUrgencyLevel } from "../lib/urgencyUtils";

export function useCriticalTaskCounts() {
  // Fetch Critical task counts for all tabs in parallel
  const results = useQueries({
    queries: TABS.map((tab) => ({
      queryKey: QUERY_KEYS.criticalTaskCount(tab),
      queryFn: async () => {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("User not authenticated");
        }

        const { data: tasks, error } = await supabase
          .from("org_nodes")
          .select("deadline, completion_time, unique_days_required")
          .eq("type", "task")
          .eq("root_category", tab)
          .eq("user_id", user.id) // Filter by user_id
          .not("deadline", "is", null)
          .not("completion_time", "is", null)
          .not("unique_days_required", "is", null)
          .not("is_completed", "is", true); // Only incomplete tasks

        if (error) throw error;

        // ✅ COUNT ONLY LEVEL 10 URGENCY TASKS
        const level10Count = (tasks || []).reduce((count, task) => {
          const urgencyLevel = calculateUrgencyLevel(
            task.deadline,
            task.completion_time,
            task.unique_days_required,
          );
          return urgencyLevel === 10 ? count + 1 : count; // Only level 10
        }, 0);

        return level10Count;
      },
      staleTime: 2 * 60 * 1000, // Cache for 2 minutes
      gcTime: 5 * 60 * 1000, // Keep in memory for 5 minutes
    })),
    combine: (results) => {
      // Transform array of results into object keyed by tab name
      const counts: Record<string, number> = {};
      const isLoading = results.some((result) => result.isLoading);
      const hasError = results.some((result) => result.error);

      results.forEach((result, index) => {
        counts[TABS[index]] = result.data || 0;
      });

      return {
        counts,
        isLoading,
        hasError,
      };
    },
  });

  return results.counts;
}
