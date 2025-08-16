import type { OrgNode } from "../OrgChartTab";

export const orphansTree: OrgNode = {
  name: "Orphans",
  type: "category",
  children: [
    {
      name: "Renew passport",
      type: "task",
      details: "Complete renewal application and submit online.",
    },

    {
      name: "Update LinkedIn profile",
      type: "task",
      details: "Add recent job and skills.",
    },
    {
      name: "Backup computer",
      type: "task",
      details: "Run backup and verify files.",
    },
  ],
};
