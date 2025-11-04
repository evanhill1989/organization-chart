import { useQuery } from "@tanstack/react-query";
import { fetchRecentTasks } from "../lib/tasks/fetchRecentTasks";
import { QUERY_KEYS } from "../lib/queryKeys";

export function useRecentTasks() {
  return useQuery({
    queryKey: QUERY_KEYS.recentTasks(),
    queryFn: fetchRecentTasks,
    staleTime: 1000 * 60, // 1 minute
  });
}
