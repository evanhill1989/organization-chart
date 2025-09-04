import { useState } from "react";
import { useQueryClient, useQueries } from "@tanstack/react-query";

import TaskDetailsModal from "./TaskDetailsModal";
import EmptyState from "./ui/EmptyState";
import TaskSummaryCards from "./tasks/TaskSummaryCards";
import TaskListItem from "./tasks/TaskListItem";

import { collectTasksDueToday } from "../lib/collectTasksDueToday";
import {
  enrichTasksWithUrgencyData,
  TaskSorters,
  type EnrichedTask,
} from "../lib/taskEnrichmentUtils";
import type { OrgNode } from "../types/orgChart";
import { fetchOrgTree } from "../lib/fetchOrgTree";

interface TasksDueTodayProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_TABS = [
  "Household",
  "Finances",
  "Cleo",
  "Job",
  "Social",
  "Personal",
  "Orphans",
] as const;

export default function TasksDueToday({ isOpen, onClose }: TasksDueTodayProps) {
  const [selectedTask, setSelectedTask] = useState<EnrichedTask | null>(null);
  const queryClient = useQueryClient();

  // 🔹 Fetch ALL tabs when modal is open
  const allTabQueries = useQueries({
    queries: ALL_TABS.map((tab) => ({
      queryKey: ["orgTree", tab],
      queryFn: () => fetchOrgTree(tab),
      enabled: isOpen, // Only fetch when modal is open
      staleTime: 5 * 60 * 1000, // 5 minutes
    })),
  });

  if (!isOpen) return null;

  // Wait for all queries to complete
  const isLoading = allTabQueries.some((query) => query.isLoading);
  const hasError = allTabQueries.some((query) => query.error);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading tasks from all categories...</span>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-red-600">
            Error loading tasks. Please try again.
          </div>
        </div>
      </div>
    );
  }

  // 🔹 Get all successfully loaded org trees
  const orgTreeRoots: OrgNode[] = allTabQueries
    .filter((query) => query.data && query.isSuccess)
    .map((query) => query.data as OrgNode);

  console.log(`Found ${orgTreeRoots.length} org tree roots from all tabs`);

  // 🔹 Collect & sort all due-today/overdue tasks
  const todayTasks = enrichTasksWithUrgencyData(
    collectTasksDueToday(orgTreeRoots)
  ).sort(TaskSorters.byUrgencyThenImportance);

  console.log(
    `Found ${todayTasks.length} tasks due today/overdue across all tabs`
  );

  const handleTaskDetailsClose = () => {
    setSelectedTask(null);
    // Invalidate so next open is fresh
    queryClient.invalidateQueries({ queryKey: ["orgTree"] });
  };

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-10">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full mx-4 max-h-[calc(90vh-2.5rem)] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Tasks Due Today & Overdue
            </h2>
            <p className="text-sm text-gray-600">
              {todayFormatted} • {todayTasks.length} task
              {todayTasks.length !== 1 ? "s" : ""} due or overdue across all
              categories
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl font-bold transition-colors"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Empty state */}
        {todayTasks.length === 0 && (
          <EmptyState
            title="No tasks due today!"
            description="Great job staying on top of your schedule. Enjoy your day!"
          />
        )}

        {/* Task content */}
        {todayTasks.length > 0 && (
          <>
            <TaskSummaryCards tasks={todayTasks} />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Today's Tasks & Overdue Items
                <span className="text-sm font-normal text-gray-600 ml-2">
                  (Click any task to edit)
                </span>
              </h3>
              <div className="space-y-3">
                {todayTasks.map((task) => (
                  <TaskListItem
                    key={task.id}
                    task={task}
                    onClick={setSelectedTask}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Task editing modal */}
        <TaskDetailsModal
          task={selectedTask}
          onClose={handleTaskDetailsClose}
        />
      </div>
    </div>
  );
}
