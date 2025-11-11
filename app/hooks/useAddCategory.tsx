import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCategory } from "../lib/categories/addCategory";
import { QUERY_KEYS } from "../lib/queryKeys";
import type { Category } from "../types/orgChart";
import { useAuth } from "../context/AuthContext";

interface AddCategoryInput {
  name: string;
  description?: string;
  color?: string;
}

export function useAddCategory() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: AddCategoryInput) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Get current categories to determine order_index
      const categories = queryClient.getQueryData<Category[]>(
        QUERY_KEYS.allCategories()
      );
      const maxOrderIndex = categories
        ? Math.max(...categories.map((c) => c.order_index), -1)
        : -1;

      return addCategory({
        user_id: user.id,
        name: input.name,
        description: input.description,
        color: input.color,
        order_index: maxOrderIndex + 1,
      });
    },

    onMutate: async (newCategory) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.allCategories(),
      });

      // Snapshot previous value
      const previousCategories = queryClient.getQueryData<Category[]>(
        QUERY_KEYS.allCategories()
      );

      if (!previousCategories || !user?.id) {
        return { previousCategories: null };
      }

      // Create optimistic category
      const maxOrderIndex = Math.max(
        ...previousCategories.map((c) => c.order_index),
        -1
      );

      const optimisticCategory: Category = {
        id: `temp-${Date.now()}`, // Temporary ID
        user_id: user.id,
        name: newCategory.name,
        description: newCategory.description,
        color: newCategory.color || "#3B82F6",
        order_index: maxOrderIndex + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Optimistically update cache
      queryClient.setQueryData<Category[]>(
        QUERY_KEYS.allCategories(),
        [...previousCategories, optimisticCategory]
      );

      return { previousCategories };
    },

    onSuccess: (data) => {
      // Replace optimistic data with server response
      const categories = queryClient.getQueryData<Category[]>(
        QUERY_KEYS.allCategories()
      );

      if (categories) {
        const updatedCategories = categories.filter(
          (c) => !c.id.startsWith("temp-")
        );
        queryClient.setQueryData<Category[]>(QUERY_KEYS.allCategories(), [
          ...updatedCategories,
          data,
        ]);
      }
    },

    onError: (error, _newCategory, context) => {
      console.error("Error adding category:", error);
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
