// src/components/TaskForm.tsx
import { useState, useEffect } from "react";
import { useDeleteTask, useSaveTask } from "../../hooks/useTasks";
import type { OrgNodeRow } from "../../types/orgChart";
import RecurrenceConfig from "../RecurrenceConfig";
import type { RecurrenceType } from "../../types/orgChart";

interface TaskFormProps {
  task?: OrgNodeRow; // undefined = creating new
  onCancel: () => void;
  // ✅ New props for task creation
  parentId?: number;
  parentName?: string;
  rootCategory?: string;
  tabName?: string;
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
  rootCategory,
  tabName,
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

  // ✅ Recurrence configuration state
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

  const isCreating = !task;
  const isEditing = !!task;

  // Sync when editing task changes
  useEffect(() => {
    if (task) {
      setName(task.name);
      setDetails(task.details ?? "");
      setImportance(task.importance ?? 1);
      setDeadline(task.deadline ?? "");
      setCompletionTime(task.completion_time ?? 1);
      setUniqueDaysRequired(task.unique_days_required ?? 1);

      // ✅ Initialize recurrence configuration for existing tasks
      setRecurrenceConfig({
        recurrence_type: task.recurrence_type || "none",
        recurrence_interval: task.recurrence_interval,
        recurrence_day_of_week: task.recurrence_day_of_week,
        recurrence_day_of_month: task.recurrence_day_of_month,
        recurrence_end_date: task.recurrence_end_date,
        is_recurring_template: task.is_recurring_template || false,
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Determine parent context - use props for new tasks, existing data for edits
    const effectiveParentId = task?.parent_id ?? parentId;
    const effectiveRootCategory = task?.root_category ?? rootCategory;
    const effectiveTabName = task?.tab_name ?? tabName;

    // ✅ Validation for new tasks
    if (
      isCreating &&
      (!effectiveParentId || !effectiveRootCategory || !effectiveTabName)
    ) {
      console.error("❌ Missing required parent context for new task:", {
        parentId: effectiveParentId,
        rootCategory: effectiveRootCategory,
        tabName: effectiveTabName,
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
      root_category: effectiveRootCategory,
      tab_name: effectiveTabName,
      type: "task" as const,
      // ✅ Include recurrence configuration
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

  // ✅ Display parent context for user clarity
  const displayParentPath = () => {
    if (isEditing && task?.root_category) {
      return task.root_category;
    }
    if (isCreating && parentName && rootCategory) {
      return `${rootCategory} > ${parentName}`;
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
          />
          <p className="mt-1 text-xs text-gray-500">
            Number of separate days needed to complete this task
          </p>
        </div>

        {/* ✅ Recurrence Configuration */}
        <RecurrenceConfig
          initialConfig={{
            type: recurrenceConfig.recurrence_type,
            interval: recurrenceConfig.recurrence_interval || 1,
            dayOfWeek: recurrenceConfig.recurrence_day_of_week,
            dayOfMonth: recurrenceConfig.recurrence_day_of_month,
            endDate: recurrenceConfig.recurrence_end_date,
          }}
          onChange={setRecurrenceConfig}
          className="border-t pt-4"
        />

        <div className="flex justify-between border-t pt-4">
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteTask.isPending}
              className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleteTask.isPending ? "Deleting..." : "Delete Task"}
            </button>
          )}
          <div className={`${isEditing ? "ml-auto" : ""} space-x-2`}>
            <button
              type="button"
              onClick={onCancel}
              className="rounded bg-gray-300 px-4 py-2 text-white hover:bg-gray-400"
            >
              Cancel
            </button>
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
          </div>
        </div>
      </form>
    </div>
  );
}
