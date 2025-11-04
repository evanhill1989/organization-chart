import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/data/supabaseClient";
import { QUERY_KEYS } from "../lib/queryKeys";

export function useTrackTaskView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from("org_nodes")
        .update({ last_touched_at: new Date().toISOString() })
        .eq("id", taskId)
        .eq("user_id", user.id); // Safety: only update user's own tasks

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate recent tasks to refresh the list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.recentTasks() });
    },
  });
}
