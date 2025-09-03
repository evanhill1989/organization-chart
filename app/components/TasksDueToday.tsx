import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { OrgNode, OrgNodeRow } from "../types/orgChart";
import TaskDetailsModal from "./TaskDetailsModal";
import EmptyState from "./ui/EmptyState";
import TaskSummaryCards from "./tasks/TaskSummaryCards";
import TaskListItem from "./tasks/TaskListItem";
import {
  enrichTasksWithUrgencyData,
  TaskSorters,
  type EnrichedTask,
} from "../lib/taskEnrichmentUtils";

interface TasksDueTodayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TasksDueToday({ isOpen, onClose }: TasksDueTodayProps) {
  const [selectedTask, setSelectedTask] = useState<EnrichedTask | null>(null);
  const queryClient = useQueryClient();

  if (!isOpen) return null;

  // Get today's date for filtering
  const today = new Date().toISOString().split("T")[0];
  const rawTasks: OrgNodeRow[] = [];

  // Extract tasks from ALL cached org tree data - NO database calls
  const queryCache = queryClient.getQueryCache();
  const orgTreeQueries = queryCache.findAll({ queryKey: ["orgTree"] });

  console.log("Found queries:", orgTreeQueries.length);

  // Loop through all cached org trees
  orgTreeQueries.forEach((query, index) => {
    console.log(
      `Processing query ${index}:`,
      query.queryKey,
      query.state.status
    );

    // Access the data correctly from the query
    const treeData = query.state.data as OrgNode;

    if (treeData && query.state.status === "success") {
      console.log(
        `Tree data for ${query.queryKey[1]}:`,
        treeData.name,
        "Children:",
        treeData.children?.length
      );

      // Recursive function to find all tasks in this tree
      const findTasksInNode = (node: OrgNode): void => {
        // If this is a task that's due today OR overdue, and not completed, add it
        if (node.type === "task" && node.deadline && !node.is_completed) {
          const taskDeadline = new Date(node.deadline);
          const todayDate = new Date(today);

          // Include tasks due today or overdue (deadline <= today)
          if (taskDeadline <= todayDate) {
            const isOverdue = taskDeadline < todayDate;
            console.log(
              `Found task ${isOverdue ? "overdue" : "due today"}: ${node.name} (deadline: ${node.deadline})`
            );

            rawTasks.push({
              id: node.id,
              name: node.name,
              type: node.type,
              root_category: node.root_category,
              details: node.details,
              importance: node.importance,
              deadline: node.deadline,
              completion_time: node.completion_time,
              unique_days_required: node.unique_days_required,
              is_completed: node.is_completed,
              completed_at: node.completed_at,
              completion_comment: node.completion_comment,
              parent_id: node.parent_id,
              tab_name: node.tab_name,
            } as OrgNodeRow);
          }
        }

        // Check all children recursively
        if (node.children && node.children.length > 0) {
          node.children.forEach(findTasksInNode);
        }
      };
      // Start the search from the root of this tree
      findTasksInNode(treeData);
    }
  });

  // Transform the raw tasks with urgency calculations and sort them
  const todayTasks = enrichTasksWithUrgencyData(rawTasks).sort(
    TaskSorters.byUrgencyThenImportance
  );

  const handleTaskDetailsClose = () => {
    setSelectedTask(null);
    // Invalidate org tree cache so it refreshes and we get updated data
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
              Tasks Due Today
            </h2>
            <p className="text-sm text-gray-600">
              {todayFormatted} • {todayTasks.length} task
              {todayTasks.length !== 1 ? "s" : ""} due
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

        {/* Show empty state if no tasks */}
        {todayTasks.length === 0 && (
          <EmptyState
            title="No tasks due today!"
            description="Great job staying on top of your schedule. Enjoy your day!"
          />
        )}

        {/* Show content if we have tasks */}
        {todayTasks.length > 0 && (
          <>
            {/* Summary statistics */}
            <TaskSummaryCards tasks={todayTasks} />

            {/* List of tasks */}
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
