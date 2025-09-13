// app/components/DesktopNav.tsx
import TasksDueTodayButton from "./tasks/TasksDueTodayButton";
import QuickAddButton from "./tasks/QuickAddButton";
import { Link } from "react-router";
import DarkModeToggle from "./ui/DarkModeToggle";

import TabNavigationList from "./ui/TabNavigationList";

export default function DesktopNav({
  onOpenTasksDueToday,
  onOpenQuickAdd,
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

        <TabNavigationList activeTab={activeTab} variant="desktop" />
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
