// app/components/OrgChartRoot.tsx (Fixed initialization)
import { useRef, useState, useEffect } from "react";
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

// ✅ Utility function to find a node by its path
const getNodeByPath = (root: OrgNode, path: string): OrgNode | null => {
  const segments = path.split("/").filter(Boolean);
  if (!segments.length) return root;

  let current: OrgNode | undefined = root;
  for (let i = 1; i < segments.length; i++) {
    if (!current?.children) return null;
    current = current.children.find((child) => child.name === segments[i]);
    if (!current) return null;
  }
  return current || null;
};

export default function OrgChartRoot({ tabName }: OrgChartRootProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Desktop state
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const [selectedTask, setSelectedTask] = useState<OrgNode | null>(null);

  // ✅ Mobile navigation state (properly initialized)
  const [activePath, setActivePath] = useState<string>(`/${tabName}`);

  // ✅ Reset activePath when tabName changes
  useEffect(() => {
    setActivePath(`/${tabName}`);
  }, [tabName]);

  // Data fetching
  const {
    data: tree,
    isLoading,
    error,
  } = useQuery<OrgNode>({
    queryKey: ["orgTree", tabName],
    queryFn: () => fetchOrgTree(tabName),
    placeholderData: keepPreviousData,
  });

  // Desktop hooks (only used when not mobile)
  const toggleOpen = useToggleOpen(
    tree || ({} as OrgNode),
    tabName,
    setOpenMap,
  );

  useOrgChartAnimations({
    containerRef,
    tree: tree || ({} as OrgNode),
    openMap,
    tabName,
    isMobile,
    activePath: isMobile ? activePath : undefined, // Only pass for mobile
  });

  // Event handlers
  const handleTaskClick = (node: OrgNode) => setSelectedTask(node);
  const handleCloseTaskForm = () => setSelectedTask(null);

  // Loading/error states
  if (isLoading) {
    return (
      <div className="py-8 text-center text-gray-900 dark:text-gray-100">
        Loading {tabName} tree...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-red-600 dark:text-red-400">
        Error loading {tabName} tree
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="py-8 text-center text-gray-900 dark:text-gray-100">
        No data found
      </div>
    );
  }

  // ✅ Get current node for mobile view with safety check
  const currentNode = isMobile ? getNodeByPath(tree, activePath) : null;

  return (
    <>
      <div
        ref={containerRef}
        className="relative flex h-full w-full items-start justify-center p-4"
      >
        {isMobile ? (
          // ✅ Mobile view with additional safety checks
          currentNode && activePath ? (
            <MobileOrgChart
              root={tree}
              currentNode={currentNode}
              activePath={activePath}
              setActivePath={setActivePath}
              onTaskClick={handleTaskClick}
              tabName={tabName}
            />
          ) : (
            <div className="py-8 text-center text-red-600">
              Navigation error: Node not found
              <div className="mt-2 text-sm">
                Tab: {tabName}, Path: {activePath || "undefined"}
              </div>
            </div>
          )
        ) : (
          // ✅ Desktop view with recursive component
          <OrgChartNode
            node={tree}
            level={0}
            onTaskClick={handleTaskClick}
            openMap={openMap}
            toggleOpen={toggleOpen}
            path={`/${tabName}`}
            isRoot={true}
          />
        )}
      </div>

      {/* Task form modal */}
      {selectedTask && (
        <TaskForm task={selectedTask} onCancel={handleCloseTaskForm} />
      )}
    </>
  );
}
