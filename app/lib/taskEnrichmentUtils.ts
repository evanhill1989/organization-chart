// app/lib/taskEnrichmentUtils.ts
import type { OrgNodeRow } from "../types/orgChart";
import { calculateUrgencyLevel } from "./urgencyUtils";

export interface EnrichedTask extends OrgNodeRow {
  urgencyLevel: number;
  daysUntilDeadline: number;
  isOverdue: boolean;
}

// Enrich tasks with urgency and deadline calculations
export function enrichTasksWithUrgencyData(
  tasks: OrgNodeRow[]
): EnrichedTask[] {
  return tasks.map((task) => ({
    ...task,
    urgencyLevel: calculateUrgencyLevel(
      task.deadline,
      task.completion_time,
      task.unique_days_required
    ),
    daysUntilDeadline: task.deadline ? getDaysUntilDeadline(task.deadline) : 0,
    isOverdue: task.deadline ? getDaysUntilDeadline(task.deadline) < 0 : false,
  }));
}

// For tasks due today specifically
export function enrichTasksDueToday(tasks: OrgNodeRow[]): EnrichedTask[] {
  return tasks.map((task) => ({
    ...task,
    urgencyLevel: calculateUrgencyLevel(
      task.deadline,
      task.completion_time,
      task.unique_days_required
    ),
    daysUntilDeadline: 0, // All tasks are due today
    isOverdue: false, // None are overdue if they're due today
  }));
}

// Helper function to calculate days until deadline
function getDaysUntilDeadline(deadline: string): number {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const timeDiff = deadlineDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

// Sorting utilities
export const TaskSorters = {
  byUrgencyThenImportance: (a: EnrichedTask, b: EnrichedTask) => {
    if (b.urgencyLevel !== a.urgencyLevel) {
      return b.urgencyLevel - a.urgencyLevel;
    }
    return (b.importance || 1) - (a.importance || 1);
  },

  byImportanceThenUrgency: (a: EnrichedTask, b: EnrichedTask) => {
    if ((b.importance || 1) !== (a.importance || 1)) {
      return (b.importance || 1) - (a.importance || 1);
    }
    return b.urgencyLevel - a.urgencyLevel;
  },

  byDeadlineProximity: (a: EnrichedTask, b: EnrichedTask) => {
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    if (a.isOverdue && b.isOverdue) {
      return b.daysUntilDeadline - a.daysUntilDeadline; // Most overdue first
    }
    return a.daysUntilDeadline - b.daysUntilDeadline; // Closest deadline first
  },
};
