export type OrgNode = {
  name: string;
  type: "category" | "task";
  children?: OrgNode[];
  details?: string;
};

export const socialTree: OrgNode = {
  name: "Social",
  type: "category",
  children: [
    {
      name: "Friends",
      type: "category",
      children: [
        { name: "Events", type: "category", children: [] },
        { name: "Trips", type: "category", children: [] },
      ],
    },
    {
      name: "Family",
      type: "category",
      children: [
        { name: "Reunions", type: "category", children: [] },
        { name: "Calls", type: "category", children: [] },
      ],
    },
  ],
};
