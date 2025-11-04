// app/hooks/useTasks.tsx - Add invalidation to existing mutations
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/data/supabaseClient";
import { QUERY_KEYS } from "../lib/queryKeys";
import type { OrgNodeRow } from "../types/orgChart";

export const useTask = (taskId?: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.task(taskId!),
    queryFn: async () => {
      if (!taskId) return null;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("org_nodes")
        .select("*")
        .eq("id", taskId)
        .eq("user_id", user.id) // Filter by user_id
        .single();
      if (error) throw error;
      return data as OrgNodeRow;
    },
    enabled: !!taskId,
  });
};

export const useSaveTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Partial<OrgNodeRow>) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      if (task.id) {
        // Update existing task
        const { data, error } = await supabase
          .from("org_nodes")
          .update(task)
          .eq("id", task.id)
          .eq("user_id", user.id) // Safety: only update user's own tasks
          .select()
          .single();
        if (error) throw error;
        return data as OrgNodeRow;
      } else {
        // Create new task
        const { data, error } = await supabase
          .from("org_nodes")
          .insert({
            ...task,
            type: "task",
            user_id: user.id, // Set user_id for new task
          })
          .select()
          .single();
        if (error) throw error;
        return data as OrgNodeRow;
      }
    },
    onSuccess: (data) => {
      // Update individual task cache
      queryClient.setQueryData(QUERY_KEYS.task(data.id), data);

      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allOrgTrees() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allTasks() });
      // ✅ NEW: Invalidate urgent task counts
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.urgentTaskCount() });
    },
    onError: (error) => {
      console.error("❌ Save task error:", error);
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: number) => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from("org_nodes")
        .delete()
        .eq("id", taskId)
        .eq("user_id", user.id); // Safety: only delete user's own tasks
      if (error) throw error;
      return taskId;
    },
    onSuccess: (taskId) => {
      // Remove from individual task cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.task(taskId) });

      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allOrgTrees() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allTasks() });
      // ✅ NEW: Invalidate urgent task counts
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.urgentTaskCount() });
    },
    onError: (error) => {
      console.error("❌ Delete task error:", error);
    },
  });
};
