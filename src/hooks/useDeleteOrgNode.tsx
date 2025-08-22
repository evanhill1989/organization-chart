import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteOrgNode } from "../lib/deleteOrgNode";
import type { OrgNode } from "../types/orgChart";

// Custom hook for deleting a node with optimistic update
export function useDeleteOrgNode(root_category: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (nodeId: number) => {
      const result = await deleteOrgNode(nodeId);
      return result;
    },

    onMutate: async (nodeId: number) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["orgTree", root_category] });

      // Snapshot the previous value
      const previousTree = queryClient.getQueryData<OrgNode>([
        "orgTree",
        root_category,
      ]);

      if (!previousTree) {
        return { previousTree: null };
      }

      // Recursively remove the node from the tree
      function removeNodeFromTree(
        tree: OrgNode,
        targetId: number
      ): OrgNode | null {
        // If this is the node to delete, return null to remove it
        if (tree.id === targetId) {
          return null;
        }

        // If this node has children, check them
        if (tree.children && tree.children.length > 0) {
          const updatedChildren = tree.children
            .map((child) => removeNodeFromTree(child, targetId))
            .filter((child) => child !== null) as OrgNode[];

          // If children changed, return updated node
          if (updatedChildren.length !== tree.children.length) {
            return {
              ...tree,
              children: updatedChildren,
            };
          }

          // Children unchanged, return with updated children
          return {
            ...tree,
            children: updatedChildren,
          };
        }

        return tree;
      }

      const newTree = removeNodeFromTree(previousTree, nodeId);

      if (!newTree) {
        return { previousTree };
      }

      // Optimistically update the cache
      queryClient.setQueryData(["orgTree", root_category], newTree);

      return { previousTree };
    },

    onSuccess: () => {
      // Note: We don't need to update cache here since the optimistic update
      // should match the server state after deletion
    },

    onError: (error, nodeId, context) => {
      // Rollback on error
      if (context?.previousTree) {
        queryClient.setQueryData(
          ["orgTree", root_category],
          context.previousTree
        );
      }
    },

    onSettled: () => {
      // Always refetch to ensure consistency with server
      queryClient.invalidateQueries({ queryKey: ["orgTree", root_category] });
    },
  });

  return mutation;
}
