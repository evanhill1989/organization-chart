// app/components/ui/TabNavigationList.tsx
import { Link } from "react-router";
import { TABS } from "../../lib/consts/TABS";
import { useCriticalTaskCounts } from "../../hooks/useCriticalTaskCounts";

interface TabNavigationListProps {
  activeTab: string;
  variant?: "desktop" | "mobile";
  onTabClick?: () => void;
  className?: string;
  itemClassName?: (tab: string, isActive: boolean) => string;
}

export default function TabNavigationList({
  activeTab,
  variant = "desktop",
  onTabClick,
  className = "",
  itemClassName,
}: TabNavigationListProps) {
  const criticalTaskCounts = useCriticalTaskCounts();

  // Default styling based on variant
  const getDefaultItemClassName = (tab: string, isActive: boolean): string => {
    if (variant === "mobile") {
      return `block py-3 px-4 rounded transition-colors ${
        isActive
          ? "bg-gray-700 text-white border-l-4 border-blue-500"
          : "text-gray-300 hover:text-white hover:bg-gray-800"
      }`;
    }

    // Desktop variant - keep original styling
    return `border-b-2 px-6 py-3 text-lg font-medium transition-colors duration-200 ${
      isActive
        ? "border-white bg-gray-800 text-white dark:bg-gray-700"
        : "border-transparent text-gray-300 hover:bg-gray-800 hover:text-white dark:hover:bg-gray-700"
    }`;
  };

  const CriticalUrgencyBadge = ({
    count,
    variant: badgeVariant,
  }: {
    count: number;
    variant: "desktop" | "mobile";
  }) => {
    if (count === 0) return null;

    const baseClasses =
      "inline-flex items-center justify-center rounded-full font-bold text-xs";
    const sizeClasses =
      badgeVariant === "mobile"
        ? "min-w-[20px] h-5 px-1.5"
        : "min-w-[18px] h-4 px-1";
    const colorClasses = "bg-red-600 text-white";

    return (
      <span className={`${baseClasses} ${sizeClasses} ${colorClasses} ml-2`}>
        {count > 99 ? "99+" : count}
      </span>
    );
  };

  return (
    <div className={className}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab;
        const criticalCount = criticalTaskCounts[tab] || 0;
        const finalClassName = itemClassName
          ? itemClassName(tab, isActive)
          : getDefaultItemClassName(tab, isActive);

        return (
          <Link
            key={tab}
            to={`/org-chart/${tab}`}
            onClick={onTabClick}
            className={finalClassName}
          >
            {/* ✅ FIXED: Use inline layout instead of flex justify-between */}
            <span>{tab}</span>
            <CriticalUrgencyBadge count={criticalCount} variant={variant} />
          </Link>
        );
      })}
    </div>
  );
}
