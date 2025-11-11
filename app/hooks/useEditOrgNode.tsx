import { useMutation, useQueryClient } from "@tanstack/react-query";

import { editOrgNode } from "../lib/editOrgNode";
import { TreeOps } from "../lib/treeUtils";
import { QUERY_KEYS } from "../lib/queryKeys";
import type { OrgNode } from "../types/orgChart";

// Custom hook for editing a node with optimistic update
export function useEditOrgNode(categoryId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (editData: {
      id?: number;
      name?: string;
      details?: string;
      importance?: number;
      deadline?: string;
      completion_time?: number;
      unique_days_required?: number;
      is_completed?: boolean;
      completed_at?: string | null;
      completion_comment?: string;
    }) => {
      const result = await editOrgNode(editData);

      return result;
    },

    onMutate: async (editData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.orgTree(categoryId),
      });

      // Snapshot the previous value
      const previousTree = queryClient.getQueryData<OrgNode>(
        QUERY_KEYS.orgTree(categoryId)
      );

      if (!previousTree || !editData.id) {
        return { previousTree: null };
      }

      // Build updates object, filtering out undefined and handling null values
      const updates: Partial<OrgNode> = {};
      if (editData.name !== undefined) updates.name = editData.name;
      if (editData.details !== undefined) updates.details = editData.details;
      if (editData.importance !== undefined)
        updates.importance = editData.importance;
      if (editData.deadline !== undefined) updates.deadline = editData.deadline;
      if (editData.completion_time !== undefined)
        updates.completion_time = editData.completion_time;
      if (editData.unique_days_required !== undefined)
        updates.unique_days_required = editData.unique_days_required;
      if (editData.is_completed !== undefined)
        updates.is_completed = editData.is_completed;
      if (editData.completed_at !== undefined) {
        // Handle null by converting to undefined
        updates.completed_at =
          editData.completed_at === null ? undefined : editData.completed_at;
      }
      if (editData.completion_comment !== undefined)
        updates.completion_comment = editData.completion_comment;

      // Apply the optimistic update using TreeOps
      const newTree = TreeOps.updateNode(previousTree, editData.id, updates);

      // Optimistically update the cache
      queryClient.setQueryData(QUERY_KEYS.orgTree(categoryId), newTree);

      return { previousTree };
    },

    onError: (error, editData, context) => {
      console.log(
        "❌ EDIT ONERROR: Edit failed for node:",
        editData.id,
        "Error:",
        error
      );

      // Rollback on error
      if (context?.previousTree) {
        queryClient.setQueryData(
          QUERY_KEYS.orgTree(categoryId),
          context.previousTree
        );
      }
    },

    onSettled: () => {
      // Always refetch to ensure consistency with server
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.orgTree(categoryId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.urgentTaskCount(),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.recentTasks(),
      });
    },
  });

  return mutation;
}
