// app/hooks/useToggleOpen.ts
import { useCallback } from "react";
import type { OrgNode } from "../types/orgChart";
import { findSiblingPaths } from "../lib/findSiblingPaths";

export function useToggleOpen(
  tree: OrgNode,
  tabName: string,
  setOpenMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
) {
  return useCallback(
    (path: string) => {
      setOpenMap((prev) => {
        const newOpenMap = { ...prev };
        const isCurrentlyOpen = prev[path];

        if (isCurrentlyOpen) {
          // Close this node + descendants
          const pathsToClose = Object.keys(prev).filter(
            (p) => p.startsWith(path + "/") || p === path
          );
          pathsToClose.forEach((p) => {
            newOpenMap[p] = false;
          });
        } else {
          // Close siblings + descendants
          const siblingPaths = findSiblingPaths(tree, path, "", tabName);
          siblingPaths.forEach((siblingPath) => {
            if (siblingPath !== path) {
              newOpenMap[siblingPath] = false;
              Object.keys(prev).forEach((p) => {
                if (p.startsWith(siblingPath + "/")) {
                  newOpenMap[p] = false;
                }
              });
            }
          });

          // Open this node
          newOpenMap[path] = true;
        }

        return newOpenMap;
      });
    },
    [tree, tabName, setOpenMap]
  );
}
