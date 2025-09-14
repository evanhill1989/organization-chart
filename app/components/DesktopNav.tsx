// app/components/DesktopNav.tsx
import TasksDueTodayButton from "./tasks/TasksDueTodayButton";
import QuickAddButton from "./tasks/QuickAddButton";
import { Link } from "react-router";
import DarkModeToggle from "./ui/DarkModeToggle";

import TabNavigationList from "./ui/TabNavigationList";

export default function DesktopNav({
  onOpenTasksDueToday,
  onOpenQuickAdd,
  onOpenHamburger,
  activeTab,
}) {
  return (
    <div className="flex items-center justify-between px-4">
      <div className="flex items-center justify-center">
        <Link
          to="/"
          className="mr-4 px-4 py-3 text-lg font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white dark:hover:bg-gray-700"
        >
          ← Home
        </Link>

        <div>
          <button
            onClick={onOpenHamburger}
            className="rounded p-2 text-gray-300 transition-colors hover:text-white"
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

        <div className="hidden gap-4 min-[1000px]:block">
          <TabNavigationList activeTab={activeTab} variant="desktop" />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <DarkModeToggle />
        <TasksDueTodayButton onClick={onOpenTasksDueToday} />
        <QuickAddButton
          onClick={onOpenQuickAdd}
          showLabel
          className="bg-gray-800 hover:bg-gray-700"
        />
      </div>
    </div>
  );
}
