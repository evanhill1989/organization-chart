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
      urgency?: number;
      importance?: number;
      parent_id?: number;
      tab_name: string;
      root_category: string;
    }) => {
      const result = await addOrgNode(newNode);
      return result;
    },

    onMutate: async (newNode) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["orgTree", root_category] });

      // Snapshot the previous value
      const previousTree = queryClient.getQueryData<OrgNode>([
        "orgTree",
        root_category,
      ]);

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
        urgency: newNode.type === "task" ? newNode.urgency ?? 1 : undefined,
        importance:
          newNode.type === "task" ? newNode.importance ?? 1 : undefined,
        children: [],
      };

      // Recursively find the parent and add the new node
      function addChildToTree(
        tree: OrgNode,
        parentId: number,
        child: OrgNode
      ): OrgNode {
        if (tree.id === parentId) {
          return {
            ...tree,
            children: [...(tree.children ?? []), child],
          };
        }

        if (tree.children && tree.children.length > 0) {
          return {
            ...tree,
            children: tree.children.map((c) =>
              addChildToTree(c, parentId, child)
            ),
          };
        }

        return tree;
      }

      // Apply the optimistic update
      let newTree: OrgNode;
      if (newNode.parent_id) {
        newTree = addChildToTree(
          previousTree,
          newNode.parent_id,
          optimisticNode
        );
      } else {
        newTree = {
          ...previousTree,
          children: [...(previousTree.children ?? []), optimisticNode],
        };
      }

      // Optimistically update to the new value
      queryClient.setQueryData(["orgTree", root_category], newTree);

      // Return a context object with the snapshotted value
      return { previousTree };
    },

    onSuccess: (data) => {
      // Update the cache with the server response (complete tree)
      queryClient.setQueryData(["orgTree", root_category], data);
    },

    onError: (error, _newNode, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTree) {
        queryClient.setQueryData(
          ["orgTree", root_category],
          context.previousTree
        );
      }
    },

    onSettled: () => {
      // Always refetch after error or success to ensure we have the server state
      queryClient.invalidateQueries({ queryKey: ["orgTree", root_category] });
    },
  });

  return mutation;
}
