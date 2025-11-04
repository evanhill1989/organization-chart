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
  console.log("🔍 DEBUG - createRecurringInstance called with task:", {
    name: completedTask.name,
    id: completedTask.id,
    is_completed: completedTask.is_completed,
    is_recurring_template: completedTask.is_recurring_template,
    recurring_template_id: completedTask.recurring_template_id,
    recurrence_type: completedTask.recurrence_type,
    deadline: completedTask.deadline,
    parent_id: completedTask.parent_id, // Added this to debug
  });

  console.log(
    "🔄 createRecurringInstance called for task:",
    completedTask.name
  );

  // Check 1: Only process recurring tasks
  if (
    !completedTask.is_recurring_template &&
    !completedTask.recurring_template_id
  ) {
    console.log("❌ Check 1 FAILED: Task is not recurring", {
      is_recurring_template: completedTask.is_recurring_template,
      recurring_template_id: completedTask.recurring_template_id,
    });
    return null;
  }
  console.log("✅ Check 1 PASSED: Task is recurring");

  // Check 2: Don't create instances if there's no recurrence config
  if (
    completedTask.recurrence_type === "none" ||
    !completedTask.recurrence_type
  ) {
    console.log("❌ Check 2 FAILED: No recurrence type set", {
      recurrence_type: completedTask.recurrence_type,
    });
    return null;
  }
  console.log(
    "✅ Check 2 PASSED: Recurrence type is set:",
    completedTask.recurrence_type
  );

  // Check 3: Don't create if task is not actually completed
  if (!completedTask.is_completed) {
    console.log("❌ Check 3 FAILED: Task is not marked as completed", {
      is_completed: completedTask.is_completed,
    });
    return null;
  }
  console.log("✅ Check 3 PASSED: Task is completed");

  // Check 4: Check if we've already created an instance for this task completion
  console.log("🔍 Check 4: Checking for recent instances...");
  const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();

  // 🔥 FIX: Build the query dynamically to handle undefined parent_id
  let query = supabase
    .from("org_nodes")
    .select("id, name, created_at")
    .eq("name", completedTask.name)
    .eq("user_id", completedTask.user_id) // Filter by user_id
    .eq(
      "recurring_template_id",
      completedTask.is_recurring_template
        ? completedTask.id
        : completedTask.recurring_template_id
    )
    .gte("created_at", oneMinuteAgo);

  // Only add parent_id filter if it's not null/undefined
  if (completedTask.parent_id != null) {
    query = query.eq("parent_id", completedTask.parent_id);
  } else {
    query = query.is("parent_id", null);
  }

  const { data: recentInstances, error: checkError } = await query;

  if (checkError) {
    console.error(
      "❌ Check 4 ERROR: Error checking for recent instances:",
      checkError
    );
    throw checkError;
  }

  console.log("🔍 Check 4 RESULT: Recent instances found:", recentInstances);

  if (recentInstances && recentInstances.length > 0) {
    console.log(
      "❌ Check 4 FAILED: Recent instance already exists, skipping creation"
    );
    return null;
  }
  console.log("✅ Check 4 PASSED: No recent instances found");

  // Check 5: Calculate the next deadline
  console.log("🔍 Check 5: Calculating next deadline...");
  try {
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
    console.log("✅ Check 5 PASSED: Next deadline calculated:", nextDeadline);

    // Check 6: Check if we should create the next instance (not past end date)
    if (
      !shouldCreateNextInstance(nextDeadline, completedTask.recurrence_end_date)
    ) {
      console.log("❌ Check 6 FAILED: Recurrence end date reached", {
        nextDeadline,
        endDate: completedTask.recurrence_end_date,
      });
      return null;
    }
    console.log("✅ Check 6 PASSED: Should create next instance");
    console.log(completedTask, "THE FUCKING COMPLETED TASK!!!");
    console.log(
      completedTask.parent_id,
      "THE FUCKING COMPLETED TASK PARENT_ID!!!!!!!!"
    );
    // Create the next instance
    const newTaskData = {
      name: completedTask.name,
      type: "task",
      details: completedTask.details,
      importance: completedTask.importance,
      deadline: nextDeadline,
      completion_time: completedTask.completion_time,
      unique_days_required: completedTask.unique_days_required,
      parent_id: completedTask.parent_id || null, // 🔥 Ensure this is preserved
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

      // Auth: inherit user_id from the completed task
      user_id: completedTask.user_id,
    };

    console.log("🔍 DEBUG - newTaskData before insertion:", newTaskData);
    console.log("🔄 Creating next recurring instance:", {
      originalTask: completedTask.name,
      newDeadline: nextDeadline,
      recurrenceType: completedTask.recurrence_type,
      newTaskData,
    });

    const { data: newTask, error } = await supabase
      .from("org_nodes")
      .insert([newTaskData])
      .select()
      .single();

    if (error) {
      console.error("❌ Database error creating recurring instance:", error);
      throw error;
    }

    console.log("✅ Successfully created recurring instance:", newTask);
    return newTask as OrgNodeRow;
  } catch (error) {
    console.error("❌ Failed to create recurring instance:", error);
    throw error;
  }
}
