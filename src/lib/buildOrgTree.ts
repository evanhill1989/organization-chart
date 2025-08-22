// src/lib/buildOrgTree.ts

import type { OrgNode, OrgNodeRow } from "../types/orgChart";

export function buildOrgTree(flatNodes: OrgNodeRow[]): Record<string, OrgNode> {
  const nodeMap = new Map<number, OrgNode>();
  const roots: Record<string, OrgNode> = {};

  flatNodes.forEach((row) => {
    nodeMap.set(row.id, {
      id: row.id,
      name: row.name,
      type: row.type as "top_category" | "category" | "task",
      details: row.details ?? undefined,
      children: [],
      tab_name: row.tab_name,
      root_category: row.root_category,
    });
  });

  flatNodes.forEach((row) => {
    const node = nodeMap.get(row.id)!;
    if (row.parent_id) {
      const parent = nodeMap.get(row.parent_id);
      if (parent) parent.children!.push(node);
    } else {
      roots[row.root_category ?? "default"] = node; // <-- FIXED!
    }
  });

  return roots;
}
