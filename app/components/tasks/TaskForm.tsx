// app/components/tasks/TaskForm.tsx
import { useState, useEffect, useRef } from "react";
import { useDeleteTask, useSaveTask } from "../../hooks/useTasks";
import type { OrgNodeRow } from "../../types/orgChart";
import RecurrenceConfig from "../RecurrenceConfig";
import type { RecurrenceType } from "../../types/orgChart";
import { createRecurringInstance } from "../../lib/createRecurringInstance";
import { useTrackTaskView } from "../../hooks/useTrackTaskView";
import { useEditOrgNode } from "../../hooks/useEditOrgNode";
import { generateGoogleCalendarUrl } from "../../lib/googleCalendar";

interface TaskFormProps {
  task?: OrgNodeRow; // undefined = creating new
  onCancel: () => void;
  // New props for task creation
  parentId?: number;
  parentName?: string;
  categoryId: string; // UUID reference to categories table
  categoryName: string; // Category display name
}

type RecurrenceConfigType = {
  recurrence_type: RecurrenceType;
  recurrence_interval?: number;
  recurrence_day_of_week?: number;
  recurrence_day_of_month?: number;
  recurrence_end_date?: string;
  is_recurring_template?: boolean;
};

export default function TaskForm({
  task,
  onCancel,
  parentId,
  parentName,
  categoryId,
  categoryName,
}: TaskFormProps) {
  const [name, setName] = useState(task?.name ?? "");
  const [details, setDetails] = useState(task?.details ?? "");
  const [importance, setImportance] = useState(task?.importance ?? 1);
  const [deadline, setDeadline] = useState(task?.deadline ?? "");
  const [completionTime, setCompletionTime] = useState(
    task?.completion_time ?? 1,
  );
  const [uniqueDaysRequired, setUniqueDaysRequired] = useState(
    task?.unique_days_required ?? 1,
  );

  // Completion tracking states
  const [isCompleted, setIsCompleted] = useState(task?.is_completed ?? false);
  const [completionComment, setCompletionComment] = useState(
    task?.completion_comment ?? "",
  );
  const [completedAt, setCompletedAt] = useState<string | null>(
    task?.completed_at ?? null,
  );

  // Recurrence configuration state
  const [recurrenceConfig, setRecurrenceConfig] =
    useState<RecurrenceConfigType>({
      recurrence_type: "none",
      recurrence_interval: undefined,
      recurrence_day_of_week: undefined,
      recurrence_day_of_month: undefined,
      recurrence_end_date: undefined,
      is_recurring_template: false,
    });

  const saveTask = useSaveTask();
  const deleteTask = useDeleteTask();
  const trackTaskView = useTrackTaskView();
  const editOrgNode = useEditOrgNode(task?.category_id || categoryId);

  const isCreating = !task;
  const isEditing = !!task;

  // Track if we've created a recurring instance
  const hasCreatedRecurringInstanceRef = useRef(false);
  const isProcessingCompletionRef = useRef(false);

  // ✅ Track if completion status has changed
  const [completionChanged, setCompletionChanged] = useState(false);

  // Sync when editing task changes
  useEffect(() => {
    if (task) {
      setName(task.name);
      setDetails(task.details ?? "");
      setImportance(task.importance ?? 1);
      setDeadline(task.deadline ?? "");
      setCompletionTime(task.completion_time ?? 1);
      setUniqueDaysRequired(task.unique_days_required ?? 1);

      // Initialize completion states
      setIsCompleted(task.is_completed ?? false);
      setCompletionComment(task.completion_comment ?? "");
      setCompletedAt(task.completed_at ?? null);

      // ✅ FIX: Initialize recurrence configuration with actual task values
      const recType = task.recurrence_type || "none";
      setRecurrenceConfig({
        recurrence_type: recType,
        recurrence_interval:
          recType !== "none" ? task.recurrence_interval || 1 : undefined,
        recurrence_day_of_week:
          recType === "weekly" ? task.recurrence_day_of_week : undefined,
        recurrence_day_of_month:
          recType === "monthly" ? task.recurrence_day_of_month : undefined,
        recurrence_end_date:
          recType !== "none" ? task.recurrence_end_date : undefined,
        is_recurring_template: recType !== "none",
      });

      // Reset flags
      hasCreatedRecurringInstanceRef.current = false;
      setCompletionChanged(false);
    }
  }, [task]);

  // Track task view when task ID changes (separate effect to avoid infinite loop)
  useEffect(() => {
    if (task?.id) {
      trackTaskView.mutate(String(task.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id]);
  // ✅ Handle completion checkbox change (no automatic saving)
  const handleCompletionChange = (newCompletedState: boolean) => {
    setIsCompleted(newCompletedState);
    setCompletionChanged(true);

    // Set completed_at timestamp if marking as completed
    if (newCompletedState && !task?.is_completed) {
      setCompletedAt(new Date().toISOString());
    } else if (!newCompletedState && task?.is_completed) {
      setCompletedAt(null);
    }
  };

  // ✅ Handle saving task completion
  const handleSaveCompletion = async () => {
    if (!task) return;

    // Prevent multiple simultaneous executions
    if (isProcessingCompletionRef.current) {
      console.log("🔄 Already processing completion, skipping...");
      return;
    }

    isProcessingCompletionRef.current = true;

    const taskData = {
      id: task.id,
      is_completed: isCompleted,
      completion_comment: completionComment || undefined,
      completed_at: completedAt || undefined, // ✅ This converts null to undefined
    };

    console.log("🚀 Saving task completion:", taskData);

    editOrgNode.mutate(taskData, {
      onSuccess: async () => {
        console.log("✅ Task completion saved successfully");
        setCompletionChanged(false);

        // Handle recurring task creation if marking as completed
        if (
          isCompleted &&
          !task.is_completed &&
          !hasCreatedRecurringInstanceRef.current &&
          recurrenceConfig.recurrence_type !== "none" &&
          recurrenceConfig.recurrence_type
        ) {
          console.log(
            "🔄 Task completed with recurrence, creating next instance...",
          );
          hasCreatedRecurringInstanceRef.current = true;

          try {
            const completedTaskData = {
              ...task,
              is_completed: true,
              completed_at: completedAt || undefined, // ✅ Convert null to undefined
              completion_comment: completionComment,
              // Use current recurrence config
              recurrence_type: recurrenceConfig.recurrence_type,
              recurrence_interval: recurrenceConfig.recurrence_interval,
              recurrence_day_of_week: recurrenceConfig.recurrence_day_of_week,
              recurrence_day_of_month: recurrenceConfig.recurrence_day_of_month,
              recurrence_end_date: recurrenceConfig.recurrence_end_date,
              is_recurring_template: recurrenceConfig.is_recurring_template,
            };

            const nextInstance =
              await createRecurringInstance(completedTaskData);
            if (nextInstance) {
              console.log(
                "✅ Successfully created recurring instance:",
                nextInstance.name,
              );
            }
          } catch (error) {
            console.error("❌ Failed to create recurring instance:", error);
            hasCreatedRecurringInstanceRef.current = false;
          }
        }

        // Close modal if task was marked as completed
        if (isCompleted) {
          onCancel();
        }
      },
      onError: (error) => {
        console.error("❌ Failed to save task completion:", error);
        alert(`Failed to save completion: ${error.message}`);
      },
      onSettled: () => {
        isProcessingCompletionRef.current = false;
      },
    });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Determine parent context - use props for new tasks, existing data for edits
    const effectiveParentId = task?.parent_id ?? parentId;
    const effectiveCategoryId = task?.category_id ?? categoryId;

    // Validation for new tasks
    if (isCreating && (!effectiveParentId || !effectiveCategoryId)) {
      console.error("❌ Missing required parent context for new task:", {
        parentId: effectiveParentId,
        categoryId: effectiveCategoryId,
      });
      alert("Missing parent information. Please try again.");
      return;
    }

    const taskData = {
      id: task?.id,
      name: name.trim(),
      details: details.trim() || undefined,
      importance,
      deadline: deadline || undefined,
      completion_time: completionTime,
      unique_days_required: uniqueDaysRequired,
      parent_id: effectiveParentId,
      category_id: effectiveCategoryId,
      type: "task" as const,

      // ✅ Only include completion fields if we're updating an existing task
      // and completion hasn't been separately saved
      ...(isEditing &&
        !completionChanged && {
          is_completed: isCompleted,
          completion_comment: completionComment || undefined,
          completed_at: completedAt || undefined,
        }),

      // Include recurrence configuration
      ...recurrenceConfig,
    };

    console.log("🚀 Submitting task data:", taskData);

    saveTask.mutate(taskData, {
      onSuccess: (savedTask) => {
        console.log("✅ Task saved successfully:", savedTask);
        onCancel(); // close modal after save
      },
      onError: (error) => {
        console.error("❌ Failed to save task:", error);
        alert(`Failed to save task: ${error.message}`);
      },
    });
  };

  const handleDelete = () => {
    if (task?.id) {
      if (!confirm(`Are you sure you want to delete "${task.name}"?`)) {
        return;
      }

      console.log("🗑️ Deleting task:", task.id);
      deleteTask.mutate(task.id, {
        onSuccess: () => {
          console.log("✅ Task deleted successfully");
          onCancel();
        },
        onError: (error) => {
          console.error("❌ Failed to delete task:", error);
          alert(`Failed to delete task: ${error.message}`);
        },
      });
    }
  };

  // Helper to format date for input[type="date"]
  const formatDateForInput = (date?: string) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  // Display parent context for user clarity
  const displayParentPath = () => {
    if (isEditing && categoryName) {
      return categoryName;
    }
    if (isCreating && parentName && categoryName) {
      return `${categoryName} > ${parentName}`;
    }
    return "Unknown";
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-[70] flex items-center justify-center bg-black">
      <form
        onSubmit={handleSubmit}
        className="mx-4 max-h-[90vh] w-full max-w-md space-y-4 overflow-y-auto rounded-lg bg-white p-6 text-black shadow-md"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">
              {isCreating ? "Create New Task" : `Edit Task`}
            </h3>
            <p className="text-sm text-gray-600">
              {isCreating
                ? `Adding to: ${displayParentPath()}`
                : `Category: ${displayParentPath()}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-2xl font-bold text-gray-500 hover:text-gray-800"
          >
            ×
          </button>
        </div>

        {/* ✅ Completion Section - Only show for existing tasks */}
        {isEditing && (
          <div
            className={`mb-6 rounded-lg border p-4 ${
              isCompleted
                ? "border-green-300 bg-green-50"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <label className="flex cursor-pointer items-center font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={(e) => handleCompletionChange(e.target.checked)}
                  className="mr-2 h-5 w-5 cursor-pointer rounded text-green-600 focus:ring-green-500"
                />
                <span className={isCompleted ? "text-green-700" : ""}>
                  {isCompleted ? "Task Completed" : "Mark as Completed"}
                </span>
              </label>
              {completedAt && (
                <span className="text-sm text-gray-500">
                  {new Date(completedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {isCompleted && (
              <div className="mt-3">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Completion Notes (optional):
                </label>
                <textarea
                  className="w-full rounded border p-2 text-sm text-black focus:border-green-500 focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Add any notes about completing this task..."
                  value={completionComment}
                  onChange={(e) => setCompletionComment(e.target.value)}
                />
                {completedAt && (
                  <p className="mt-1 text-xs text-gray-500">
                    Completed on {new Date(completedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* ✅ Dynamic "Save Completed Task" button */}
            {isEditing && completionChanged && isCompleted && (
              <div className="mb-4 p-4">
                <button
                  type="button"
                  onClick={handleSaveCompletion}
                  disabled={editOrgNode.isPending}
                  className="w-full rounded bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {editOrgNode.isPending ? "Saving..." : "Save Completed Task"}
                </button>
                <p className="mt-2 text-xs text-green-700">
                  Click to save task completion and create next recurring
                  instance (if applicable)
                </p>
              </div>
            )}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Task Name *
          </label>
          <input
            className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter task name"
            required
            disabled={isCompleted && !completionChanged} // Only disable if completed and saved
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Details
          </label>
          <textarea
            className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            rows={3}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Optional task description"
            disabled={isCompleted && !completionChanged} // Only disable if completed and saved
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Importance (1-10)
          </label>
          <select
            className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            value={importance}
            onChange={(e) => setImportance(Number(e.target.value))}
            disabled={isCompleted && !completionChanged} // Only disable if completed and saved
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                Level {num}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Deadline
          </label>
          <input
            type="date"
            className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            value={formatDateForInput(deadline)}
            onChange={(e) => setDeadline(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            disabled={isCompleted && !completionChanged} // Only disable if completed and saved
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Estimated Completion Time (hours)
          </label>
          <input
            type="number"
            min="0.5"
            step="0.5"
            className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            value={completionTime}
            onChange={(e) => setCompletionTime(Number(e.target.value))}
            placeholder="e.g. 2.5"
            disabled={isCompleted && !completionChanged} // Only disable if completed and saved
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Unique Days Required
          </label>
          <input
            type="number"
            min="0.5"
            step="0.5"
            className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            value={uniqueDaysRequired}
            onChange={(e) => setUniqueDaysRequired(Number(e.target.value))}
            placeholder="e.g. 3"
            disabled={isCompleted && !completionChanged} // Only disable if completed and saved
          />
          <p className="mt-1 text-xs text-gray-500">
            Number of separate days needed to complete this task
          </p>
        </div>

        {/* Recurrence Configuration */}
        <RecurrenceConfig
          initialConfig={{
            type: recurrenceConfig.recurrence_type,
            interval: recurrenceConfig.recurrence_interval || 1,
            dayOfWeek: recurrenceConfig.recurrence_day_of_week,
            dayOfMonth: recurrenceConfig.recurrence_day_of_month,
            endDate: recurrenceConfig.recurrence_end_date,
          }}
          onChange={setRecurrenceConfig}
          disabled={isCompleted && !completionChanged} // Only disable if completed and saved
          className="border-t pt-4"
        />

        {/* Google Calendar Integration - Only show for existing tasks */}
        {isEditing && task && (
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => {
                const calendarUrl = generateGoogleCalendarUrl(task);
                window.open(calendarUrl, '_blank', 'noopener,noreferrer');
              }}
              className="w-full flex items-center justify-center gap-2 rounded bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              <svg
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z"/>
              </svg>
              Add to Google Calendar
            </button>
          </div>
        )}

        <div className="flex justify-between border-t pt-4">
          {isEditing &&
            !(isCompleted && !completionChanged) && ( // Hide delete for completed tasks
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteTask.isPending}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteTask.isPending ? "Deleting..." : "Delete Task"}
              </button>
            )}
          <div
            className={`${isEditing && !(isCompleted && !completionChanged) ? "ml-auto" : ""} space-x-2`}
          >
            <button
              type="button"
              onClick={onCancel}
              className="rounded bg-gray-300 px-4 py-2 text-white hover:bg-gray-400"
            >
              Cancel
            </button>
            {!(isCompleted && !completionChanged) && ( // Hide save for completed tasks that haven't changed
              <button
                type="submit"
                disabled={saveTask.isPending || !name.trim()}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saveTask.isPending
                  ? isCreating
                    ? "Creating..."
                    : "Saving..."
                  : isCreating
                    ? "Create Task"
                    : "Save Changes"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
