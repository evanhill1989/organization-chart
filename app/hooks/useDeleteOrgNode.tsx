import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteOrgNode } from "../lib/deleteOrgNode";
import { TreeOps } from "../lib/treeUtils";
import { QUERY_KEYS } from "../lib/queryKeys";
import type { OrgNode } from "../types/orgChart";

// Custom hook for deleting a node with optimistic update
export function useDeleteOrgNode(categoryId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (nodeId: number) => {
      const result = await deleteOrgNode(nodeId);
      return result;
    },

    onMutate: async (nodeId: number) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.orgTree(categoryId),
      });

      // Snapshot the previous value
      const previousTree = queryClient.getQueryData<OrgNode>(
        QUERY_KEYS.orgTree(categoryId)
      );

      if (!previousTree) {
        return { previousTree: null };
      }

      // Apply the optimistic deletion using TreeOps
      const newTree = TreeOps.removeNode(previousTree, nodeId);

      if (!newTree) {
        return { previousTree };
      }

      // Optimistically update the cache
      queryClient.setQueryData(QUERY_KEYS.orgTree(categoryId), newTree);

      return { previousTree };
    },

    onSuccess: () => {
      // Note: We don't need to update cache here since the optimistic update
      // should match the server state after deletion
    },

    onError: (error, nodeId, context) => {
      // Rollback on error
      console.error(error);
      console.log(nodeId);
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
        queryKey: QUERY_KEYS.recentTasks(),
      });
      // Invalidate category node counts
      queryClient.invalidateQueries({
        queryKey: ["categoryNodeCounts"],
      });
    },
  });

  return mutation;
}
