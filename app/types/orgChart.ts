// src/types/orgChart.ts
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
}

export type OrgChartTabProps = {
  tree: OrgNode;
  tab_name: string;
};
