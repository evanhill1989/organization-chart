import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reorderCategories } from "../lib/categories/reorderCategories";
import { QUERY_KEYS } from "../lib/queryKeys";
import type { Category } from "../types/orgChart";

interface ReorderCategoriesInput {
  reorderedCategories: Category[]; // Full list with new order
}

export function useReorderCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ReorderCategoriesInput) => {
      // Map categories to update objects with new order_index
      const updates = input.reorderedCategories.map((cat, index) => ({
        id: cat.id,
        order_index: index,
      }));

      return reorderCategories(updates);
    },

    onMutate: async (input) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.allCategories(),
      });

      // Snapshot previous value
      const previousCategories = queryClient.getQueryData<Category[]>(
        QUERY_KEYS.allCategories()
      );

      if (!previousCategories) {
        return { previousCategories: null };
      }

      // Optimistically update with new order
      const optimisticCategories = input.reorderedCategories.map(
        (cat, index) => ({
          ...cat,
          order_index: index,
          updated_at: new Date().toISOString(),
        })
      );

      queryClient.setQueryData<Category[]>(
        QUERY_KEYS.allCategories(),
        optimisticCategories
      );

      return { previousCategories };
    },

    onSuccess: (data) => {
      // Replace optimistic data with server response
      queryClient.setQueryData<Category[]>(QUERY_KEYS.allCategories(), data);
    },

    onError: (error, _input, context) => {
      console.error("Error reordering categories:", error);
      // Rollback to previous state
      if (context?.previousCategories) {
        queryClient.setQueryData(
          QUERY_KEYS.allCategories(),
          context.previousCategories
        );
      }
    },

    onSettled: () => {
      // Refetch to ensure server state
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.allCategories(),
      });
    },
  });
}
