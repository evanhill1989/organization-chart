// app/lib/recurrenceUtils.ts
import type { RecurrenceType } from "../types/orgChart";

export interface RecurrenceConfig {
  type: RecurrenceType;
  interval: number;
  dayOfWeek?: number; // 0-6, Sunday=0
  dayOfMonth?: number; // 1-31
  endDate?: string;
}

/**
 * Calculate the next deadline for a recurring task based on the previous deadline
 */
export function calculateNextDeadline(
  previousDeadline: string,
  config: RecurrenceConfig
): string {
  const prevDate = new Date(previousDeadline);
  const nextDate = new Date(prevDate);

  switch (config.type) {
    case "minutely":
      nextDate.setMinutes(nextDate.getMinutes() + config.interval);
      break;

    case "daily":
      nextDate.setDate(nextDate.getDate() + config.interval);
      break;

    case "weekly":
      if (config.dayOfWeek !== undefined) {
        const daysUntilTarget = (config.dayOfWeek - nextDate.getDay() + 7) % 7;
        nextDate.setDate(
          nextDate.getDate() + daysUntilTarget + (config.interval - 1) * 7
        );
      } else {
        nextDate.setDate(nextDate.getDate() + config.interval * 7);
      }
      break;

    case "monthly":
      if (config.dayOfMonth !== undefined) {
        nextDate.setMonth(nextDate.getMonth() + config.interval);
        nextDate.setDate(
          Math.min(config.dayOfMonth, getLastDayOfMonth(nextDate))
        );
      } else {
        const targetDay = prevDate.getDate();
        nextDate.setMonth(nextDate.getMonth() + config.interval);
        nextDate.setDate(Math.min(targetDay, getLastDayOfMonth(nextDate)));
      }
      break;

    case "yearly":
      nextDate.setFullYear(nextDate.getFullYear() + config.interval);
      break;

    default:
      throw new Error(`Unsupported recurrence type: ${config.type}`);
  }

  return nextDate.toISOString().split("T")[0];
}

/**
 * Check if we should create the next recurring instance
 */
export function shouldCreateNextInstance(
  nextDeadline: string,
  endDate?: string
): boolean {
  if (!endDate) return true;

  const next = new Date(nextDeadline);
  const end = new Date(endDate);

  return next <= end;
}

/**
 * Get the last day of a month (handles leap years)
 */
function getLastDayOfMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/**
 * Generate a human-readable description of the recurrence pattern
 */
export function getRecurrenceDescription(config: RecurrenceConfig): string {
  const { type, interval, dayOfWeek, dayOfMonth } = config;
  const weeklyBase = interval === 1 ? "Weekly" : `Every ${interval} weeks`;
  const monthlyBase = interval === 1 ? "Monthly" : `Every ${interval} months`;

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  switch (type) {
    case "minutely":
      return interval === 1 ? "Every minute" : `Every ${interval} minutes`;

    case "daily":
      return interval === 1 ? "Daily" : `Every ${interval} days`;

    case "weekly":
      if (dayOfWeek !== undefined) {
        return `${weeklyBase} on ${dayNames[dayOfWeek]}`;
      }
      return weeklyBase;

    case "monthly":
      if (dayOfMonth !== undefined) {
        const suffix = getOrdinalSuffix(dayOfMonth);
        return `${monthlyBase} on the ${dayOfMonth}${suffix}`;
      }
      return monthlyBase;

    case "yearly":
      return interval === 1 ? "Yearly" : `Every ${interval} years`;

    default:
      return "No recurrence";
  }
}

function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
