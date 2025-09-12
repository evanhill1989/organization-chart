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
      await queryClient.cancelQueries({ queryKey: ["orgTree", root_category] });

      // Snapshot the previous value
      const previousTree = queryClient.getQueryData<OrgNode>([
        "orgTree",
        root_category,
      ]);

      if (!previousTree || !editData.id) {
        return { previousTree: null };
      }

      // Recursively find and update the node
      function updateNodeInTree(
        tree: OrgNode,
        targetId: number,
        updates: {
          name?: string;
          details?: string;
          importance?: number;
          deadline?: string;
          completion_time?: number;
          unique_days_required?: number;
          is_completed?: boolean;
          completed_at?: string | null;
          completion_comment?: string;
        },
      ): OrgNode {
        // If this is the node to update
        if (tree.id === targetId) {
          const updatedNode = {
            ...tree,
            ...(updates.name !== undefined && { name: updates.name }),
            ...(updates.details !== undefined && { details: updates.details }),
            ...(updates.importance !== undefined && {
              importance: updates.importance,
            }),
            // New deadline-related fields
            ...(updates.deadline !== undefined && {
              deadline: updates.deadline,
            }),
            ...(updates.completion_time !== undefined && {
              completion_time: updates.completion_time,
            }),
            ...(updates.unique_days_required !== undefined && {
              unique_days_required: updates.unique_days_required,
            }),
            // Completion tracking fields
            ...(updates.is_completed !== undefined && {
              is_completed: updates.is_completed,
            }),
            ...(updates.completed_at !== undefined && {
              completed_at:
                updates.completed_at === null
                  ? undefined
                  : updates.completed_at,
            }),
            ...(updates.completion_comment !== undefined && {
              completion_comment: updates.completion_comment,
            }),
          };

          return updatedNode;
        }

        // If this node has children, check them
        if (tree.children && tree.children.length > 0) {
          const updatedChildren = tree.children.map((child) =>
            updateNodeInTree(child, targetId, updates),
          );

          return {
            ...tree,
            children: updatedChildren,
          };
        }

        return tree;
      }

      const newTree = updateNodeInTree(previousTree, editData.id, {
        name: editData.name,
        details: editData.details,
        importance: editData.importance,
        deadline: editData.deadline,
        completion_time: editData.completion_time,
        unique_days_required: editData.unique_days_required,
        is_completed: editData.is_completed,
        completed_at: editData.completed_at,
        completion_comment: editData.completion_comment,
      });

      // Optimistically update the cache
      queryClient.setQueryData(["orgTree", root_category], newTree);

      return { previousTree };
    },

    onError: (error, editData, context) => {
      console.log(
        "❌ EDIT ONERROR: Edit failed for node:",
        editData.id,
        "Error:",
        error,
      );

      // Rollback on error
      if (context?.previousTree) {
        queryClient.setQueryData(
          ["orgTree", root_category],
          context.previousTree,
        );
      }
    },

    onSettled: () => {
      // Always refetch to ensure consistency with server
      queryClient.invalidateQueries({ queryKey: ["orgTree", root_category] });
      queryClient.invalidateQueries({ queryKey: ["urgentTaskCount"] });
    },
  });

  return mutation;
}
