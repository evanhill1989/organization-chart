// app/lib/createRecurringInstance.ts
import { supabase } from "./data/supabaseClient";
import type { OrgNodeRow } from "../types/orgChart";
import {
  calculateNextDeadline,
  shouldCreateNextInstance,
} from "./recurrenceUtils";

export async function createRecurringInstance(
  completedTask: OrgNodeRow
): Promise<OrgNodeRow | null> {
  // Only process recurring tasks
  if (
    !completedTask.is_recurring_template &&
    !completedTask.recurring_template_id
  ) {
    return null;
  }

  // Don't create instances if there's no recurrence config
  if (
    completedTask.recurrence_type === "none" ||
    !completedTask.recurrence_type
  ) {
    return null;
  }

  // Calculate the next deadline
  const nextDeadline = calculateNextDeadline(
    completedTask.deadline || new Date().toISOString().split("T")[0],
    {
      type: completedTask.recurrence_type,
      interval: completedTask.recurrence_interval || 1,
      dayOfWeek: completedTask.recurrence_day_of_week,
      dayOfMonth: completedTask.recurrence_day_of_month,
      endDate: completedTask.recurrence_end_date,
    }
  );

  // Check if we should create the next instance (not past end date)
  if (
    !shouldCreateNextInstance(nextDeadline, completedTask.recurrence_end_date)
  ) {
    console.log("Recurrence end date reached, not creating next instance");
    return null;
  }

  // Create the next instance
  const newTaskData = {
    name: completedTask.name,
    type: "task",
    details: completedTask.details,
    importance: completedTask.importance,
    deadline: nextDeadline,
    completion_time: completedTask.completion_time,
    unique_days_required: completedTask.unique_days_required,
    parent_id: completedTask.parent_id,
    tab_name: completedTask.tab_name,
    root_category: completedTask.root_category,

    // Copy recurrence settings
    recurrence_type: completedTask.recurrence_type,
    recurrence_interval: completedTask.recurrence_interval,
    recurrence_day_of_week: completedTask.recurrence_day_of_week,
    recurrence_day_of_month: completedTask.recurrence_day_of_month,
    recurrence_end_date: completedTask.recurrence_end_date,
    is_recurring_template: false, // New instance is not a template
    recurring_template_id: completedTask.is_recurring_template
      ? completedTask.id
      : completedTask.recurring_template_id,
  };

  console.log("🔄 Creating next recurring instance:", {
    originalTask: completedTask.name,
    newDeadline: nextDeadline,
    recurrenceType: completedTask.recurrence_type,
  });

  try {
    const { data: newTask, error } = await supabase
      .from("org_nodes")
      .insert([newTaskData])
      .select()
      .single();

    if (error) throw error;

    console.log("✅ Successfully created recurring instance:", newTask);
    return newTask as OrgNodeRow;
  } catch (error) {
    console.error("❌ Failed to create recurring instance:", error);
    throw error;
  }
}
