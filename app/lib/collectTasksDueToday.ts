import { OrgNode, OrgNodeRow } from "../types/orgChart";

/**
 * Collects all tasks that are due today or overdue from multiple org tree nodes.
 * This function traverses all trees and finds tasks with deadlines <= today.
 */
export function collectTasksDueToday(nodes: OrgNode[]): OrgNodeRow[] {
  const todayISO = new Date().toISOString().split("T")[0];
  const todayDate = new Date(todayISO);

  const tasks: OrgNodeRow[] = [];

  const walkTree = (node: OrgNode) => {
    // If this is an incomplete task with a deadline
    if (node.type === "task" && node.deadline && !node.is_completed) {
      const taskDeadline = new Date(node.deadline);

      // Include tasks due today OR overdue (deadline <= today)
      if (taskDeadline <= todayDate) {
        tasks.push(node as OrgNodeRow);
      }
    }

    // Recursively check all children
    if (node.children) {
      node.children.forEach(walkTree);
    }
  };

  // Process all root nodes
  nodes.forEach(walkTree);

  console.log(
    `Collected ${tasks.length} tasks due today/overdue from ${nodes.length} org trees`
  );
  return tasks;
}
