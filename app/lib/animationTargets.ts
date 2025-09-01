// app/lib/animationTargets.ts
import type { OrgNode } from "../types/orgChart";
import { getEffectiveUrgency } from "./urgencyUtils";
import { getEffectiveImportance } from "./importanceUtils";

/**
 * Recursively find all paths that should animate urgency orbs.
 */
export function findAllUrgencyAnimationTargets(
  node: OrgNode,
  openMap: Record<string, boolean>,
  basePath: string
): string[] {
  const currentPath = basePath ? `${basePath}/${node.name}` : `/${node.name}`;
  const effectiveUrgency = getEffectiveUrgency(node);

  if (effectiveUrgency <= 1) return [];

  if (node.type === "task") return [currentPath];

  const isOpen = openMap[currentPath];
  if (!isOpen) return [currentPath];

  const allChildTargets: string[] = [];
  if (node.children) {
    for (const child of node.children) {
      const childTargets = findAllUrgencyAnimationTargets(
        child,
        openMap,
        currentPath
      );
      allChildTargets.push(...childTargets);
    }
  }

  return allChildTargets;
}

/**
 * Recursively find the deepest node with max importance (10)
 * that should animate importance glow.
 */
export function findDeepestImportanceAnimationTarget(
  node: OrgNode,
  openMap: Record<string, boolean>,
  basePath: string
): string | null {
  const currentPath = basePath ? `${basePath}/${node.name}` : `/${node.name}`;
  const effectiveImportance = getEffectiveImportance(node);

  if (effectiveImportance !== 10) return null;

  if (node.type === "task") return currentPath;

  const isOpen = openMap[currentPath];
  if (!isOpen) return currentPath;

  if (node.children) {
    for (const child of node.children) {
      const childTarget = findDeepestImportanceAnimationTarget(
        child,
        openMap,
        currentPath
      );
      if (childTarget) return childTarget;
    }
  }

  return null;
}
