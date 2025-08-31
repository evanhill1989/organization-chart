import { useState, useEffect } from "react";
import { supabase } from "../lib/data/supabaseClient";
import type { OrgNodeRow } from "../types/orgChart";
import { enrichTasksWithDeadlineInfo } from "../lib/timeReportUtils";
import { calculateUrgencyLevel } from "../lib/urgencyUtils";
import TaskDetailsModal from "./TaskDetailsModal";

interface CompleteTaskData extends OrgNodeRow {
  type: "top_category" | "category" | "task";
  daysUntilDeadline: number;
  isOverdue: boolean;
  urgencyLevel: number;
}

interface CompleteTaskListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CompleteTaskListModal({
  isOpen,
  onClose,
}: CompleteTaskListModalProps) {
  const [allTasks, setAllTasks] = useState<CompleteTaskData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<CompleteTaskData | null>(
    null
  );

  // Fetch all tasks in the system
  const fetchAllTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: tasks, error: fetchError } = await supabase
        .from("org_nodes")
        .select("*")
        .eq("type", "task")
        .not("deadline", "is", null)
        .not("is_completed", "is", true);

      if (fetchError) throw fetchError;

      const typedTasks = tasks as OrgNodeRow[];

      // Enrich with deadline info and urgency levels
      const enrichedTasks = enrichTasksWithDeadlineInfo(typedTasks).map(
        (task) => ({
          ...task,
          urgencyLevel: calculateUrgencyLevel(
            task.deadline,
            task.completion_time,
            task.unique_days_required
          ),
        })
      ) as CompleteTaskData[];

      // Sort by deadline (overdue first, then by proximity)
      const sortedTasks = enrichedTasks.sort((a, b) => {
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        if (a.isOverdue && b.isOverdue) {
          return b.daysUntilDeadline - a.daysUntilDeadline; // Most overdue first
        }
        return a.daysUntilDeadline - b.daysUntilDeadline; // Closest deadline first
      });

      setAllTasks(sortedTasks);
    } catch (err) {
      console.error("Error fetching all tasks:", err);
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch tasks when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAllTasks();
    }
  }, [isOpen]);

  // Refresh tasks when task details modal closes (in case task was edited)
  const handleTaskDetailsClose = () => {
    setSelectedTask(null);
    fetchAllTasks(); // Refresh the list to show any changes
  };

  // Don't render if modal is closed
  if (!isOpen) return null;

  const SummaryCards = () => (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-red-50 p-4 rounded border-l-4 border-red-500">
        <div className="text-sm text-red-700">Overdue Tasks</div>
        <div className="text-2xl font-bold text-red-800">
          {allTasks.filter((t) => t.isOverdue).length}
        </div>
      </div>
      <div className="bg-orange-50 p-4 rounded border-l-4 border-orange-500">
        <div className="text-sm text-orange-700">Due This Week</div>
        <div className="text-2xl font-bold text-orange-800">
          {
            allTasks.filter((t) => !t.isOverdue && t.daysUntilDeadline <= 7)
              .length
          }
        </div>
      </div>
      <div className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-500">
        <div className="text-sm text-yellow-700">Due This Month</div>
        <div className="text-2xl font-bold text-yellow-800">
          {
            allTasks.filter(
              (t) =>
                !t.isOverdue &&
                t.daysUntilDeadline > 7 &&
                t.daysUntilDeadline <= 30
            ).length
          }
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded border-l-4 border-gray-500">
        <div className="text-sm text-gray-700">Total Time Required</div>
        <div className="text-2xl font-bold text-gray-800">
          {allTasks
            .reduce((sum, t) => sum + (t.completion_time || 0), 0)
            .toFixed(1)}
          h
        </div>
      </div>
    </div>
  );

  const TaskTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {[
              "Task",
              "Category",
              "Deadline",
              "Days Left",
              "Time Required",
              "Unique Days",
              "Urgency",
              "Importance",
            ].map((header) => (
              <th
                key={header}
                className="px-3 py-2 text-left text-sm font-medium text-gray-700"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allTasks.map((task, index) => (
            <tr
              key={task.id}
              className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} ${
                task.isOverdue ? "bg-red-50" : ""
              } hover:bg-blue-50 cursor-pointer transition-colors`}
              onClick={() => setSelectedTask(task)}
              title="Click to view/edit task details"
            >
              <td className="px-3 py-2 text-sm">
                <div className="font-medium text-gray-800 hover:text-blue-600">
                  {task.name}
                </div>
                {task.details && (
                  <div
                    className="text-xs text-gray-500 mt-1 max-w-xs truncate"
                    title={task.details}
                  >
                    {task.details}
                  </div>
                )}
              </td>
              <td className="px-3 py-2 text-sm text-gray-600">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {task.root_category}
                </span>
              </td>
              <td className="px-3 py-2 text-sm text-gray-600">
                {task.deadline
                  ? new Date(task.deadline).toLocaleDateString()
                  : "No deadline"}
              </td>
              <td
                className={`px-3 py-2 text-sm font-medium ${
                  task.isOverdue
                    ? "text-red-600"
                    : task.daysUntilDeadline <= 7
                      ? "text-orange-600"
                      : task.daysUntilDeadline <= 30
                        ? "text-yellow-600"
                        : "text-gray-600"
                }`}
              >
                {task.isOverdue
                  ? `${Math.abs(task.daysUntilDeadline)} overdue`
                  : `${task.daysUntilDeadline} days`}
              </td>
              <td className="px-3 py-2 text-sm text-gray-600">
                {task.completion_time?.toFixed(1) || 0}h
              </td>
              <td className="px-3 py-2 text-sm text-gray-600">
                {task.unique_days_required?.toFixed(1) || 0}
              </td>
              <td className="px-3 py-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      task.urgencyLevel <= 3
                        ? "bg-green-400"
                        : task.urgencyLevel <= 6
                          ? "bg-yellow-400"
                          : task.urgencyLevel <= 8
                            ? "bg-orange-400"
                            : "bg-red-500"
                    }`}
                  />
                  <span className="text-xs font-medium">
                    Level {task.urgencyLevel}
                  </span>
                </div>
              </td>
              <td className="px-3 py-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      (task.importance || 1) <= 3
                        ? "bg-gray-300"
                        : (task.importance || 1) <= 6
                          ? "bg-blue-400"
                          : (task.importance || 1) <= 8
                            ? "bg-purple-400"
                            : "bg-purple-600"
                    }`}
                  />
                  <span className="text-xs font-medium">
                    Level {task.importance || 1}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-8 text-gray-500">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 4h.01M9 12h.01M9 16h.01"
        />
      </svg>
      <p className="mt-2">No tasks found with deadlines</p>
    </div>
  );

  const LoadingState = () => (
    <div className="text-center py-8">
      <div className="inline-flex items-center space-x-2 text-gray-600">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span>Loading tasks...</span>
      </div>
    </div>
  );

  const ErrorState = () => (
    <div className="text-center py-8 text-red-600">
      <svg
        className="mx-auto h-12 w-12 text-red-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
      <p className="mt-2">Error: {error}</p>
      <button
        onClick={fetchAllTasks}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl w-full mx-4 max-h-[calc(90vh-5rem)] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Complete Task List
            </h2>
            <p className="text-sm text-gray-600">
              All tasks sorted by deadline • Total: {allTasks.length} tasks
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        {isLoading && <LoadingState />}
        {error && <ErrorState />}
        {!isLoading && !error && allTasks.length === 0 && <EmptyState />}
        {!isLoading && !error && allTasks.length > 0 && (
          <>
            <SummaryCards />
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Task Details
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Click on any task to view or edit its details
              </p>
              <TaskTable />
            </div>
          </>
        )}

        {/* Task Details Modal - nested within the complete task list modal */}
        <TaskDetailsModal
          task={selectedTask}
          onClose={handleTaskDetailsClose}
        />
      </div>
    </div>
  );
}
