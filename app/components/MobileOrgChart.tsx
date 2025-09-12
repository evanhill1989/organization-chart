// app/components/MobileOrgChart.tsx (Fixed)
import type { OrgNode } from "../types/orgChart";
import OrgChartNode from "./OrgChartNode";

type MobileOrgChartProps = {
  root: OrgNode;
  currentNode: OrgNode;
  activePath: string;
  setActivePath: (path: string) => void;
  onTaskClick: (node: OrgNode) => void;
  tabName: string;
};

export default function MobileOrgChart({
  currentNode,
  activePath,
  setActivePath,
  onTaskClick,
  tabName,
}: MobileOrgChartProps) {
  // ✅ Pure functions - no state management
  const goForward = (child: OrgNode) => {
    const newPath = `${activePath}/${child.name}`;
    console.log(`Mobile: navigating forward to ${newPath}`);
    setActivePath(newPath);
  };

  const goBack = () => {
    const parentPath =
      activePath.split("/").slice(0, -1).join("/") || `/${tabName}`;
    console.log(`Mobile: navigating back to ${parentPath}`);
    setActivePath(parentPath);
  };

  // ✅ Helper for breadcrumb display with safety checks
  const getBreadcrumb = () => {
    // Safety check for undefined activePath
    if (!activePath || typeof activePath !== "string") {
      console.warn(
        "MobileOrgChart: activePath is undefined or not a string:",
        activePath,
      );
      return tabName; // Fallback to just the tab name
    }

    try {
      return activePath.replace(`/${tabName}`, tabName).replace(/\//g, " → ");
    } catch (error) {
      console.error("Error generating breadcrumb:", error);
      return tabName; // Fallback to just the tab name
    }
  };

  // ✅ Additional safety checks
  if (!activePath) {
    console.error(
      "MobileOrgChart: activePath is required but was:",
      activePath,
    );
    return (
      <div className="mx-auto flex w-full max-w-md flex-col p-4">
        <div className="py-8 text-center text-red-600">
          Navigation error: Invalid path
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col p-4">
      <h2 className="mb-4 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
        {tabName}
      </h2>

      {/* Breadcrumb */}
      <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
        {getBreadcrumb()}
      </div>

      {/* Back button */}
      {activePath !== `/${tabName}` && (
        <button
          onClick={goBack}
          className="mb-4 text-left font-semibold text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← Back
        </button>
      )}

      {/* Children list */}
      <div className="flex flex-col gap-4">
        {currentNode.children?.map((child) => {
          const childPath = `${activePath}/${child.name}`;

          return (
            <div
              key={childPath}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex-1">
                <OrgChartNode
                  node={child}
                  level={1} // Always level 1 for mobile children
                  onTaskClick={onTaskClick}
                  openMap={{}} // ✅ No longer needed - empty object
                  toggleOpen={() => {}} // ✅ No longer needed - empty function
                  path={childPath}
                  disableExpand={true} // ✅ Disable desktop expand behavior
                  isRoot={false}
                />
              </div>

              {/* Forward navigation button */}
              {!child.is_completed && child.children?.length ? (
                <button
                  onClick={() => goForward(child)}
                  className="flex-shrink-0 rounded border border-blue-600 px-3 py-1 text-sm text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                >
                  Enter →
                </button>
              ) : null}
            </div>
          );
        })}

        {/* Empty state */}
        {!currentNode.children?.length && (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            No items in this category
          </div>
        )}
      </div>
    </div>
  );
}
