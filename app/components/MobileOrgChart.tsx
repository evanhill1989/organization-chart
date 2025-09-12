// app/components/MobileOrgChart.tsx (Refactored)
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
  root,
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
    const parentPath = activePath.split("/").slice(0, -1).join("/") || `/${tabName}`;
    console.log(`Mobile: navigating back to ${parentPath}`);
    setActivePath(parentPath);
  };

  // ✅ Helper for breadcrumb display
  const getBreadcrumb = () => {
    return activePath.replace(`/${tabName}`, tabName).replace(/\//g, " → ");
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 flex flex-col">
      <h2 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-gray-100">
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
          className="mb-4 text-blue-600 dark:text-blue-400 font-semibold text-left hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
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
                  className="flex-shrink-0 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 border border-blue-600 dark:border-blue-400 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  Enter →
                </button>
              ) : null}
            </div>
          );
        })}

        {/* Empty state */}
        {!currentNode.children?.length && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No items in this category
          </div>
        )}
      </div>
    </div>
  );
}