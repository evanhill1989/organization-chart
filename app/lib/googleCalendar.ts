import type { OrgNodeRow } from "~/types/orgChart";
import { calculateUrgencyLevel } from "./urgencyUtils";

/**
 * Generates a Google Calendar event creation URL with pre-filled task details.
 * Opens Google Calendar in a new tab where user can set the date/time and save.
 *
 * Note: URL parameters don't support custom reminders - user must add them manually.
 */
export function generateGoogleCalendarUrl(task: OrgNodeRow): string {
  const baseUrl = "https://calendar.google.com/calendar/render";
  const params = new URLSearchParams({ action: "TEMPLATE" });

  // Event title
  params.append("text", task.name);

  // Build detailed description
  const descriptionParts: string[] = [];

  // Add importance
  if (task.importance) {
    descriptionParts.push(`⭐ Importance: ${task.importance}/10`);
  }

  // Add urgency if calculable
  if (
    task.deadline &&
    task.completion_time !== undefined &&
    task.unique_days_required !== undefined
  ) {
    const urgencyLevel = calculateUrgencyLevel(
      task.deadline,
      task.completion_time,
      task.unique_days_required,
    );
    descriptionParts.push(`🔥 Urgency: ${urgencyLevel}/10`);
  }

  // Add reminder instructions
  // descriptionParts.push(
  //   '',
  //   '⏰ RECOMMENDED REMINDERS:',
  //   '• Email: 24 hours before',
  //   '• Notification: 36 hours before',
  //   '• Notification: 8 hours before',
  //   '• Notification: 47 minutes before'
  // );

  // Add task details
  if (task.details) {
    descriptionParts.push("", "📋 DETAILS:", task.details);
  }

  // Add completion time estimate
  if (task.completion_time) {
    descriptionParts.push(
      "",
      `⏱️ Estimated time: ${task.completion_time} minutes`,
    );
  }

  params.append("details", descriptionParts.join("\n"));

  return `${baseUrl}?${params.toString()}`;
}
