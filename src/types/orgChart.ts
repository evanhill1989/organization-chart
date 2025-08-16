// src/types/orgChart.ts
export type OrgNode = {
  name: string;
  type: "category" | "task";
  children?: OrgNode[];
  details?: string;
};

export interface OrgNodeRow {
  id: number;
  name: string;
  type: string;
  details?: string;
  parentId?: number;
  tabName?: string;
}

export type OrgChartTabProps = {
  tree: OrgNode;
  tabName: string;
};
