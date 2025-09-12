// app/components/ui/TabNavigationList.tsx
import { Link } from "react-router";
import { TABS } from "../../lib/consts/TABS";

interface TabNavigationListProps {
  activeTab: string;
  variant?: "desktop" | "mobile";
  onTabClick?: () => void; // For mobile to close menu
  className?: string; // Additional wrapper classes
  itemClassName?: (tab: string, isActive: boolean) => string; // Function to generate item classes
}

export default function TabNavigationList({
  activeTab,
  variant = "desktop",
  onTabClick,
  className = "",
  itemClassName,
}: TabNavigationListProps) {
  // Default styling based on variant
  const getDefaultItemClassName = (tab: string, isActive: boolean): string => {
    if (variant === "mobile") {
      return `block py-3 px-4 rounded transition-colors ${
        isActive
          ? "bg-gray-700 text-white border-l-4 border-blue-500"
          : "text-gray-300 hover:text-white hover:bg-gray-800"
      }`;
    }

    // Desktop variant
    return `border-b-2 px-6 py-3 text-lg font-medium transition-colors duration-200 ${
      isActive
        ? "border-white bg-gray-800 text-white dark:bg-gray-700"
        : "border-transparent text-gray-300 hover:bg-gray-800 hover:text-white dark:hover:bg-gray-700"
    }`;
  };

  return (
    <div className={className}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab;
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
            {tab}
          </Link>
        );
      })}
    </div>
  );
}
