// components/MobileOrgChart.tsx
import { useState } from "react";
import type { OrgNode } from "../types/org";
import OrgChartNode from "./OrgChartNode";

interface MobileOrgChartProps {
  root: OrgNode;
  tabName: string;
  onTaskClick: (task: OrgNode) => void;
  openMap: Record<string, boolean>;
  toggleOpen: (path: string) => void;
}

export default function MobileOrgChart({
  root,
  tabName,
  onTaskClick,
  openMap,
  toggleOpen,
}: MobileOrgChartProps) {
  // Track current "drill-down" path
  const [pathStack, setPathStack] = useState<OrgNode[]>([root]);

  const currentNode = pathStack[pathStack.length - 1];

  const goBack = () => {
    if (pathStack.length > 1) {
      setPathStack(pathStack.slice(0, -1));
    }
  };

  const goForward = (child: OrgNode) => {
    if (child.children && child.children.length > 0) {
      setPathStack([...pathStack, child]);
    }
  };

  return (
    <div className="w-full p-4">
      {/* Header */}
      <div className="flex items-center mb-4">
        {pathStack.length > 1 && (
          <button
            onClick={goBack}
            className="mr-2 px-3 py-1 text-sm bg-gray-200 rounded-lg"
          >
            ← Back
          </button>
        )}
        <h2 className="text-2xl font-bold">{currentNode.name ?? tabName}</h2>
      </div>

      {/* Current column of nodes */}
      <div className="flex flex-col gap-3">
        {currentNode.children?.map((child) => (
          <div
            key={child.name}
            className="flex items-center justify-between border rounded-xl p-3 bg-white shadow-sm"
          >
            <OrgChartNode
              node={child}
              onTaskClick={onTaskClick}
              openMap={openMap}
              toggleOpen={toggleOpen}
              path={`/${tabName}/${child.name}`}
            />
            {child.children && child.children.length > 0 && (
              <button
                onClick={() => goForward(child)}
                className="ml-2 text-sm text-blue-600"
              >
                →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
