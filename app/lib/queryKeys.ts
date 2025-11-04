// app/lib/queryKeys.ts
export const QUERY_KEYS = {
  // Org tree keys
  orgTree: (category: string) => ["orgTree", category] as const,
  allOrgTrees: () => ["orgTree"] as const,

  // Task keys
  task: (id: number) => ["task", id] as const,
  allTasks: () => ["allTasks"] as const,
  recentTasks: () => ["recentTasks"] as const,

  // Urgency/importance keys
  urgentTaskCount: (tab?: string) =>
    tab ? (["urgentTaskCount", tab] as const) : (["urgentTaskCount"] as const),
  criticalTaskCount: (tab: string) => ["criticalTaskCount", tab] as const,

  // Category keys
  category: (id: number) => ["category", id] as const,
  allCategories: () => ["categories"] as const,

  // Journal keys
  journalEntry: (id: string) => ["journalEntry", id] as const,
} as const;
