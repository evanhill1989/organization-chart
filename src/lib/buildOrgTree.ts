// src/lib/buildOrgTree.ts

import type { OrgNode, OrgNodeRow } from "../types/orgChart";

export function buildOrgTree(flatNodes: OrgNodeRow[]): Record<string, OrgNode> {
  const nodeMap = new Map<number, OrgNode>();
  const roots: Record<string, OrgNode> = {};

  flatNodes.forEach((row) => {
    nodeMap.set(row.id, {
      name: row.name,
      type: row.type as "category" | "task",
      details: row.details ?? undefined,
      children: [],
    });
  });

  flatNodes.forEach((row) => {
    const node = nodeMap.get(row.id)!;
    if (row.parentId) {
      const parent = nodeMap.get(row.parentId);
      if (parent) parent.children!.push(node);
    } else {
      roots[row.tabName ?? "default"] = node;
    }
  });

  return roots;
}
