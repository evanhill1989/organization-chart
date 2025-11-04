// app/components/ui/TabNavigationList.tsx
import { Link } from "react-router";
import { TABS } from "../../lib/consts/TABS";
import { useCriticalTaskCounts } from "../../hooks/useCriticalTaskCounts";

interface TabNavigationListProps {
  activeTab: string;
  variant?: "desktop" | "mobile";
  onTabClick?: () => void;

  itemClassName?: (tab: string, isActive: boolean) => string;
}

export default function TabNavigationList({
  activeTab,
  variant = "desktop",
  onTabClick,
}: TabNavigationListProps) {
  const urgentTaskCounts = useCriticalTaskCounts();

  if (variant === "mobile") {
    // Mobile variant - vertical list
    return (
      <div className="flex flex-col gap-2">
        {TABS.map((tab) => {
          const criticalCount = urgentTaskCounts[tab] || 0;
          const isActive = activeTab === tab;

          return (
            <Link
              key={tab}
              to={`/org-chart/${tab}`}
              onClick={onTabClick}
              className={`flex items-center justify-between rounded-lg px-4 py-3 text-base font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white dark:bg-blue-700"
                  : "text-gray-300 hover:bg-gray-800/60 hover:text-white dark:hover:bg-gray-700/60"
              }`}
            >
              <span>{tab}</span>
              {criticalCount > 0 && (
                <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-red-500 px-2 text-xs font-bold text-white">
                  {criticalCount > 99 ? "99+" : criticalCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    );
  }

  // Desktop variant - horizontal list
  return (
    <div className="flex items-center gap-1">
      {TABS.map((tab) => {
        const criticalCount = urgentTaskCounts[tab] || 0;
        const isActive = activeTab === tab;

        return (
          <Link
            key={tab}
            to={`/org-chart/${tab}`}
            onClick={onTabClick}
            className={`relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              isActive
                ? "bg-blue-600/20 text-blue-400 shadow-inner dark:bg-blue-700/30 dark:text-blue-300"
                : "text-gray-300 hover:bg-gray-800/60 hover:text-white dark:hover:bg-gray-700/60"
            }`}
          >
            <span>{tab}</span>
            {criticalCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white shadow-sm">
                {criticalCount > 99 ? "99+" : criticalCount}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-1/2 h-0.5 w-3/4 -translate-x-1/2 rounded-full bg-blue-400 dark:bg-blue-300" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
