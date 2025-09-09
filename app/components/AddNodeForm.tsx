import { useState } from "react";
import RecurrenceConfig from "./RecurrenceConfig";

type AddNodeFormProps = {
  parent_id?: number;
  tab_name: string;
  onAdd: (node: {
    name: string;
    type: "category" | "task";
    details?: string;
    importance?: number;
    // New deadline-related fields (only for tasks)
    deadline?: string;
    completion_time?: number;
    unique_days_required?: number;
    recurrence_type?: "none" | "daily" | "weekly" | "monthly" | "yearly";
    recurrence_interval?: number;
    recurrence_day_of_week?: number;
    recurrence_day_of_month?: number;
    recurrence_end_date?: string;
    is_recurring_template?: boolean;
  }) => void;
  onClose: () => void;
};

export default function AddNodeForm({ onAdd, onClose }: AddNodeFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"category" | "task">("task");
  const [details, setDetails] = useState("");
  const [importance, setImportance] = useState(1);

  // New deadline-related states
  const [deadline, setDeadline] = useState("");
  const [completionTime, setCompletionTime] = useState<number | "">(1);
  const [uniqueDaysRequired, setUniqueDaysRequired] = useState<number | "">(1);

  // Import RecurrenceType from RecurrenceConfig if needed, or define it here to match RecurrenceConfig's expected type
  type RecurrenceType = "none" | "daily" | "weekly" | "monthly" | "yearly";
  type RecurrenceConfigType = {
    recurrence_type: RecurrenceType;
    recurrence_interval?: number;
    recurrence_day_of_week?: number;
    recurrence_day_of_month?: number;
    recurrence_end_date?: string;
    is_recurring_template?: boolean;
  };

  const [recurrenceConfig, setRecurrenceConfig] =
    useState<RecurrenceConfigType>({
      recurrence_type: "none",
      recurrence_interval: undefined,
      recurrence_day_of_week: undefined,
      recurrence_day_of_month: undefined,
      recurrence_end_date: undefined,
      is_recurring_template: false,
    });

  // Helper to format date for input[type="date"]
  const formatDateForInput = (date?: string) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form
        className="bg-gray-800 rounded-lg shadow-lg min-w-[320px] max-w-[400px] p-6 flex flex-col items-center relative max-h-[90vh] overflow-y-auto"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) {
            console.log("🚀 AddNodeForm: Submitting with recurrence config:", {
              name: name.trim(),
              type,
              ...recurrenceConfig,
            });

            onAdd({
              name: name.trim(),
              type,
              details: details.trim() || undefined,
              importance: type === "task" ? importance : undefined,
              // Only include deadline fields for tasks
              deadline: type === "task" && deadline ? deadline : undefined,
              completion_time:
                type === "task" && completionTime
                  ? Number(completionTime)
                  : undefined,
              unique_days_required:
                type === "task" && uniqueDaysRequired
                  ? Number(uniqueDaysRequired)
                  : undefined,
              ...recurrenceConfig,
            });
            setName("");
            setDetails("");
            setImportance(1);
            setDeadline("");
            setCompletionTime(1);
            setUniqueDaysRequired(1);
            onClose();
          }
        }}
      >
        <button
          type="button"
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        <h3 className="text-xl font-bold mb-4 text-white">Add New Node</h3>

        <input
          className="mb-2 px-2 py-1 rounded w-full text-black"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <select
          className="mb-2 px-2 py-1 rounded w-full"
          value={type}
          onChange={(e) => setType(e.target.value as "category" | "task")}
        >
          <option value="category">Category</option>
          <option value="task">Task</option>
        </select>

        <input
          className="mb-2 px-2 py-1 rounded w-full text-black"
          type="text"
          placeholder="Details (optional)"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />

        {type === "task" && (
          <>
            <div className="w-full mb-2">
              <label className="block text-white text-sm font-medium mb-1">
                Importance (1-10):
              </label>
              <select
                className="px-2 py-1 rounded w-full text-black"
                value={importance}
                onChange={(e) => setImportance(Number(e.target.value))}
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full mb-2">
              <label className="block text-white text-sm font-medium mb-1">
                Deadline:
              </label>
              <input
                className="px-2 py-1 rounded w-full text-black"
                type="date"
                value={formatDateForInput(deadline)}
                onChange={(e) => setDeadline(e.target.value)}
                min={new Date().toISOString().split("T")[0]} // Don't allow past dates
              />
            </div>

            <div className="w-full mb-2">
              <label className="block text-white text-sm font-medium mb-1">
                Estimated Completion Time (hours):
              </label>
              <input
                className="px-2 py-1 rounded w-full text-black"
                type="number"
                min="0.5"
                step="0.5"
                value={completionTime}
                onChange={(e) =>
                  setCompletionTime(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                placeholder="e.g. 8.5"
              />
            </div>

            <div className="w-full mb-2">
              <label className="block text-white text-sm font-medium mb-1">
                Unique Days Required:
              </label>
              <input
                className="px-2 py-1 rounded w-full text-black"
                type="number"
                min="0.5"
                step="0.5"
                value={uniqueDaysRequired}
                onChange={(e) =>
                  setUniqueDaysRequired(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                placeholder="e.g. 3"
              />
              <p className="text-xs text-gray-300 mt-1">
                Number of separate days needed to complete this task
              </p>
            </div>
          </>
        )}
        {type === "task" && (
          <RecurrenceConfig onChange={setRecurrenceConfig} className="mb-4" />
        )}

        <button
          className="bg-blue-600 text-white px-4 py-1 rounded font-semibold hover:bg-blue-700 mt-2"
          type="submit"
        >
          Add
        </button>
      </form>
    </div>
  );
}
