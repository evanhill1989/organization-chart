export type OrgNode = {
  name: string;
  type: "category" | "task";
  children?: OrgNode[];
  details?: string;
};

export const jobTree: OrgNode = {
  name: "Job",
  type: "category",
  children: [
    {
      name: "Projects",
      type: "category",
      children: [
        { name: "Current", type: "category", children: [] },
        { name: "Completed", type: "category", children: [] },
      ],
    },
    {
      name: "Meetings",
      type: "category",
      children: [
        { name: "Weekly Standup", type: "category", children: [] },
        { name: "Client Calls", type: "category", children: [] },
      ],
    },
  ],
};
