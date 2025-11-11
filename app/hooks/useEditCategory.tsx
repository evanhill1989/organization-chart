import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editCategory } from "../lib/categories/editCategory";
import { QUERY_KEYS } from "../lib/queryKeys";
import type { Category } from "../types/orgChart";

interface EditCategoryInput {
  id: string;
  name?: string;
  description?: string;
  color?: string;
}

export function useEditCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editCategory,

    onMutate: async (updatedCategory) => {
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

      // Optimistically update cache
      const optimisticCategories = previousCategories.map((cat) =>
        cat.id === updatedCategory.id
          ? {
              ...cat,
              ...updatedCategory,
              updated_at: new Date().toISOString(),
            }
          : cat
      );

      queryClient.setQueryData<Category[]>(
        QUERY_KEYS.allCategories(),
        optimisticCategories
      );

      return { previousCategories };
    },

    onSuccess: (data) => {
      // Replace optimistic data with server response
      const categories = queryClient.getQueryData<Category[]>(
        QUERY_KEYS.allCategories()
      );

      if (categories) {
        const updatedCategories = categories.map((cat) =>
          cat.id === data.id ? data : cat
        );
        queryClient.setQueryData<Category[]>(
          QUERY_KEYS.allCategories(),
          updatedCategories
        );
      }
    },

    onError: (error, _updatedCategory, context) => {
      console.error("Error editing category:", error);
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
      // Also invalidate org trees since category changes might affect them
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.allOrgTrees(),
      });
    },
  });
}
