// src/types/orgChart.ts
export type RecurrenceType = "none" | "daily" | "weekly" | "monthly" | "yearly";

export type OrgNode = {
  id: number;
  name: string;
  type: "top_category" | "category" | "task";
  root_category: string;
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
  tab_name?: string;

  // Recurring task fields
  recurrence_type?: RecurrenceType;
  recurrence_interval?: number; // every X intervals
  recurrence_day_of_week?: number; // 0-6, Sunday=0
  recurrence_day_of_month?: number; // 1-31
  recurrence_end_date?: string; // ISO date string
  is_recurring_template?: boolean;
  recurring_template_id?: number;
};

export interface OrgNodeRow {
  id: number;
  name: string;
  type: string;
  root_category: string;
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
  tab_name?: string;

  //recurring tasks
  recurrence_type?: RecurrenceType;
  recurrence_interval?: number;
  recurrence_day_of_week?: number;
  recurrence_day_of_month?: number;
  recurrence_end_date?: string;
  is_recurring_template?: boolean;
  recurring_template_id?: number;
}

export type OrgChartTabProps = {
  tree: OrgNode;
  tab_name: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  completed?: boolean;
  parentNodeId?: string;
};

export type OrgNodeWithTasks = {
  id: string;
  name: string;
  tasks?: Task[];
  children?: OrgNodeWithTasks[];
};
