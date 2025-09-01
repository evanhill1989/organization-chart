// app/components/MobileOrgChart.tsx
import { useState } from "react";
import type { OrgNode } from "../types/orgChart";
import OrgChartNode from "./OrgChartNode";

type MobileOrgChartProps = {
  root: OrgNode;
  tabName: string;
  onTaskClick: (node: OrgNode) => void;
  openMap: Record<string, boolean>;
  toggleOpen: (path: string) => void; // required by OrgChartNode but unused in mobile
};

export default function MobileOrgChart({
  root,
  tabName,
  onTaskClick,
  openMap,
  toggleOpen,
}: MobileOrgChartProps) {
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

  // Determine parent path for back navigation
  const parentPath =
    activePath.split("/").slice(0, -1).join("/") || `/${tabName}`;
  const goForward = (child: OrgNode) =>
    setActivePath(`${activePath}/${child.name}`);
  const goBack = () => setActivePath(parentPath);

  return (
    <div className="w-full max-w-md mx-auto p-4 flex flex-col">
      <h2 className="text-2xl font-bold text-center mb-4">{tabName}</h2>

      {/* Back button if not at root */}
      {activePath !== `/${tabName}` && (
        <button
          onClick={goBack}
          className="mb-2 text-blue-600 font-semibold text-left"
        >
          ← Back
        </button>
      )}

      <div className="flex flex-col gap-4">
        {currentNode.children?.map((child) => {
          // Construct full hierarchical path for this child
          const childPath = `${activePath}/${child.name}`;

          return (
            <div key={childPath} className="flex items-center justify-between">
              <OrgChartNode
                node={child}
                onTaskClick={onTaskClick}
                openMap={openMap}
                toggleOpen={toggleOpen}
                path={childPath} // ✅ full path for GSAP animations
                disableExpand={true} // disable desktop expand buttons
              />

              {/* Forward button for drill-down */}
              {!child.is_completed && child.children?.length ? (
                <button
                  onClick={() => goForward(child)}
                  className="ml-2 text-sm text-blue-600"
                >
                  →
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
