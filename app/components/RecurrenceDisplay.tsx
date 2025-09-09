// app/components/RecurrenceDisplay.tsx
import type { OrgNodeRow } from "../types/orgChart";
import { getRecurrenceDescription } from "../lib/recurrenceUtils";

interface RecurrenceDisplayProps {
  task: OrgNodeRow;
  className?: string;
}

export default function RecurrenceDisplay({
  task,
  className = "",
}: RecurrenceDisplayProps) {
  // Don't render if not a recurring task
  if (task.recurrence_type === "none" && !task.recurring_template_id) {
    return null;
  }

  const isTemplate = task.is_recurring_template;
  const isInstance = task.recurring_template_id && !task.is_recurring_template;

  return (
    <div
      className={`p-3 bg-blue-50 dark:bg-blue-900/20 rounded border-l-4 border-blue-400 ${className}`}
    >
      <div className="flex items-center space-x-2 mb-2">
        <svg
          className="w-5 h-5 text-blue-600 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <span className="font-medium text-blue-800 dark:text-blue-200">
          {isTemplate && "Recurring Task Template"}
          {isInstance && "Recurring Task Instance"}
          {!isTemplate &&
            !isInstance &&
            task.recurrence_type !== "none" &&
            "Recurring Task"}
        </span>
      </div>

      {/* Show pattern for templates or tasks with recurrence info */}
      {task.recurrence_type && task.recurrence_type !== "none" && (
        <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <p>
            <strong>Pattern:</strong>{" "}
            {getRecurrenceDescription({
              type: task.recurrence_type,
              interval: task.recurrence_interval || 1,
              dayOfWeek: task.recurrence_day_of_week,
              dayOfMonth: task.recurrence_day_of_month,
            })}
          </p>
          {task.recurrence_end_date && (
            <p>
              <strong>Ends:</strong>{" "}
              {new Date(task.recurrence_end_date).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Show instance info */}
      {isInstance && (
        <p className="text-sm text-blue-700 dark:text-blue-300">
          This is an instance of a recurring task. Completing it will create the
          next occurrence.
        </p>
      )}

      {/* Show template info */}
      {isTemplate && (
        <p className="text-sm text-blue-700 dark:text-blue-300">
          This is the template for a recurring task. Edit this to change future
          instances.
        </p>
      )}
    </div>
  );
}
