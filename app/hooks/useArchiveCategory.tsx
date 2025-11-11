import { useMutation, useQueryClient } from "@tanstack/react-query";
import { archiveCategory, unarchiveCategory } from "../lib/categories/archiveCategory";
import { QUERY_KEYS } from "../lib/queryKeys";
import type { Category } from "../types/orgChart";

export function useArchiveCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, archive }: { id: string; archive: boolean }) => {
      return archive ? archiveCategory(id) : unarchiveCategory(id);
    },

    onSuccess: (data, variables) => {
      // Update the categories cache
      const categories = queryClient.getQueryData<Category[]>(
        QUERY_KEYS.allCategories()
      );

      if (categories) {
        if (variables.archive) {
          // Remove from active categories list
          const updated = categories.filter((cat) => cat.id !== variables.id);
          queryClient.setQueryData<Category[]>(
            QUERY_KEYS.allCategories(),
            updated
          );
        } else {
          // Add back to active categories list
          queryClient.setQueryData<Category[]>(QUERY_KEYS.allCategories(), [
            ...categories,
            data,
          ]);
        }
      }
    },

    onError: (error) => {
      console.error("Error archiving/unarchiving category:", error);
    },

    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.allCategories(),
      });
    },
  });
}
