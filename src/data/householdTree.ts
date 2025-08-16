export type OrgNode = {
  name: string;
  type: "category" | "task";
  children?: OrgNode[];
  details?: string;
};

export const householdTree: OrgNode = {
  name: "Household",
  type: "category",
  children: [
    {
      name: "Organization",
      type: "category",
      children: [
        { name: "Calendar", type: "category", children: [] },
        { name: "Contacts", type: "category", children: [] },
      ],
    },
    {
      name: "Maintenance",
      type: "category",
      children: [
        { name: "Schedule", type: "category", children: [] },
        { name: "Supplies", type: "category", children: [] },
      ],
    },
    {
      name: "Repair",
      type: "category",
      children: [
        {
          name: "Plumbing",
          type: "category",
          children: [
            {
              name: "regrout tub",
              type: "task",
              details: "get grout",
            },
            {
              name: "upstairs toilet",
              type: "task",
              details: "new fill valve",
            },
          ],
        },
        { name: "Electrical", type: "category", children: [] },
      ],
    },
    {
      name: "Improvement",
      type: "category",
      children: [
        { name: "Remodel", type: "category", children: [] },
        {
          name: "Decor",
          type: "category",
          children: [
            {
              name: "New Couch",
              type: "task",
              details: "Research, purchase, and set up a new couch.",
            },
          ],
        },
      ],
    },
    {
      name: "Yard",
      type: "category",
      children: [],
    },
  ],
};
