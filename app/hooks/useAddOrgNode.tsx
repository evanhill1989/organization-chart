import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addOrgNode } from "../lib/addOrgNode";
import { TreeOps } from "../lib/treeUtils";
import { QUERY_KEYS } from "../lib/queryKeys";
import type { OrgNode } from "../types/orgChart";

// Custom hook for adding a node with optimistic update
export function useAddOrgNode(root_category: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newNode: {
      name: string;
      type: "category" | "task";
      details?: string;
      importance?: number;
      deadline?: string;
      completion_time?: number;
      unique_days_required?: number;
      parent_id?: number;
      tab_name: string;
      root_category: string;
    }) => {
      const result = await addOrgNode(newNode);
      return result;
    },

    onMutate: async (newNode) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.orgTree(root_category),
      });

      // Snapshot the previous value
      const previousTree = queryClient.getQueryData<OrgNode>(
        QUERY_KEYS.orgTree(root_category),
      );

      if (!previousTree) {
        return { previousTree: null };
      }

      // Create the optimistic node
      const optimisticNode: OrgNode = {
        id: Date.now(), // Use timestamp for more unique temporary ID
        name: newNode.name,
        type: newNode.type,
        tab_name: newNode.tab_name,
        root_category: newNode.root_category,
        details: newNode.details,
        // Removed urgency as it's now calculated
        importance:
          newNode.type === "task" ? (newNode.importance ?? 1) : undefined,
        // New deadline-related fields
        deadline: newNode.type === "task" ? newNode.deadline : undefined,
        completion_time:
          newNode.type === "task" ? newNode.completion_time : undefined,
        unique_days_required:
          newNode.type === "task" ? newNode.unique_days_required : undefined,
        children: [],
      };

      // Apply the optimistic update using TreeOps
      const newTree = TreeOps.addChild(
        previousTree,
        newNode.parent_id,
        optimisticNode,
      );

      // Optimistically update to the new value
      queryClient.setQueryData(QUERY_KEYS.orgTree(root_category), newTree);

      // Return a context object with the snapshotted value
      return { previousTree };
    },

    onSuccess: (data) => {
      // Update the cache with the server response (complete tree)
      queryClient.setQueryData(QUERY_KEYS.orgTree(root_category), data);
    },

    onError: (error, _newNode, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      console.error(error);
      if (context?.previousTree) {
        queryClient.setQueryData(
          QUERY_KEYS.orgTree(root_category),
          context.previousTree,
        );
      }
    },

    onSettled: () => {
      // Always refetch after error or success to ensure we have the server state
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.orgTree(root_category),
      });
      // ✅ NEW: Invalidate urgent task counts when tasks are added
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.urgentTaskCount(),
      });
    },
  });

  return mutation;
}
