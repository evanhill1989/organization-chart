// src/hooks/useTasks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/data/supabaseClient";

export interface Task {
  id: number;
  name: string;
  details?: string;
  importance: number;
  deadline?: string;
  root_category: string;
}

export const useTask = (taskId?: number) => {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      if (!taskId) return null;
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", taskId)
        .single();
      if (error) throw error;
      return data as Task;
    },
    enabled: !!taskId,
  });
};

export const useSaveTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Partial<Task>) => {
      if (task.id) {
        // update
        const { data, error } = await supabase
          .from("tasks")
          .update(task)
          .eq("id", task.id)
          .select()
          .single();
        if (error) throw error;
        return data as Task;
      } else {
        // create
        const { data, error } = await supabase
          .from("tasks")
          .insert(task)
          .select()
          .single();
        if (error) throw error;
        return data as Task;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["task", data.id], data);
      queryClient.invalidateQueries({ queryKey: ["tasks"] }); // refresh task lists
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: number) => {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);
      if (error) throw error;
      return taskId;
    },
    onSuccess: (id) => {
      queryClient.removeQueries({ queryKey: ["task", id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
};
