import { useState, useRef, useEffect } from "react";
import { useRecentTasks } from "../../hooks/useRecentTasks";
import type { OrgNodeRow } from "../../types/orgChart";

interface RecentTasksDropdownProps {
  onTaskClick: (task: OrgNodeRow) => void;
}

export default function RecentTasksDropdown({
  onTaskClick,
}: RecentTasksDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: recentTasks, isLoading } = useRecentTasks();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleTaskClick = (task: OrgNodeRow) => {
    setIsOpen(false);
    onTaskClick(task);
  };

  const taskCount = recentTasks?.length ?? 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-gray-300 transition-colors hover:text-white"
        title="Recent Tasks"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="hidden text-sm sm:inline">Recent</span>
        {taskCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-bold text-white">
            {taskCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
          <div className="border-b border-gray-700 px-4 py-3">
            <h3 className="font-semibold text-white">Recently Touched Tasks</h3>
            <p className="text-xs text-gray-400">
              Last 10 tasks you've created, edited, or viewed
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
              </div>
            )}

            {!isLoading && taskCount === 0 && (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-400">No recent tasks yet</p>
              </div>
            )}

            {!isLoading && taskCount > 0 && (
              <ul className="divide-y divide-gray-700">
                {recentTasks?.map((task) => (
                  <li key={task.id}>
                    <button
                      onClick={() => handleTaskClick(task)}
                      className="w-full px-4 py-3 text-left transition-colors hover:bg-gray-700/50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-white">{task.name}</p>
                          <p className="text-xs text-gray-400">
                            {task.category_name}
                            {task.deadline && (
                              <>
                                {" "}
                                • Due{" "}
                                {new Date(task.deadline).toLocaleDateString()}
                              </>
                            )}
                          </p>
                        </div>
                        {task.importance && task.importance >= 8 && (
                          <span className="ml-2 flex-shrink-0 text-xs text-purple-400">
                            ★
                          </span>
                        )}
                      </div>
                      {task.last_touched_at && (
                        <p className="mt-1 text-xs text-gray-500">
                          {getRelativeTime(task.last_touched_at)}
                        </p>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to format relative time
function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
