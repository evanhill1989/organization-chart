// app/components/ui/SecondaryNav.tsx
import TabNavigationList from "./TabNavigationList";

interface SecondaryNavProps {
  activeTab: string;
  variant?: "desktop" | "mobile";
}

/**
 * Secondary navigation bar for org-chart category tabs
 * Positioned below the main navigation, only visible on org-chart routes
 */
export default function SecondaryNav({
  activeTab,
  variant = "desktop",
}: SecondaryNavProps) {
  return (
    <div className="border-b border-gray-700/30 bg-gray-900/90 shadow-sm backdrop-blur-sm dark:border-gray-600/30 dark:bg-gray-800/90">
      <div className="mx-auto max-w-[1800px] px-6 py-2">
        <TabNavigationList activeTab={activeTab} variant={variant} />
      </div>
    </div>
  );
}
