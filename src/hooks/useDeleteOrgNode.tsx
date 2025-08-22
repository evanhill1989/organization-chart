import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteOrgNode } from "../lib/deleteOrgNode";
import type { OrgNode } from "../types/orgChart";

// Custom hook for deleting a node with optimistic update
export function useDeleteOrgNode(root_category: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (nodeId: number) => {
      console.log("🚀 DELETE MUTATION: Starting deletion of node:", nodeId);
      const result = await deleteOrgNode(nodeId);
      console.log("✅ DELETE MUTATION: Server confirmed deletion");
      return result;
    },

    onMutate: async (nodeId: number) => {
      console.log(
        "🔄 DELETE ONMUTATE: Starting optimistic delete for node:",
        nodeId
      );
      console.log("🔄 DELETE ONMUTATE: Root category:", root_category);

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["orgTree", root_category] });
      console.log("🔄 DELETE ONMUTATE: Cancelled queries for:", [
        "orgTree",
        root_category,
      ]);

      // Snapshot the previous value
      const previousTree = queryClient.getQueryData<OrgNode>([
        "orgTree",
        root_category,
      ]);
      console.log(
        "🔄 DELETE ONMUTATE: Previous tree:",
        JSON.stringify(previousTree, null, 2)
      );

      if (!previousTree) {
        console.log(
          "❌ DELETE ONMUTATE: No previous tree found, aborting optimistic update"
        );
        return { previousTree: null };
      }

      // Recursively remove the node from the tree
      function removeNodeFromTree(
        tree: OrgNode,
        targetId: number
      ): OrgNode | null {
        console.log(
          `🔍 DELETE ONMUTATE: Checking node ${tree.id} (${tree.name}) for deletion`
        );

        // If this is the node to delete, return null to remove it
        if (tree.id === targetId) {
          console.log(
            "✅ DELETE ONMUTATE: Found target node for deletion:",
            tree.name
          );
          return null;
        }

        // If this node has children, check them
        if (tree.children && tree.children.length > 0) {
          console.log(
            `🔍 DELETE ONMUTATE: Searching ${tree.children.length} children of ${tree.name}`
          );
          const updatedChildren = tree.children
            .map((child) => removeNodeFromTree(child, targetId))
            .filter((child) => child !== null) as OrgNode[];

          // If children changed, return updated node
          if (updatedChildren.length !== tree.children.length) {
            console.log(
              `🔄 DELETE ONMUTATE: Removed child from ${tree.name}, children: ${tree.children.length} -> ${updatedChildren.length}`
            );
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

        console.log(
          `🔍 DELETE ONMUTATE: No children in ${tree.name}, returning unchanged`
        );
        return tree;
      }

      const newTree = removeNodeFromTree(previousTree, nodeId);

      if (!newTree) {
        console.log("❌ DELETE ONMUTATE: Cannot delete root node");
        return { previousTree };
      }

      console.log(
        "🔄 DELETE ONMUTATE: New tree structure:",
        JSON.stringify(newTree, null, 2)
      );

      // Optimistically update the cache
      queryClient.setQueryData(["orgTree", root_category], newTree);
      console.log("🔄 DELETE ONMUTATE: Set query data for:", [
        "orgTree",
        root_category,
      ]);

      // Verify the data was set
      const verifyData = queryClient.getQueryData(["orgTree", root_category]);
      console.log(
        "🔄 DELETE ONMUTATE: Verified cached data:",
        JSON.stringify(verifyData, null, 2)
      );

      return { previousTree };
    },

    onSuccess: () => {
      console.log("✅ DELETE ONSUCCESS: Node successfully deleted on server");
      // Note: We don't need to update cache here since the optimistic update
      // should match the server state after deletion
    },

    onError: (error, nodeId, context) => {
      console.log(
        "❌ DELETE ONERROR: Deletion failed for node:",
        nodeId,
        "Error:",
        error
      );
      console.log(
        "❌ DELETE ONERROR: Rolling back to previous tree:",
        context?.previousTree
      );

      // Rollback on error
      if (context?.previousTree) {
        queryClient.setQueryData(
          ["orgTree", root_category],
          context.previousTree
        );
      }
    },

    onSettled: () => {
      console.log("🔄 DELETE ONSETTLED: Invalidating queries for:", [
        "orgTree",
        root_category,
      ]);
      // Always refetch to ensure consistency with server
      queryClient.invalidateQueries({ queryKey: ["orgTree", root_category] });
    },
  });

  return mutation;
}
