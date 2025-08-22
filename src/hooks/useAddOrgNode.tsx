import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addOrgNode } from "../lib/addOrgNode";
import type { OrgNode } from "../types/orgChart";

// Custom hook for adding a node with optimistic update
export function useAddOrgNode(root_category: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newNode: {
      name: string;
      type: "category" | "task";
      details?: string;
      parent_id?: number;
      tab_name: string;
      root_category: string;
    }) => {
      console.log("🚀 MUTATION: Starting mutation with:", newNode);
      const result = await addOrgNode(newNode);
      console.log("✅ MUTATION: Server returned:", result);
      return result;
    },

    onMutate: async (newNode) => {
      console.log(
        "🔄 ONMUTATE: Starting optimistic update for root_category:",
        root_category
      );
      console.log("🔄 ONMUTATE: New node data:", newNode);

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["orgTree", root_category] });
      console.log("🔄 ONMUTATE: Cancelled queries for:", [
        "orgTree",
        root_category,
      ]);

      // Snapshot the previous value
      const previousTree = queryClient.getQueryData<OrgNode>([
        "orgTree",
        root_category,
      ]);
      console.log(
        "🔄 ONMUTATE: Previous tree:",
        JSON.stringify(previousTree, null, 2)
      );

      if (!previousTree) {
        console.log(
          "❌ ONMUTATE: No previous tree found, aborting optimistic update"
        );
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
        children: [],
      };
      console.log("🔄 ONMUTATE: Created optimistic node:", optimisticNode);

      // Recursively find the parent and add the new node
      function addChildToTree(
        tree: OrgNode,
        parentId: number,
        child: OrgNode
      ): OrgNode {
        console.log(
          `🔍 ONMUTATE: Searching for parent ${parentId} in node ${tree.id} (${tree.name})`
        );

        if (tree.id === parentId) {
          console.log("✅ ONMUTATE: Found parent! Adding child to:", tree.name);
          return {
            ...tree,
            children: [...(tree.children ?? []), child],
          };
        }

        if (tree.children && tree.children.length > 0) {
          console.log(
            `🔍 ONMUTATE: Searching ${tree.children.length} children of ${tree.name}`
          );
          return {
            ...tree,
            children: tree.children.map((c) =>
              addChildToTree(c, parentId, child)
            ),
          };
        }

        console.log(
          `🔍 ONMUTATE: No children in ${tree.name}, returning unchanged`
        );
        return tree;
      }

      // Apply the optimistic update
      let newTree: OrgNode;
      if (newNode.parent_id) {
        console.log("🔄 ONMUTATE: Adding to parent ID:", newNode.parent_id);
        newTree = addChildToTree(
          previousTree,
          newNode.parent_id,
          optimisticNode
        );
      } else {
        console.log("🔄 ONMUTATE: Adding to root level");
        newTree = {
          ...previousTree,
          children: [...(previousTree.children ?? []), optimisticNode],
        };
      }

      console.log(
        "🔄 ONMUTATE: New tree structure:",
        JSON.stringify(newTree, null, 2)
      );

      // Optimistically update to the new value
      queryClient.setQueryData(["orgTree", root_category], newTree);
      console.log("🔄 ONMUTATE: Set query data for:", [
        "orgTree",
        root_category,
      ]);

      // Verify the data was set
      const verifyData = queryClient.getQueryData(["orgTree", root_category]);
      console.log(
        "🔄 ONMUTATE: Verified cached data:",
        JSON.stringify(verifyData, null, 2)
      );

      // Return a context object with the snapshotted value
      return { previousTree };
    },

    onSuccess: (data) => {
      console.log(
        "✅ ONSUCCESS: Mutation succeeded, server returned:",
        JSON.stringify(data, null, 2)
      );
      // Update the cache with the server response (complete tree)
      queryClient.setQueryData(["orgTree", root_category], data);
      console.log("✅ ONSUCCESS: Updated cache with server data");
    },

    onError: (error, _newNode, context) => {
      console.log("❌ ONERROR: Mutation failed:", error);
      console.log(
        "❌ ONERROR: Rolling back to previous tree:",
        context?.previousTree
      );
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTree) {
        queryClient.setQueryData(
          ["orgTree", root_category],
          context.previousTree
        );
      }
    },

    onSettled: () => {
      console.log("🔄 ONSETTLED: Invalidating queries for:", [
        "orgTree",
        root_category,
      ]);
      // Always refetch after error or success to ensure we have the server state
      queryClient.invalidateQueries({ queryKey: ["orgTree", root_category] });
    },
  });

  return mutation;
}
