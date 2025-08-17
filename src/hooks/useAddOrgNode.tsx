import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addOrgNode } from "../lib/addOrgNode";

// Custom hook for adding a node with optimistic update
export function useAddOrgNode(tab_name: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newNode: {
      name: string;
      type: "category" | "task";
      details?: string;
      parent_id?: number;
      tab_name: string;
    }) => addOrgNode(newNode),
    onMutate: async () => {
      // Optimistically update the cache
      await queryClient.cancelQueries({ queryKey: ["orgTree", tab_name] });
      const previousTree = queryClient.getQueryData(["orgTree", tab_name]);
      // Optionally update UI here (requires tree structure knowledge)
      return { previousTree };
    },
    onError: (_error, _newNode, context) => {
      // Rollback on error
      if (context?.previousTree) {
        queryClient.setQueryData(["orgTree", tab_name], context.previousTree);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ["orgTree", tab_name] });
    },
  });

  return mutation;
}
