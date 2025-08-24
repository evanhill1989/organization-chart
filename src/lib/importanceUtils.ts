// src/lib/importanceUtils.ts
import type { OrgNode } from "../types/orgChart";

export function getImportanceBorderClasses(importance: number = 1): string {
  switch (importance) {
    case 1:
      return ""; // No special border styling
    case 2:
      return "border-2 border-cyan-400"; // Light cyan
    case 3:
      return "border-2 border-cyan-500"; // Cyan
    case 4:
      return "border-2 border-blue-400"; // Light blue
    case 5:
      return "border-2 border-blue-500"; // Blue
    case 6:
      return "border-2 border-indigo-400"; // Indigo
    case 7:
      return "border-2 border-indigo-500"; // Deeper indigo
    case 8:
      return "border-2 border-purple-400"; // Light purple
    case 9:
      return "border-2 border-purple-500"; // Purple
    case 10:
      return "border-2 border-purple-600"; // Deep purple
    default:
      return "";
  }
}

export function getImportanceModalBorderClasses(
  importance: number = 1
): string {
  switch (importance) {
    case 1:
      return ""; // No special border styling
    case 2:
      return "border-4 border-cyan-400"; // Light cyan
    case 3:
      return "border-4 border-cyan-500"; // Cyan
    case 4:
      return "border-4 border-blue-400"; // Light blue
    case 5:
      return "border-4 border-blue-500"; // Blue
    case 6:
      return "border-4 border-indigo-400"; // Indigo
    case 7:
      return "border-4 border-indigo-500"; // Deeper indigo
    case 8:
      return "border-4 border-purple-400"; // Light purple
    case 9:
      return "border-4 border-purple-500"; // Purple
    case 10:
      return "border-4 border-purple-600"; // Deep purple
    default:
      return "";
  }
}

export function getImportanceGlowClasses(importance: number = 1): string {
  if (importance <= 1) return "";

  switch (importance) {
    case 2:
      return "shadow-lg shadow-cyan-400/50";
    case 3:
      return "shadow-lg shadow-cyan-500/50";
    case 4:
      return "shadow-lg shadow-blue-400/50";
    case 5:
      return "shadow-lg shadow-blue-500/50";
    case 6:
      return "shadow-lg shadow-indigo-400/50";
    case 7:
      return "shadow-lg shadow-indigo-500/50";
    case 8:
      return "shadow-lg shadow-purple-400/50";
    case 9:
      return "shadow-lg shadow-purple-500/50";
    case 10:
      return "shadow-xl shadow-purple-600/75";
    default:
      return "";
  }
}

/**
 * Recursively finds the highest importance value among all descendant tasks
 */
export function getMaxChildTaskImportance(node: OrgNode): number {
  // If this is a task, return its importance
  if (node.type === "task") {
    return node.importance ?? 1;
  }

  // If this is a category with no children, return 1 (no importance)
  if (!node.children || node.children.length === 0) {
    return 1;
  }

  // Recursively check all children and return the maximum importance
  const childImportances = node.children.map((child) =>
    getMaxChildTaskImportance(child)
  );
  return Math.max(...childImportances);
}

/**
 * Gets the effective importance for a node:
 * - For tasks: returns the task's own importance
 * - For categories: returns the highest importance among all descendant tasks
 */
export function getEffectiveImportance(node: OrgNode): number {
  return getMaxChildTaskImportance(node);
}

export function getImportanceShadowColor(importance?: number): string {
  if (!importance || importance <= 1) return "rgba(0, 0, 0, 0)"; // No shadow
  if (importance <= 3) return "rgba(6, 182, 212, 0.6)"; // Cyan
  if (importance <= 5) return "rgba(59, 130, 246, 0.6)"; // Blue
  if (importance <= 7) return "rgba(99, 102, 241, 0.6)"; // Indigo
  if (importance <= 9) return "rgba(147, 51, 234, 0.6)"; // Purple
  return "rgba(126, 34, 206, 0.8)"; // Deep purple
}

export function getHighestChildImportance(node: OrgNode): number {
  let maxImportance = node.importance || 1;
  if (node.children) {
    for (const child of node.children) {
      maxImportance = Math.max(maxImportance, getHighestChildImportance(child));
    }
  }
  return maxImportance;
}
