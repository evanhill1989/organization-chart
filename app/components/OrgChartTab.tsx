// app/components/OrgChartTab.tsx
import { useRef, useState } from "react";

import type { OrgNode } from "../types/orgChart";
import { useOrgChartAnimations } from "../hooks/useOrgChartAnimations";
import { useToggleOpen } from "../hooks/useToggleOpen";
import { useIsMobile } from "../hooks/useIsMobile";

import OrgChartNode from "./OrgChartNode";
import MobileOrgChart from "./MobileOrgChart";
import TaskForm from "./tasks/TaskForm"; // ✅ Changed import

interface OrgChartTabProps {
  tree: OrgNode;
  tabName: string;
}

export default function OrgChartTab({ tree, tabName }: OrgChartTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // State for managing which nodes are expanded
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  // ✅ Updated state for TaskForm
  const [selectedTask, setSelectedTask] = useState<OrgNode | null>(null);

  // Custom hook for handling open/close logic
  const toggleOpen = useToggleOpen(tree, tabName, setOpenMap);

  // Custom hook for GSAP animations
  useOrgChartAnimations({
    containerRef,
    tree,
    openMap,
    tabName,
    isMobile,
  });

  // Task click handler
  const handleTaskClick = (node: OrgNode) => {
    setSelectedTask(node);
  };

  // ✅ Updated close handler
  const handleCloseTaskForm = () => {
    setSelectedTask(null);
  };

  return (
    <>
      <div
        ref={containerRef}
        className="relative flex h-full w-full items-start justify-center p-4"
      >
        {isMobile ? (
          <MobileOrgChart
            root={tree}
            tabName={tabName}
            onTaskClick={handleTaskClick}
            openMap={openMap}
            toggleOpen={toggleOpen}
          />
        ) : (
          <div className="flex w-full flex-col items-center">
            <h2 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
              {tabName}
            </h2>

            {tree.children && tree.children.length > 0 ? (
              <div className="grid auto-cols-min grid-flow-col gap-8">
                {tree.children.map((child) => (
                  <OrgChartNode
                    key={child.name}
                    node={child}
                    level={1}
                    onTaskClick={handleTaskClick}
                    openMap={openMap}
                    toggleOpen={toggleOpen}
                    path={`/${tabName}/${child.name}`}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-gray-600 dark:text-gray-300">
                  No items in this category yet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ✅ Updated to use TaskForm */}
      {selectedTask && (
        <TaskForm task={selectedTask} onCancel={handleCloseTaskForm} />
      )}
    </>
  );
}
