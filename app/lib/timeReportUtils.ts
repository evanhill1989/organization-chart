// src/lib/timeReportUtils.ts
import type { OrgNodeRow } from "../types/orgChart";

export interface TaskWithDeadlineInfo extends OrgNodeRow {
  daysUntilDeadline: number;
  isOverdue: boolean;
  isPartialTime?: boolean;
  partialRequiredTime?: number;
  effectiveRequiredTime?: number;
}

export type ImportanceFilter =
  | "1"
  | "2-4"
  | "5-6"
  | "7-9"
  | "10"
  | "All levels";

export interface TimeReportData {
  totalRequiredTime: number;
  totalAvailableTime: number;
  taskCount: number;
  ratio: number;
  tasks: TaskWithDeadlineInfo[];
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Calculate date range based on filter type and custom date
 */
export function getDateRange(
  dateFilter: string,
  customEndDate: string
): DateRange {
  const today = new Date();
  const endDate =
    dateFilter === "28-days"
      ? new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000)
      : customEndDate
      ? new Date(customEndDate)
      : new Date(today.getTime() + 28 * 24 * 60 * 60 * 1000);

  return { startDate: today, endDate };
}

/**
 * Check if a task's importance matches the selected filter
 */
export function matchesImportanceFilter(
  importance: number | undefined,
  importanceFilter: ImportanceFilter
): boolean {
  if (importanceFilter === "All levels") return true;
  const imp = importance || 1;

  const filterMap: Record<ImportanceFilter, (imp: number) => boolean> = {
    "1": (imp) => imp === 1,
    "2-4": (imp) => imp >= 2 && imp <= 4,
    "5-6": (imp) => imp >= 5 && imp <= 6,
    "7-9": (imp) => imp >= 7 && imp <= 9,
    "10": (imp) => imp === 10,
    "All levels": () => true,
  };

  return filterMap[importanceFilter](imp);
}

/**
 * Calculate available time based on date range (25 hours per week baseline)
 */
export function calculateAvailableTime(startDate: Date, endDate: Date): number {
  const timeDiff = endDate.getTime() - startDate.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  const weeksDiff = daysDiff / 7;
  return weeksDiff * 25; // 25 hours per week baseline
}

/**
 * Calculate days until a deadline
 */
export function getDaysUntilDeadline(deadline: string): number {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const timeDiff = deadlineDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

/**
 * Get color class for utilization ratio
 */
export function getRatioColor(ratio: number): string {
  if (ratio <= 0.5) return "text-green-600";
  if (ratio <= 0.8) return "text-yellow-600";
  if (ratio <= 1.0) return "text-orange-600";
  return "text-red-600";
}

/**
 * Get status text for utilization ratio
 */
export function getRatioStatus(ratio: number): string {
  if (ratio <= 0.5) return "Light load";
  if (ratio <= 0.8) return "Moderate load";
  if (ratio <= 1.0) return "Heavy load";
  return "Overloaded";
}

/**
 * Format date for HTML date input
 */
export function formatDateForInput(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Enrich tasks with deadline information and sort by deadline proximity
 */
export function enrichTasksWithDeadlineInfo(
  tasks: OrgNodeRow[]
): TaskWithDeadlineInfo[] {
  return tasks
    .map((task) => ({
      ...task,
      daysUntilDeadline: task.deadline
        ? getDaysUntilDeadline(task.deadline)
        : 0,
      isOverdue: task.deadline
        ? getDaysUntilDeadline(task.deadline) < 0
        : false,
    }))
    .sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline);
}

/**
 * Calculate required time for tasks, including partial time for long-term tasks
 */
export function calculateRequiredTime(
  tasks: OrgNodeRow[],
  timeWindowDays: number,
  endDate: Date
): {
  totalRequiredTime: number;
  tasksInWindow: OrgNodeRow[];
  tasksWithPartialTime: {
    task: OrgNodeRow;
    partialTime: number;
    totalTime: number;
  }[];
} {
  let totalRequiredTime = 0;
  const tasksInWindow: OrgNodeRow[] = [];
  const tasksWithPartialTime: {
    task: OrgNodeRow;
    partialTime: number;
    totalTime: number;
  }[] = [];

  tasks.forEach((task) => {
    if (!task.deadline || !task.completion_time) return;

    const taskDeadline = new Date(task.deadline);
    const today = new Date();
    const daysUntilDeadline = Math.ceil(
      (taskDeadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (taskDeadline <= endDate) {
      // Task deadline is within or at the end of the time window - use full required time
      totalRequiredTime += task.completion_time;
      tasksInWindow.push(task);
    } else {
      // Task deadline is beyond the time window - calculate partial required time
      const dailyRequiredRate = task.completion_time / daysUntilDeadline;
      const partialRequiredTime = dailyRequiredRate * timeWindowDays;
      totalRequiredTime += partialRequiredTime;

      // Track this for display purposes
      tasksWithPartialTime.push({
        task,
        partialTime: partialRequiredTime,
        totalTime: task.completion_time,
      });
    }
  });

  return {
    totalRequiredTime,
    tasksInWindow,
    tasksWithPartialTime,
  };
}

/**
 * Process tasks to include partial time information for display
 */
export function processTasksWithPartialInfo(
  tasksInWindow: OrgNodeRow[],
  tasksWithPartialTime: {
    task: OrgNodeRow;
    partialTime: number;
    totalTime: number;
  }[]
): TaskWithDeadlineInfo[] {
  // Combine tasks in window with partial tasks
  const allRelevantTasks = [
    ...tasksInWindow,
    ...tasksWithPartialTime.map((item) => item.task),
  ];

  const enrichedTasks = enrichTasksWithDeadlineInfo(allRelevantTasks);

  // Add partial time info to enriched tasks
  return enrichedTasks.map((task) => {
    const partialInfo = tasksWithPartialTime.find(
      (item) => item.task.id === task.id
    );
    return {
      ...task,
      isPartialTime: !!partialInfo,
      partialRequiredTime: partialInfo?.partialTime,
      effectiveRequiredTime: partialInfo
        ? partialInfo.partialTime
        : task.completion_time || 0,
    };
  });
}
