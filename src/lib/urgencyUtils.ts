// src/lib/urgencyUtils.ts
import type { OrgNode } from "../types/orgChart";

/**
 * Gets the color for the urgency ball based on urgency level
 */
export function getUrgencyBallColor(urgency: number = 1): string {
  switch (urgency) {
    case 1:
      return ""; // No ball
    case 2:
      return "bg-lime-400"; // Greenish yellow
    case 3:
      return "bg-yellow-400"; // Yellow
    case 4:
      return "bg-yellow-500"; // Deeper yellow
    case 5:
      return "bg-amber-500"; // Amber
    case 6:
      return "bg-orange-400"; // Orange
    case 7:
      return "bg-orange-500"; // Deeper orange
    case 8:
      return "bg-red-400"; // Light red
    case 9:
      return "bg-red-500"; // Red
    case 10:
      return "bg-red-600"; // Bright red
    default:
      return "";
  }
}

/**
 * Gets the size classes for the urgency ball based on urgency level
 */
export function getUrgencyBallSize(urgency: number = 1): string {
  if (urgency <= 1) return "";

  switch (urgency) {
    case 2:
    case 3:
      return "w-2 h-2"; // Small
    case 4:
    case 5:
    case 6:
      return "w-3 h-3"; // Medium
    case 7:
    case 8:
      return "w-4 h-4"; // Large
    case 9:
    case 10:
      return "w-5 h-5"; // Extra large
    default:
      return "w-2 h-2";
  }
}

/**
 * Gets the animation duration (in seconds) based on urgency level
 * Higher urgency = faster movement
 */
export function getUrgencyAnimationDuration(urgency: number = 1): number {
  if (urgency <= 1) return 0;

  switch (urgency) {
    case 2:
      return 4.0; // Very slow
    case 3:
      return 3.5; // Slow
    case 4:
      return 3.0;
    case 5:
      return 2.5;
    case 6:
      return 2.0; // Medium
    case 7:
      return 1.5;
    case 8:
      return 1.2; // Fast
    case 9:
      return 1.0; // Very fast
    case 10:
      return 0.8; // Extremely fast
    default:
      return 2.0;
  }
}

/**
 * Gets the glow/shadow effect for the urgency ball
 */
export function getUrgencyBallGlow(urgency: number = 1): string {
  if (urgency <= 1) return "";

  switch (urgency) {
    case 2:
      return "shadow-sm shadow-lime-400/50";
    case 3:
      return "shadow-sm shadow-yellow-400/50";
    case 4:
      return "shadow-sm shadow-yellow-500/50";
    case 5:
      return "shadow-md shadow-amber-500/50";
    case 6:
      return "shadow-md shadow-orange-400/50";
    case 7:
      return "shadow-md shadow-orange-500/50";
    case 8:
      return "shadow-lg shadow-red-400/60";
    case 9:
      return "shadow-lg shadow-red-500/70";
    case 10:
      return "shadow-xl shadow-red-600/80";
    default:
      return "";
  }
}

/**
 * Determines if an urgency ball should be created
 */
export function shouldShowUrgencyBall(urgency: number = 1): boolean {
  return urgency > 1;
}

/**
 * Creates an SVG path for the urgency ball to orbit around a node
 * Uses MotionPathPlugin for smooth, customizable orbital motion
 */
export function createUrgencyOrbitalPath(
  containerElement: Element,
  urgency: number
): string {
  const rect = containerElement.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  // Base radius with padding, scales slightly with urgency for visual variety
  const baseRadius = Math.min(rect.width, rect.height) / 2 + 12;
  const radiusVariation = urgency >= 8 ? 8 : urgency >= 5 ? 5 : 2;
  const radius = baseRadius + radiusVariation;

  // Create elliptical path for more organic motion
  const horizontalRadius = radius;
  const verticalRadius = radius * 0.85; // Slightly flattened for better visual flow

  // More sophisticated path with variable curves based on urgency
  const pathCommands: string[] = [];

  // Start at the rightmost point
  pathCommands.push(`M ${centerX + horizontalRadius} ${centerY}`);

  // Create smooth elliptical curve using cubic bezier curves
  // Top curve
  pathCommands.push(
    `C ${centerX + horizontalRadius} ${centerY - verticalRadius * 0.552}, ${
      centerX + horizontalRadius * 0.552
    } ${centerY - verticalRadius}, ${centerX} ${centerY - verticalRadius}`
  );

  // Left curve
  pathCommands.push(
    `C ${centerX - horizontalRadius * 0.552} ${centerY - verticalRadius}, ${
      centerX - horizontalRadius
    } ${centerY - verticalRadius * 0.552}, ${
      centerX - horizontalRadius
    } ${centerY}`
  );

  // Bottom curve
  pathCommands.push(
    `C ${centerX - horizontalRadius} ${centerY + verticalRadius * 0.552}, ${
      centerX - horizontalRadius * 0.552
    } ${centerY + verticalRadius}, ${centerX} ${centerY + verticalRadius}`
  );

  // Right curve (back to start)
  pathCommands.push(
    `C ${centerX + horizontalRadius * 0.552} ${centerY + verticalRadius}, ${
      centerX + horizontalRadius
    } ${centerY + verticalRadius * 0.552}, ${
      centerX + horizontalRadius
    } ${centerY}`
  );

  // Close the path
  pathCommands.push("Z");

  return pathCommands.join(" ");
}

/**
 * Gets orbital motion configuration based on urgency level
 */
export function getUrgencyMotionConfig(urgency: number = 1) {
  const duration = getUrgencyAnimationDuration(urgency);

  return {
    duration,
    ease: "none",
    repeat: -1,
    // Add slight rotation variation for higher urgency levels
    autoRotate: urgency >= 7,
    // Slight speed variations for more organic feel
    yoyo: false,
  };
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

/**
 * Legacy function for backward compatibility - now returns empty string
 * since we're using orbiting balls instead of borders
 */
export function getUrgencyBorderClasses(urgency: number = 1): string {
  return ""; // No longer used - urgency now uses orbiting balls
}

/**
 * Legacy function for backward compatibility - now returns empty string
 * since we're using orbiting balls instead of glows
 */
export function getUrgencyGlowClasses(urgency: number = 1): string {
  return ""; // No longer used - urgency now uses orbiting balls
}

/**
 * Legacy function for backward compatibility
 */
export function getUrgencyShadowColor(urgency?: number): string {
  return "rgba(0, 0, 0, 0)"; // No longer used - urgency now uses orbiting balls
}

export function getHighestChildUrgency(node: OrgNode): number {
  let maxUrgency = node.urgency || 1;
  if (node.children) {
    for (const child of node.children) {
      maxUrgency = Math.max(maxUrgency, getHighestChildUrgency(child));
    }
  }
  return maxUrgency;
}
