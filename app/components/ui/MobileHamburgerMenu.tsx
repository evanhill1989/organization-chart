// app/components/ui/MobileHamburgerMenu.tsx
import { Link } from "react-router";
import TabNavigationList from "./TabNavigationList";
import { useRecentTasks } from "../../hooks/useRecentTasks";
import type { OrgNodeRow } from "../../types/orgChart";

export default function MobileHamburgerMenu({
  isOpen,
  onClose,
  activeTab,
  onRecentTaskClick,
}: {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onRecentTaskClick?: (task: OrgNodeRow) => void;
}) {
  const { data: recentTasks, isLoading } = useRecentTasks();

  const handleTaskClick = (task: OrgNodeRow) => {
    onRecentTaskClick?.(task);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="bg-opacity-50 fixed inset-0 bg-black" onClick={onClose} />

      {/* Menu Panel */}
      <div className="fixed top-0 left-0 h-full w-80 transform bg-gray-900 shadow-xl transition-transform dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-700 p-4">
          <h2 className="text-lg font-semibold text-white">Navigation</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-400 hover:text-white"
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <div className="p-4">
          <Link
            to="/"
            className="mb-2 block rounded px-4 py-3 text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
            onClick={onClose}
          >
            ← Home
          </Link>

          <div className="mt-4 border-t border-gray-700 pt-4">
            <h3 className="mb-3 text-sm font-medium tracking-wide text-gray-400 uppercase">
              Categories
            </h3>

            <TabNavigationList
              activeTab={activeTab}
              variant="mobile"
              onTabClick={onClose}
            />
          </div>

          {/* Recent Tasks Section */}
          {onRecentTaskClick && (
            <div className="mt-4 border-t border-gray-700 pt-4">
              <h3 className="mb-3 text-sm font-medium tracking-wide text-gray-400 uppercase">
                Recent Tasks
              </h3>

              {isLoading && (
                <div className="flex items-center justify-center py-4">
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-blue-600"></div>
                </div>
              )}

              {!isLoading && (!recentTasks || recentTasks.length === 0) && (
                <p className="px-4 py-2 text-sm text-gray-500">
                  No recent tasks yet
                </p>
              )}

              {!isLoading && recentTasks && recentTasks.length > 0 && (
                <div className="space-y-1">
                  {recentTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => handleTaskClick(task)}
                      className="w-full rounded px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{task.name}</span>
                        {task.importance && task.importance >= 8 && (
                          <span className="ml-2 text-purple-400">★</span>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-gray-500">
                        {task.category_name}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
