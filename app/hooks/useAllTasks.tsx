// app/hooks/useAllTasks.tsx
import { useQuery } from "@tanstack/react-query";
import {
  fetchAllTasks,
  type CompleteTaskData,
} from "../lib/tasks/fetchAllTasks";

export function useAllTasks(enabled: boolean = true) {
  const {
    data: tasks = [],
    isLoading,
    error,
    refetch,
  } = useQuery<CompleteTaskData[], Error>({
    queryKey: ["allTasks"], // caching key
    queryFn: fetchAllTasks,
    enabled, // controls auto-fetching
    staleTime: 1000 * 60 * 5, // cache valid for 5 minutes
    gcTime: 1000 * 60 * 30, // keep cache in memory for 30 minutes (was cacheTime)
  });

  return {
    tasks,
    isLoading,
    error: error?.message || null,
    refetch, // Keep this as refetch for React Query consistency
    reload: refetch, // Add alias if you prefer reload
  };
}
