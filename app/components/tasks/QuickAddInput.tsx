import { useState, useRef, useEffect } from "react";
import { useQuickAddTask } from "../../hooks/useTasks";

interface QuickAddInputProps {
  onTaskAdded?: () => void;
}

export function QuickAddInput({ onTaskAdded }: QuickAddInputProps) {
  const [taskName, setTaskName] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [taskCount, setTaskCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const quickAddMutation = useQuickAddTask();

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!taskName.trim()) {
      return;
    }

    try {
      await quickAddMutation.mutateAsync(taskName);

      // Clear input
      setTaskName("");

      // Show success feedback
      setShowSuccess(true);
      setTaskCount(prev => prev + 1);

      // Re-focus input for rapid entry
      inputRef.current?.focus();

      // Call optional callback
      onTaskAdded?.();

      // Hide success message after 2 seconds
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error("Failed to add quick task:", error);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Quick Add</h3>
        {taskCount > 0 && (
          <span className="text-sm text-gray-500">
            {taskCount} task{taskCount === 1 ? "" : "s"} added
          </span>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="What's on your mind?"
            disabled={quickAddMutation.isPending}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />

          {/* Success checkmark animation */}
          {showSuccess && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg
                className="w-6 h-6 text-green-500 animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!taskName.trim() || quickAddMutation.isPending}
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {quickAddMutation.isPending ? "Adding..." : "Add Task"}
        </button>
      </form>

      {/* Error message */}
      {quickAddMutation.isError && (
        <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg">
          Failed to add task. Please try again.
        </div>
      )}

      {/* Info text */}
      <p className="text-xs text-gray-500">
        Tasks are saved to Quick Inbox in Orphans. Organize them later.
      </p>
    </div>
  );
}
