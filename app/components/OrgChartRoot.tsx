// app/components/OrgChartRoot.tsx (Fixed initialization)
import { useRef, useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import type { OrgNode } from "../types/orgChart";
import { useOrgChartAnimations } from "../hooks/useOrgChartAnimations";
import { useToggleOpen } from "../hooks/useToggleOpen";
import { useIsMobile } from "../hooks/useIsMobile";
import { QUERY_KEYS } from "../lib/queryKeys";
import { fetchOrgTree } from "../lib/fetchOrgTree";
import { supabase } from "../lib/data/supabaseClient";

import OrgChartNode from "./OrgChartNode";
import MobileOrgChart from "./MobileOrgChart";
import TaskForm from "./tasks/TaskForm";

interface OrgChartRootProps {
  categoryId: string;
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

export default function OrgChartRoot({ categoryId }: OrgChartRootProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Desktop state
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const [selectedTask, setSelectedTask] = useState<OrgNode | null>(null);

  // Fetch category to get the name
  const { data: category } = useQuery({
    queryKey: ["category", categoryId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .eq("id", categoryId)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data as { id: string; name: string };
    },
    enabled: !!categoryId,
  });

  const categoryName = category?.name || "";

  // ✅ Mobile navigation state (properly initialized)
  const [activePath, setActivePath] = useState<string>(`/${categoryName}`);

  // ✅ Reset activePath when categoryName changes
  useEffect(() => {
    if (categoryName) {
      setActivePath(`/${categoryName}`);
    }
  }, [categoryName]);

  // Data fetching
  const {
    data: tree,
    isLoading,
    error,
  } = useQuery<OrgNode>({
    queryKey: QUERY_KEYS.orgTree(categoryId),
    queryFn: () => fetchOrgTree(categoryId),
    placeholderData: keepPreviousData,
    enabled: !!categoryId,
  });

  // Desktop hooks (only used when not mobile)
  const toggleOpen = useToggleOpen(
    tree || ({} as OrgNode),
    categoryName,
    setOpenMap,
  );

  useOrgChartAnimations({
    containerRef,
    tree: tree || ({} as OrgNode),
    openMap,
    tabName: categoryName,
    isMobile,
    activePath: isMobile ? activePath : undefined, // Only pass for mobile
  });

  // Event handlers
  const handleTaskClick = (node: OrgNode) => setSelectedTask(node);
  const handleCloseTaskForm = () => setSelectedTask(null);

  // Loading/error states
  if (isLoading || !category) {
    return (
      <div className="py-8 text-center text-gray-900 dark:text-gray-100">
        Loading {categoryName || "category"} tree...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-red-600 dark:text-red-400">
        Error loading {categoryName} tree
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
        className="relative flex h-full w-full items-start p-4"
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
              tabName={categoryName}
            />
          ) : (
            <div className="py-8 text-center text-red-600">
              Navigation error: Node not found
              <div className="mt-2 text-sm">
                Category: {categoryName}, Path: {activePath || "undefined"}
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
            path={`/${categoryName}`}
            isRoot={true}
            categoryId={categoryId}
            categoryName={categoryName}
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
