import TasksDueTodayButton from "./TasksDueTodayButton";
import QuickAddButton from "./QuickAddButton";
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
    <div className="flex justify-between items-center px-4">
      <div className="flex justify-center items-center">
        <Link
          to="/"
          className="px-4 py-3 text-lg font-medium text-gray-300 hover:text-white hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors mr-4"
        >
          ← Home
        </Link>
        {TABS.map((tab) => (
          <Link
            key={tab}
            to={`/org-chart/${tab}`}
            className={`px-6 py-3 text-lg font-medium border-b-2 transition-colors duration-200 ${
              activeTab === tab
                ? "border-white text-white bg-gray-800 dark:bg-gray-700"
                : "border-transparent text-gray-300 hover:text-white hover:bg-gray-800 dark:hover:bg-gray-700"
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
