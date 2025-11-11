// app/lib/buildOrgTree.ts
import type { OrgNode, OrgNodeRow } from "../types/orgChart";

export function buildOrgTree(flatNodes: OrgNodeRow[], categoryName: string): OrgNode {
  const nodeMap = new Map<number, OrgNode>();
  const topLevelNodes: OrgNode[] = [];

  // First pass: create all nodes
  flatNodes.forEach((row) => {
    nodeMap.set(row.id, {
      id: row.id,
      name: row.name,
      type: row.type as "top_category" | "category" | "task",
      details: row.details ?? undefined,
      importance: row.importance ?? (row.type === "task" ? 1 : undefined),
      deadline: row.deadline ?? undefined,
      completion_time: row.completion_time ?? undefined,
      unique_days_required: row.unique_days_required ?? undefined,
      is_completed: row.is_completed ?? undefined,
      completed_at: row.completed_at ?? undefined,
      completion_comment: row.completion_comment ?? undefined,
      children: [],
      parent_id: row.parent_id,
      category_id: row.category_id,

      // Add recurrence fields
      recurrence_type: row.recurrence_type ?? undefined,
      recurrence_interval: row.recurrence_interval ?? undefined,
      recurrence_day_of_week: row.recurrence_day_of_week ?? undefined,
      recurrence_day_of_month: row.recurrence_day_of_month ?? undefined,
      recurrence_end_date: row.recurrence_end_date ?? undefined,
      is_recurring_template: row.is_recurring_template ?? undefined,
      recurring_template_id: row.recurring_template_id ?? undefined,
    });
  });

  // Second pass: build parent-child relationships
  flatNodes.forEach((row) => {
    const node = nodeMap.get(row.id)!;
    if (row.parent_id) {
      const parent = nodeMap.get(row.parent_id);
      if (parent) {
        parent.children!.push(node);
      }
    } else {
      // No parent means this is a top-level node
      topLevelNodes.push(node);
    }
  });

  // Return synthetic root node for the category
  return {
    id: 0,
    name: categoryName,
    type: "category" as const,
    category_id: flatNodes[0]?.category_id || "",
    children: topLevelNodes,
  };
}
