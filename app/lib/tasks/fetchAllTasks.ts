// app/lib/tasks/fetchAllTasks.ts
import { supabase } from "../data/supabaseClient";
import type { OrgNodeRow } from "../../types/orgChart";
import { enrichTasksWithDeadlineInfo } from "../timeReportUtils";
import { calculateUrgencyLevel } from "../urgencyUtils";

export interface CompleteTaskData extends OrgNodeRow {
  type: "top_category" | "category" | "task";
  daysUntilDeadline: number;
  isOverdue: boolean;
  urgencyLevel: number;
  category_name: string;
}

/**
 * Fetch all incomplete tasks with deadlines, enriched with deadline info
 * and urgency level, sorted by overdue status and proximity.
 */
export async function fetchAllTasks(): Promise<CompleteTaskData[]> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data: tasks, error: fetchError } = await supabase
    .from("org_nodes")
    .select("*, categories(name)")
    .eq("type", "task")
    .eq("user_id", user.id) // Filter by user_id
    .not("deadline", "is", null)
    .not("is_completed", "is", true); // ✅ Already filtering out completed tasks

  if (fetchError) throw fetchError;

  // Map to include category_name at top level
  const tasksWithCategoryName = (tasks || []).map((task: OrgNodeRow & { categories?: { name: string } | null }) => ({
    ...task,
    category_name: task.categories?.name || "Unknown",
    categories: undefined,
  })) as OrgNodeRow[];

  // Enrich with deadline info and urgency levels
  const enrichedTasks = enrichTasksWithDeadlineInfo(tasksWithCategoryName).map((task) => ({
    ...task,
    urgencyLevel: calculateUrgencyLevel(
      task.deadline,
      task.completion_time,
      task.unique_days_required,
    ),
  })) as CompleteTaskData[];

  // Sort by deadline (overdue first, then by proximity)
  return enrichedTasks.sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    if (a.isOverdue && b.isOverdue) {
      return b.daysUntilDeadline - a.daysUntilDeadline; // Most overdue first
    }
    return a.daysUntilDeadline - b.daysUntilDeadline; // Closest deadline first
  });
}
