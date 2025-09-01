// app/lib/findSiblingPaths.ts
import type { OrgNode } from "../types/orgChart";

/**
 * Finds all sibling node paths at the same level as a target path.
 * Includes the target itself in the returned list.
 */
export function findSiblingPaths(
  tree: OrgNode,
  targetPath: string,
  currentPath = "",
  tabName: string
): string[] {
  // Build current path for this node
  const nodePath = currentPath ? `${currentPath}/${tree.name}` : `/${tabName}`;

  // If we found the parent of our target, return all its children's paths
  if (tree.children) {
    for (const child of tree.children) {
      const childPath = `${nodePath}/${child.name}`;
      if (childPath === targetPath) {
        // Found our target, return all sibling paths (including target)
        return tree.children.map((sibling) => `${nodePath}/${sibling.name}`);
      }
    }

    // Recursively search in children
    for (const child of tree.children) {
      const siblingPaths = findSiblingPaths(
        child,
        targetPath,
        nodePath,
        tabName
      );
      if (siblingPaths.length > 0) {
        return siblingPaths;
      }
    }
  }

  return [];
}
