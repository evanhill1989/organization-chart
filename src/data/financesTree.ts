export type OrgNode = {
  name: string;
  type: "category" | "task";
  children?: OrgNode[];
  details?: string;
};

export const financesTree: OrgNode = {
  name: "Finances",
  type: "category",
  children: [
    {
      name: "Budget",
      type: "category",
      children: [
        { name: "Monthly", type: "category", children: [] },
        { name: "Annual", type: "category", children: [] },
      ],
    },
    {
      name: "Accounts",
      type: "category",
      children: [
        { name: "Checking", type: "category", children: [] },
        { name: "Savings", type: "category", children: [] },
      ],
    },
  ],
};
