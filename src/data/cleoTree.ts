export type OrgNode = {
  name: string;
  type: "category" | "task";
  children?: OrgNode[];
  details?: string;
};

export const cleoTree: OrgNode = {
  name: "Cleo",
  type: "category",
  children: [
    {
      name: "Health",
      type: "category",
      children: [
        { name: "Vet Visits", type: "category", children: [] },
        { name: "Medications", type: "category", children: [] },
      ],
    },
    {
      name: "Activities",
      type: "category",
      children: [
        { name: "Walks", type: "category", children: [] },
        { name: "Playtime", type: "category", children: [] },
      ],
    },
  ],
};
