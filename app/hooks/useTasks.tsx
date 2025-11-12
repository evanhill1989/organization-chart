// app/hooks/useTasks.tsx - Add invalidation to existing mutations
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/data/supabaseClient";
import { QUERY_KEYS } from "../lib/queryKeys";
import type { OrgNodeRow } from "../types/orgChart";
import { getOrCreateQuickInbox } from "../lib/getOrCreateQuickInbox";

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

/**
 * Hook for quick-adding tasks with minimal friction.
 * Automatically creates tasks in the "Quick Inbox" under Orphans category
 * with sensible defaults.
 */
export const useQuickAddTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskName: string) => {
      if (!taskName || taskName.trim() === "") {
        throw new Error("Task name is required");
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      // Get or create the Quick Inbox parent
      const quickInboxId = await getOrCreateQuickInbox();

      // Get the Orphans category UUID
      const { data: orphansCategory, error: categoryError } = await supabase
        .from("categories")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", "Orphans")
        .single();

      if (categoryError || !orphansCategory) {
        throw new Error("Orphans category not found");
      }

      // Create task with auto-populated defaults
      const { data, error } = await supabase
        .from("org_nodes")
        .insert({
          name: taskName.trim(),
          type: "task",
          user_id: user.id,
          parent_id: quickInboxId,
          category_id: orphansCategory.id,
          importance: 1, // Minimum importance
          completion_time: 1, // 1 hour default
          unique_days_required: 1, // 1 day default
          details: "",
          deadline: null,
          is_completed: false,
          recurrence_type: "none",
          is_recurring_template: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data as OrgNodeRow;
    },
    onSuccess: (data) => {
      // Update individual task cache
      queryClient.setQueryData(QUERY_KEYS.task(data.id), data);

      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allOrgTrees() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allTasks() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.urgentTaskCount() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allCategories() });
    },
    onError: (error) => {
      console.error("❌ Quick add task error:", error);
    },
  });
};
