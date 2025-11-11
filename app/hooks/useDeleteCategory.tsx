import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteCategory,
  checkCategoryHasNodes,
} from "../lib/categories/deleteCategory";
import { QUERY_KEYS } from "../lib/queryKeys";
import type { Category } from "../types/orgChart";

interface DeleteCategoryInput {
  id: string;
  skipNodeCheck?: boolean; // Allow force delete even if has nodes
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DeleteCategoryInput) => {
      // Check if category has nodes (unless explicitly skipping check)
      if (!input.skipNodeCheck) {
        const nodeCount = await checkCategoryHasNodes(input.id);
        if (nodeCount > 0) {
          throw new Error(
            `Cannot delete category: it contains ${nodeCount} node(s). Please delete or move the nodes first.`
          );
        }
      }

      await deleteCategory(input.id);
      return input.id;
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

      // Optimistically remove from cache
      const optimisticCategories = previousCategories.filter(
        (cat) => cat.id !== input.id
      );

      queryClient.setQueryData<Category[]>(
        QUERY_KEYS.allCategories(),
        optimisticCategories
      );

      return { previousCategories };
    },

    onError: (error, _input, context) => {
      console.error("Error deleting category:", error);
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
      // Also invalidate org trees since nodes might have been cascade-deleted
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.allOrgTrees(),
      });
    },
  });
}
