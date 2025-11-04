// app/hooks/useCategories.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/data/supabaseClient";
import { QUERY_KEYS } from "../lib/queryKeys";
import type { OrgNodeRow } from "../types/orgChart";

export const useCategory = (categoryId?: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.category(categoryId!),
    queryFn: async () => {
      if (!categoryId) return null;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("org_nodes")
        .select("*")
        .eq("id", categoryId)
        .eq("user_id", user.id) // Filter by user_id
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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      if (category.id) {
        // Update existing category
        const { data, error } = await supabase
          .from("org_nodes")
          .update({
            ...category,
            type: "category", // ✅ Ensure it's always a category
          })
          .eq("id", category.id)
          .eq("user_id", user.id) // Safety: only update user's own categories
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
            user_id: user.id, // Set user_id for new category
          })
          .select()
          .single();
        if (error) throw error;
        return data as OrgNodeRow;
      }
    },
    onSuccess: (data) => {
      // Update individual category cache
      queryClient.setQueryData(QUERY_KEYS.category(data.id), data);

      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allOrgTrees() });
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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from("org_nodes")
        .delete()
        .eq("id", categoryId)
        .eq("user_id", user.id); // Safety: only delete user's own categories
      if (error) throw error;
      return categoryId;
    },
    onSuccess: (categoryId) => {
      // Remove from individual category cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.category(categoryId) });

      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allOrgTrees() });
      // Categories don't affect task-specific queries
    },
    onError: (error) => {
      console.error("❌ Delete category error:", error);
    },
  });
};
