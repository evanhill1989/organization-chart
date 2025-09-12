// src/hooks/useTasks.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/data/supabaseClient";
import type { OrgNodeRow } from "../types/orgChart";

export const useTask = (taskId?: number) => {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      if (!taskId) return null;
      const { data, error } = await supabase
        .from("org_nodes") // ✅ Changed from "tasks" to "org_nodes"
        .select("*")
        .eq("id", taskId)
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
      if (task.id) {
        // Update existing task
        const { data, error } = await supabase
          .from("org_nodes") // ✅ Changed from "tasks" to "org_nodes"
          .update(task)
          .eq("id", task.id)
          .select()
          .single();
        if (error) throw error;
        return data as OrgNodeRow;
      } else {
        // Create new task - need parent_id, tab_name, root_category
        const { data, error } = await supabase
          .from("org_nodes") // ✅ Changed from "tasks" to "org_nodes"
          .insert({
            ...task,
            type: "task", // ✅ Ensure type is set
          })
          .select()
          .single();
        if (error) throw error;
        return data as OrgNodeRow;
      }
    },
    onSuccess: (data) => {
      // Update individual task cache
      queryClient.setQueryData(["task", data.id], data);

      // ✅ Invalidate relevant org tree caches
      queryClient.invalidateQueries({ queryKey: ["orgTree"] });
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
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
      const { error } = await supabase
        .from("org_nodes") // ✅ Changed from "tasks" to "org_nodes"
        .delete()
        .eq("id", taskId);
      if (error) throw error;
      return taskId;
    },
    onSuccess: (taskId) => {
      // Remove from individual task cache
      queryClient.removeQueries({ queryKey: ["task", taskId] });

      // ✅ Invalidate relevant org tree caches
      queryClient.invalidateQueries({ queryKey: ["orgTree"] });
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
    },
    onError: (error) => {
      console.error("❌ Delete task error:", error);
    },
  });
};
