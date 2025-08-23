// src/lib/urgencyUtils.ts
import type { OrgNode } from "../types/orgChart";

export function getUrgencyBorderClasses(urgency: number = 1): string {
  switch (urgency) {
    case 1:
      return ""; // No special border styling
    case 2:
      return "border-2 border-lime-400"; // Greenish yellow
    case 3:
      return "border-2 border-yellow-400"; // Yellow
    case 4:
      return "border-2 border-yellow-500"; // Deeper yellow
    case 5:
      return "border-2 border-amber-500"; // Amber
    case 6:
      return "border-2 border-orange-400"; // Orange
    case 7:
      return "border-2 border-orange-500"; // Deeper orange
    case 8:
      return "border-2 border-red-400"; // Light red
    case 9:
      return "border-2 border-red-500"; // Red
    case 10:
      return "border-2 border-red-600"; // Bright red
    default:
      return "";
  }
}

export function getUrgencyModalBorderClasses(urgency: number = 1): string {
  switch (urgency) {
    case 1:
      return ""; // No special border styling
    case 2:
      return "border-4 border-lime-400"; // Greenish yellow
    case 3:
      return "border-4 border-yellow-400"; // Yellow
    case 4:
      return "border-4 border-yellow-500"; // Deeper yellow
    case 5:
      return "border-4 border-amber-500"; // Amber
    case 6:
      return "border-4 border-orange-400"; // Orange
    case 7:
      return "border-4 border-orange-500"; // Deeper orange
    case 8:
      return "border-4 border-red-400"; // Light red
    case 9:
      return "border-4 border-red-500"; // Red
    case 10:
      return "border-4 border-red-600"; // Bright red
    default:
      return "";
  }
}

export function getUrgencyGlowClasses(urgency: number = 1): string {
  if (urgency <= 1) return "";

  switch (urgency) {
    case 2:
      return "shadow-lg shadow-lime-400/50";
    case 3:
      return "shadow-lg shadow-yellow-400/50";
    case 4:
      return "shadow-lg shadow-yellow-500/50";
    case 5:
      return "shadow-lg shadow-amber-500/50";
    case 6:
      return "shadow-lg shadow-orange-400/50";
    case 7:
      return "shadow-lg shadow-orange-500/50";
    case 8:
      return "shadow-lg shadow-red-400/50";
    case 9:
      return "shadow-lg shadow-red-500/50";
    case 10:
      return "shadow-xl shadow-red-600/75 animate-pulse";
    default:
      return "";
  }
}

/**
 * Recursively finds the highest urgency value among all descendant tasks
 */
export function getMaxChildTaskUrgency(node: OrgNode): number {
  // If this is a task, return its urgency
  if (node.type === "task") {
    return node.urgency ?? 1;
  }

  // If this is a category with no children, return 1 (no urgency)
  if (!node.children || node.children.length === 0) {
    return 1;
  }

  // Recursively check all children and return the maximum urgency
  const childUrgencies = node.children.map((child) =>
    getMaxChildTaskUrgency(child)
  );
  return Math.max(...childUrgencies);
}

/**
 * Gets the effective urgency for a node:
 * - For tasks: returns the task's own urgency
 * - For categories: returns the highest urgency among all descendant tasks
 */
export function getEffectiveUrgency(node: OrgNode): number {
  return getMaxChildTaskUrgency(node);
}
