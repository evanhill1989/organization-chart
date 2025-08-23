// src/types/orgChart.ts
export type OrgNode = {
  id: number;
  name: string;
  type: "top_category" | "category" | "task";
  root_category: string;
  children?: OrgNode[];
  details?: string;
  urgency?: number; // 1-10, defaults to 1
  parent_id?: number;
  tab_name?: string;
};

export interface OrgNodeRow {
  id: number;
  name: string;
  type: string;
  root_category: string;
  details?: string;
  urgency?: number; // 1-10, defaults to 1
  parent_id?: number;
  tab_name?: string;
}

export type OrgChartTabProps = {
  tree: OrgNode;
  tab_name: string;
};
