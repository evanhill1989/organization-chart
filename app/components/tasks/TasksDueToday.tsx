import { useState } from "react";
import { useQueryClient, useQueries } from "@tanstack/react-query";

import TaskForm from "./TaskForm"; // ✅ Changed import
import EmptyState from "../ui/EmptyState";
import TaskSummaryCards from "./TaskSummaryCards";
import TaskListItem from "./TaskListItem";

import { collectTasksDueToday } from "../../lib/collectTasksDueToday";
import {
  enrichTasksWithUrgencyData,
  TaskSorters,
  type EnrichedTask,
} from "../../lib/taskEnrichmentUtils";
import type { OrgNode } from "../../types/orgChart";
import { fetchOrgTree } from "../../lib/fetchOrgTree";

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
      <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="rounded-lg bg-white p-8">
          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <span>Loading tasks from all categories...</span>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="rounded-lg bg-white p-8">
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
    collectTasksDueToday(orgTreeRoots),
  ).sort(TaskSorters.byUrgencyThenImportance);

  console.log(
    `Found ${todayTasks.length} tasks due today/overdue across all tabs`,
  );

  // ✅ Updated handler to use TaskForm
  const handleTaskFormClose = () => {
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
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-start justify-center bg-black pt-10">
      <div className="mx-4 max-h-[calc(90vh-2.5rem)] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
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
            className="text-2xl font-bold text-gray-500 transition-colors hover:text-gray-800"
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
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                Today's Tasks & Overdue Items
                <span className="ml-2 text-sm font-normal text-gray-600">
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

        {/* ✅ Updated to use TaskForm */}
        {selectedTask && (
          <TaskForm task={selectedTask} onCancel={handleTaskFormClose} />
        )}
      </div>
    </div>
  );
}
