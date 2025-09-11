import TasksDueTodayButton from "./tasks/TasksDueTodayButton";
import QuickAddButton from "./tasks/QuickAddButton";
import { Link } from "react-router";
import { TABS } from "../lib/consts/TABS";
import DarkModeToggle from "./ui/DarkModeToggle";
import TimeAvailabilityReport from "./TimeAvailabilityReport";

// DesktopNav.tsx
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
        {TABS.map((tab) => (
          <Link
            key={tab}
            to={`/org-chart/${tab}`}
            className={`border-b-2 px-6 py-3 text-lg font-medium transition-colors duration-200 ${
              activeTab === tab
                ? "border-white bg-gray-800 text-white dark:bg-gray-700"
                : "border-transparent text-gray-300 hover:bg-gray-800 hover:text-white dark:hover:bg-gray-700"
            }`}
          >
            {tab}
          </Link>
        ))}
      </div>

      <div className="flex items-center space-x-4">
        <DarkModeToggle />
        <TasksDueTodayButton onClick={onOpenTasksDueToday} />

        <QuickAddButton
          onClick={onOpenQuickAdd}
          showLabel
          className="bg-gray-800 hover:bg-gray-700"
        />

        <TimeAvailabilityReport />
      </div>
    </div>
  );
}
