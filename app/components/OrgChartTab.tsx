"use client";

import { useRef, useState } from "react";
import MobileOrgChart from "./MobileOrgChart";

import { useOrgChartAnimations } from "../hooks/useOrgChartAnimations";
import { handleAddNode } from "../lib/orgChartActions";
import type { OrgNode } from "../types/orgChart";
interface OrgChartTabProps {
  tree: OrgNode;
  openMap: Record<string, boolean>;
  tabName: string;
  isMobile: boolean;
}

export default function OrgChartTab({
  tree,
  openMap,
  tabName,
  isMobile,
}: OrgChartTabProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [orgTree, setOrgTree] = useState(tree);

  // Attach GSAP animations
  useOrgChartAnimations({
    containerRef,
    tree: orgTree,
    openMap,
    tabName,
    isMobile,
  });

  // Delegate to orgChartActions
  const onAddNode = (path: string, newNode: OrgNode) => {
    setOrgTree((prev) => handleAddNode(prev, path, newNode));
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {isMobile ? (
        <MobileOrgChart tree={orgTree} onAddNode={onAddNode} />
      ) : (
        <DesktopOrgChart tree={orgTree} onAddNode={onAddNode} />
      )}
    </div>
  );
}
