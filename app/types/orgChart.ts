// src/types/orgChart.ts

// =====================================================
// Category Types (Phase 2 - Dynamic Categories)
// =====================================================

export interface Category {
  id: string; // UUID
  user_id: string; // UUID
  name: string;
  description?: string;
  color: string; // Hex color code (e.g., '#3B82F6')
  order_index: number;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  archived?: boolean; // Soft delete flag
  archived_at?: string; // ISO timestamp of when archived
}

// =====================================================
// Recurrence Types
// =====================================================

export type RecurrenceType =
  | "none"
  | "minutely"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly";

export type OrgNode = {
  id: number;
  name: string;
  type: "top_category" | "category" | "task";
  /**
   * @deprecated Legacy field - use category_id instead. Will be removed in future version.
   * Kept temporarily for backward compatibility during migration.
   */
  root_category?: string;
  /** New UUID reference to categories table (required after migration_04) */
  category_id?: string;
  children?: OrgNode[];
  details?: string;
  // Removed urgency as it's now calculated
  importance?: number; // 1-10, defaults to 1
  // New deadline-related fields
  deadline?: string; // ISO date string
  completion_time?: number; // estimated total hours to complete
  unique_days_required?: number; // estimated unique days of work required
  // Completion tracking fields
  is_completed?: boolean;
  completed_at?: string; // ISO date string
  completion_comment?: string;
  parent_id?: number;
  /**
   * @deprecated Legacy field - use category_id instead. Will be removed in future version.
   */
  tab_name?: string;
  last_touched_at?: string;

  // Recurring task fields
  recurrence_type?: RecurrenceType;
  recurrence_interval?: number; // every X intervals
  recurrence_day_of_week?: number; // 0-6, Sunday=0
  recurrence_day_of_month?: number; // 1-31
  recurrence_end_date?: string; // ISO date string
  is_recurring_template?: boolean;
  recurring_template_id?: number;

  // Auth: user ownership
  user_id?: string;
};

export interface OrgNodeRow {
  id: number;
  name: string;
  type: string;
  /**
   * @deprecated Legacy field - use category_id instead. Will be removed in future version.
   * Kept temporarily for backward compatibility during migration.
   */
  root_category?: string;
  /** New UUID reference to categories table (required after migration_04) */
  category_id?: string;
  details?: string;
  // Removed urgency as it's now calculated
  importance?: number; // 1-10, defaults to 1
  // New deadline-related fields
  deadline?: string; // ISO date string
  completion_time?: number; // estimated total hours to complete
  unique_days_required?: number; // estimated unique days of work required
  // Completion tracking fields
  is_completed?: boolean;
  completed_at?: string; // ISO date string
  completion_comment?: string;
  parent_id?: number;
  /**
   * @deprecated Legacy field - use category_id instead. Will be removed in future version.
   */
  tab_name?: string;
  last_touched_at?: string;

  //recurring tasks
  recurrence_type?: RecurrenceType;
  recurrence_interval?: number;
  recurrence_day_of_week?: number;
  recurrence_day_of_month?: number;
  recurrence_end_date?: string;
  is_recurring_template?: boolean;
  recurring_template_id?: number;

  // Auth: user ownership
  user_id: string;
}

export type OrgChartRootProps = {
  tree: OrgNode;
  tab_name: string;
};

// export type Task = {
//   id: string;
//   title: string;
//   description?: string;
//   due_date?: string;
//   completed?: boolean;
//   parentNodeId?: string;
// };

export interface Task {
  id: number;
  name: string;
  details?: string;
  type: "task"; // (category handled elsewhere)
  importance: number;
  deadline?: string; // ISO date
  completion_time: number; // hours
  unique_days_required: number;

  // Completion fields
  is_completed: boolean;
  completed_at?: string;
  completion_comment?: string;

  // Recurrence
  recurrence_type: "none" | "daily" | "weekly" | "monthly" | "yearly";
  recurrence_interval?: number;
  recurrence_day_of_week?: number;
  recurrence_day_of_month?: number;
  recurrence_end_date?: string;
  is_recurring_template: boolean;

  // Category linkage
  /**
   * @deprecated Legacy field - use category_id instead. Will be removed in future version.
   */
  root_category?: string;
  /** New UUID reference to categories table (required after migration_04) */
  category_id?: string;
  parent_id?: number;

  // Auth: user ownership
  user_id: string;
}

export type OrgNodeWithTasks = {
  id: string;
  name: string;
  tasks?: Task[];
  children?: OrgNodeWithTasks[];
};
