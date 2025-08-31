// app/types/journal.ts
export interface JournalEntry {
  id: number;
  entry_date: string; // ISO date string
  editorial_text?: string;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

export interface JournalEntryTask {
  id: number;
  journal_entry_id: number;
  org_node_id: number;
  action: "created" | "edited" | "completed";
  created_at: string; // ISO datetime string
}

export interface JournalEntryWithTasks extends JournalEntry {
  tasks?: JournalEntryTask[];
}
