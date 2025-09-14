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
  onTabClick,
}: TabNavigationListProps) {
  const urgentTaskCounts = useCriticalTaskCounts();

  // Keep original styling logic

  return (
    <div className="flex gap-6">
      {TABS.map((tab) => {
        const criticalCount = urgentTaskCounts[tab] || 0;

        return (
          <Link key={tab} to={`/org-chart/${tab}`} onClick={onTabClick}>
            {tab}
            {/* Simple red badge - that's it! */}
            {criticalCount > 0 && (
              <span className="ml-2 items-center bg-red-600 px-1 text-xs font-bold text-white">
                {criticalCount > 99 ? "99+" : criticalCount}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
