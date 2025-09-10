// app/lib/buildOrgTree.ts
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
      importance: row.importance ?? (row.type === "task" ? 1 : undefined),
      deadline: row.deadline ?? undefined,
      completion_time: row.completion_time ?? undefined,
      unique_days_required: row.unique_days_required ?? undefined,
      is_completed: row.is_completed ?? undefined,
      completed_at: row.completed_at ?? undefined,
      completion_comment: row.completion_comment ?? undefined,
      children: [],
      tab_name: row.tab_name,
      root_category: row.root_category,
      parent_id: row.parent_id, // 🔥 THE MISSING LINE!

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

  flatNodes.forEach((row) => {
    const node = nodeMap.get(row.id)!;
    if (row.parent_id) {
      const parent = nodeMap.get(row.parent_id);
      if (parent) parent.children!.push(node);
    } else {
      roots[row.root_category ?? "default"] = node;
    }
  });

  return roots;
}
