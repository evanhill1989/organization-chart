// app/components/MobileOrgChart.tsx
import { useState, useEffect } from "react";
import type { OrgNode } from "../types/orgChart";
import OrgChartNode from "./OrgChartNode";

type MobileOrgChartProps = {
  root: OrgNode;
  tabName: string;
  onTaskClick: (node: OrgNode) => void;
  openMap: Record<string, boolean>;
  toggleOpen: (path: string) => void;
};

export default function MobileOrgChart({
  root,
  tabName,
  onTaskClick,
  openMap,
  toggleOpen,
  ref,
}: MobileOrgChartProps & { ref?: React.Ref<HTMLDivElement> }) {
  // Currently active parent path whose children we are showing
  const [activePath, setActivePath] = useState<string>(`/${tabName}`);

  // Helper: find node by full path
  const getNodeByPath = (node: OrgNode, path: string): OrgNode | null => {
    const segments = path.split("/").filter(Boolean);
    if (!segments.length) return node;

    let current: OrgNode | undefined = node;
    for (let i = 1; i < segments.length; i++) {
      if (!current.children) return null;
      current = current.children.find((child) => child.name === segments[i]);
      if (!current) return null;
    }
    return current || null;
  };

  const currentNode = getNodeByPath(root, activePath) || root;

  // Instead of calling toggleOpen multiple times, directly update the parent's openMap
  // We need to inform the parent component about what paths should be "open" for animations
  useEffect(() => {
    // Build all visible paths for current mobile view
    const visiblePaths: string[] = [];

    // Add the active path itself
    visiblePaths.push(activePath);

    // Add all direct children of current node
    if (currentNode.children) {
      currentNode.children.forEach((child) => {
        const childPath = `${activePath}/${child.name}`;
        visiblePaths.push(childPath);
      });
    }

    // Use a custom event or callback to inform parent about visible paths
    // For now, we'll mark these as open by calling toggleOpen only if not already open
    visiblePaths.forEach((path) => {
      if (!openMap[path]) {
        console.log(`Mobile: marking ${path} as open`);
        toggleOpen(path);
      }
    });
  }, [activePath, currentNode, toggleOpen]); // Removed openMap from deps to avoid loops

  // Determine parent path for back navigation
  const parentPath =
    activePath.split("/").slice(0, -1).join("/") || `/${tabName}`;

  const goForward = (child: OrgNode) => {
    const newPath = `${activePath}/${child.name}`;
    console.log(`Mobile: navigating forward to ${newPath}`);
    setActivePath(newPath);
  };

  const goBack = () => {
    console.log(`Mobile: navigating back to ${parentPath}`);
    setActivePath(parentPath);
  };

  return (
    <div ref={ref} className="w-full max-w-md mx-auto p-4 flex flex-col">
      <h2 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-gray-100">
        {tabName}
      </h2>

      {/* Current path breadcrumb */}
      <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
        {activePath.replace(`/${tabName}`, tabName).replace(/\//g, " → ")}
      </div>

      {/* Back button if not at root */}
      {activePath !== `/${tabName}` && (
        <button
          onClick={goBack}
          className="mb-4 text-blue-600 dark:text-blue-400 font-semibold text-left hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          ← Back
        </button>
      )}

      <div className="flex flex-col gap-4">
        {currentNode.children?.map((child) => {
          // Construct full hierarchical path for this child
          const childPath = `${activePath}/${child.name}`;

          return (
            <div
              key={childPath}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex-1">
                <OrgChartNode
                  node={child}
                  onTaskClick={onTaskClick}
                  openMap={openMap}
                  toggleOpen={toggleOpen}
                  path={childPath} // ✅ full path for GSAP animations
                  disableExpand={true} // disable desktop expand buttons
                />
              </div>

              {/* Forward button for drill-down */}
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
