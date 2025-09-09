// app/components/OrgChartTab.tsx
import { useRef, useState } from "react";

import type { OrgNode } from "../types/orgChart";
import { useOrgChartAnimations } from "../hooks/useOrgChartAnimations";
import { useToggleOpen } from "../hooks/useToggleOpen";
import { useIsMobile } from "../hooks/useIsMobile";

import OrgChartNode from "./OrgChartNode";
import MobileOrgChart from "./MobileOrgChart";
import TaskDetailsModal from "./TaskDetailsModal";

interface OrgChartTabProps {
  tree: OrgNode;
  tabName: string;
}

export default function OrgChartTab({ tree, tabName }: OrgChartTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // State for managing which nodes are expanded
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  // State for task details modal
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

  // Close task details modal
  const handleCloseTaskModal = () => {
    setSelectedTask(null);
  };

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full h-full flex justify-center items-start p-4"
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
          <div className="flex flex-col items-center w-full">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100">
              {tabName}
            </h2>

            {tree.children && tree.children.length > 0 ? (
              <div className="grid gap-8 auto-cols-min grid-flow-col">
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
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-300">
                  No items in this category yet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Details Modal */}
      <TaskDetailsModal task={selectedTask} onClose={handleCloseTaskModal} />
    </>
  );
}
