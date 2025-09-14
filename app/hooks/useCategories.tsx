// app/hooks/useCategories.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/data/supabaseClient";
import type { OrgNodeRow } from "../types/orgChart";

export const useCategory = (categoryId?: number) => {
  return useQuery({
    queryKey: ["category", categoryId],
    queryFn: async () => {
      if (!categoryId) return null;
      const { data, error } = await supabase
        .from("org_nodes")
        .select("*")
        .eq("id", categoryId)
        .single();
      if (error) throw error;
      return data as OrgNodeRow;
    },
    enabled: !!categoryId,
  });
};

export const useSaveCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: Partial<OrgNodeRow>) => {
      if (category.id) {
        // Update existing category
        const { data, error } = await supabase
          .from("org_nodes")
          .update({
            ...category,
            type: "category", // ✅ Ensure it's always a category
          })
          .eq("id", category.id)
          .select()
          .single();
        if (error) throw error;
        return data as OrgNodeRow;
      } else {
        // Create new category
        const { data, error } = await supabase
          .from("org_nodes")
          .insert({
            ...category,
            type: "category", // ✅ Ensure it's always a category
          })
          .select()
          .single();
        if (error) throw error;
        return data as OrgNodeRow;
      }
    },
    onSuccess: (data) => {
      // Update individual category cache
      queryClient.setQueryData(["category", data.id], data);

      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: ["orgTree"] });
      // Categories don't affect task-specific queries, so we don't need to invalidate those
    },
    onError: (error) => {
      console.error("❌ Save category error:", error);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: number) => {
      const { error } = await supabase
        .from("org_nodes")
        .delete()
        .eq("id", categoryId);
      if (error) throw error;
      return categoryId;
    },
    onSuccess: (categoryId) => {
      // Remove from individual category cache
      queryClient.removeQueries({ queryKey: ["category", categoryId] });

      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: ["orgTree"] });
      // Categories don't affect task-specific queries
    },
    onError: (error) => {
      console.error("❌ Delete category error:", error);
    },
  });
};
