import { useMutation, useQueryClient } from "@tanstack/react-query";

import { editOrgNode } from "../lib/editOrgNode";
import type { OrgNode } from "../types/orgChart";

// Custom hook for editing a node with optimistic update
export function useEditOrgNode(root_category: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (editData: {
      id?: number;
      name?: string;
      details?: string;
      urgency?: number;
      importance?: number;
    }) => {
      console.log(
        "🚀 EDIT MUTATION: Starting edit of node:",
        editData.id,
        editData
      );
      const result = await editOrgNode(editData);
      console.log("✅ EDIT MUTATION: Server returned updated row");
      return result;
    },

    onMutate: async (editData) => {
      console.log(
        "🔄 EDIT ONMUTATE: Starting optimistic edit for node:",
        editData.id
      );
      console.log("🔄 EDIT ONMUTATE: Edit data:", editData);
      console.log("🔄 EDIT ONMUTATE: Root category:", root_category);

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["orgTree", root_category] });
      console.log("🔄 EDIT ONMUTATE: Cancelled queries for:", [
        "orgTree",
        root_category,
      ]);

      // Snapshot the previous value
      const previousTree = queryClient.getQueryData<OrgNode>([
        "orgTree",
        root_category,
      ]);
      console.log(
        "🔄 EDIT ONMUTATE: Previous tree:",
        JSON.stringify(previousTree, null, 2)
      );

      if (!previousTree || !editData.id) {
        console.log(
          "❌ EDIT ONMUTATE: No previous tree or node ID found, aborting optimistic update"
        );
        return { previousTree: null };
      }

      // Recursively find and update the node
      function updateNodeInTree(
        tree: OrgNode,
        targetId: number,
        updates: {
          name?: string;
          details?: string;
          urgency?: number;
          importance?: number;
        }
      ): OrgNode {
        console.log(
          `🔍 EDIT ONMUTATE: Checking node ${tree.id} (${tree.name}) for update`
        );

        // If this is the node to update
        if (tree.id === targetId) {
          console.log(
            "✅ EDIT ONMUTATE: Found target node for update:",
            tree.name
          );
          const updatedNode = {
            ...tree,
            ...(updates.name !== undefined && { name: updates.name }),
            ...(updates.details !== undefined && { details: updates.details }),
            ...(updates.urgency !== undefined && { urgency: updates.urgency }),
            ...(updates.importance !== undefined && {
              importance: updates.importance,
            }),
          };
          console.log("🔄 EDIT ONMUTATE: Updated node:", updatedNode);
          return updatedNode;
        }

        // If this node has children, check them
        if (tree.children && tree.children.length > 0) {
          console.log(
            `🔍 EDIT ONMUTATE: Searching ${tree.children.length} children of ${tree.name}`
          );
          const updatedChildren = tree.children.map((child) =>
            updateNodeInTree(child, targetId, updates)
          );

          return {
            ...tree,
            children: updatedChildren,
          };
        }

        console.log(
          `🔍 EDIT ONMUTATE: No children in ${tree.name}, returning unchanged`
        );
        return tree;
      }

      const newTree = updateNodeInTree(previousTree, editData.id, {
        name: editData.name,
        details: editData.details,
        urgency: editData.urgency,
        importance: editData.importance,
      });

      console.log(
        "🔄 EDIT ONMUTATE: New tree structure:",
        JSON.stringify(newTree, null, 2)
      );

      // Optimistically update the cache
      queryClient.setQueryData(["orgTree", root_category], newTree);
      console.log("🔄 EDIT ONMUTATE: Set query data for:", [
        "orgTree",
        root_category,
      ]);

      // Verify the data was set
      const verifyData = queryClient.getQueryData(["orgTree", root_category]);
      console.log(
        "🔄 EDIT ONMUTATE: Verified cached data:",
        JSON.stringify(verifyData, null, 2)
      );

      return { previousTree };
    },

    onSuccess: (updatedRow) => {
      console.log("✅ EDIT ONSUCCESS: Node successfully updated on server");
      console.log("✅ EDIT ONSUCCESS: Updated row:", updatedRow);

      // The optimistic update should already match the server state,
      // so we don't need to do anything here. The invalidation in onSettled
      // will handle any edge cases.
    },

    onError: (error, editData, context) => {
      console.log(
        "❌ EDIT ONERROR: Edit failed for node:",
        editData.id,
        "Error:",
        error
      );
      console.log(
        "❌ EDIT ONERROR: Rolling back to previous tree:",
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
      console.log("🔄 EDIT ONSETTLED: Invalidating queries for:", [
        "orgTree",
        root_category,
      ]);
      // Always refetch to ensure consistency with server
      queryClient.invalidateQueries({ queryKey: ["orgTree", root_category] });
    },
  });

  return mutation;
}
