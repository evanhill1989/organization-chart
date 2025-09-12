// app/components/OrgChartRoot.tsx
import { useRef, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import type { OrgNode } from "../types/orgChart";
import { useOrgChartAnimations } from "../hooks/useOrgChartAnimations";
import { useToggleOpen } from "../hooks/useToggleOpen";
import { useIsMobile } from "../hooks/useIsMobile";
import { fetchOrgTree } from "../lib/fetchOrgTree";

import OrgChartNode from "./OrgChartNode";
import MobileOrgChart from "./MobileOrgChart";
import TaskForm from "./tasks/TaskForm";

interface OrgChartRootProps {
  tabName: string;
}

export default function OrgChartRoot({ tabName }: OrgChartRootProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // 🎯 Pure data fetching and state management
  const { data: tree, isLoading, error } = useQuery<OrgNode>({
    queryKey: ["orgTree", tabName],
    queryFn: () => fetchOrgTree(tabName),
    placeholderData: keepPreviousData,
  });

  // State for managing which nodes are expanded
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const [selectedTask, setSelectedTask] = useState<OrgNode | null>(null);

  // Custom hooks
  const toggleOpen = useToggleOpen(tree || ({} as OrgNode), tabName, setOpenMap);

  // GSAP animations
  useOrgChartAnimations({
    containerRef,
    tree: tree || ({} as OrgNode),
    openMap,
    tabName,
    isMobile,
  });

  // Event handlers
  const handleTaskClick = (node: OrgNode) => setSelectedTask(node);
  const handleCloseTaskForm = () => setSelectedTask(null);

  // Loading/error states
  if (isLoading) return <div className="text-center py-8">Loading {tabName} tree...</div>;
  if (error) return <div className="text-center py-8 text-red-600">Error loading {tabName} tree</div>;
  if (!tree) return <div className="text-center py-8">No data found</div>;

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
          // ✅ Single recursive component handles everything
          <OrgChartNode
            node={tree}
            level={0}
            onTaskClick={handleTaskClick}
            openMap={openMap}
            toggleOpen={toggleOpen}
            path={`/${tabName}`}
            isRoot={true} // ✅ New prop to handle root styling
          />
        )}
      </div>

      {selectedTask && (
        <TaskForm task={selectedTask} onCancel={handleCloseTaskForm} />
      )}
    </>
  );
}