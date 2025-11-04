// app/components/DesktopNav.tsx
import TasksDueTodayButton from "./tasks/TasksDueTodayButton";
import QuickAddButton from "./tasks/QuickAddButton";
import RecentTasksDropdown from "./tasks/RecentTasksDropdown";
import { Link } from "react-router";
import DarkModeToggle from "./ui/DarkModeToggle";
import { useAuth } from "../context/AuthContext";

import TabNavigationList from "./ui/TabNavigationList";

export default function DesktopNav({
  onOpenTasksDueToday,
  onOpenQuickAdd,
  onOpenHamburger,
  activeTab,
  onRecentTaskClick,
}) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="border-b border-gray-700/50 bg-gray-900/95 shadow-md backdrop-blur-sm dark:border-gray-600/50 dark:bg-gray-800/95">
      <div className="mx-auto flex max-w-[1800px] items-center justify-between px-6 py-3">
        {/* Left section: Home link + Navigation */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-base font-semibold text-gray-300 transition-all hover:bg-gray-800/60 hover:text-white dark:hover:bg-gray-700/60"
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span>Home</span>
          </Link>

          {/* Hamburger menu - only show on smaller screens */}
          <div className="block min-[1000px]:hidden">
            <button
              onClick={onOpenHamburger}
              className="rounded-lg p-2 text-gray-300 transition-colors hover:bg-gray-800/60 hover:text-white"
              aria-label="Open navigation menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Tab navigation - only show on larger screens */}
          <div className="hidden min-[1000px]:block">
            <TabNavigationList activeTab={activeTab} variant="desktop" />
          </div>
        </div>

        {/* Right section: Action buttons */}
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <RecentTasksDropdown onTaskClick={onRecentTaskClick} />
          <TasksDueTodayButton onClick={onOpenTasksDueToday} />
          <QuickAddButton
            onClick={onOpenQuickAdd}
            showLabel
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
          />

          {/* User section */}
          {user && (
            <div className="ml-2 flex items-center gap-3 border-l border-gray-700 pl-3 dark:border-gray-600">
              {/* User info */}
              <div className="flex items-center gap-2">
                {/* Avatar */}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                  {user.email?.charAt(0).toUpperCase() || "U"}
                </div>
              </div>

              {/* Sign Out button */}
              <button
                onClick={handleSignOut}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white dark:hover:bg-gray-700"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
