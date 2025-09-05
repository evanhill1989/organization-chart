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
    cacheTime: 1000 * 60 * 30, // keep cache in memory for 30 minutes
  });

  return {
    tasks,
    isLoading,
    error: error?.message || null,
    reload: refetch, // manual refresh
  };
}
