// app/lib/journal.ts

import type {
  JournalEntry,
  JournalEntryWithTasks,
  JournalEntryTask,
} from "../types/journal";
import { supabase } from "./data/supabaseClient";

export async function fetchAllJournalEntries(): Promise<JournalEntry[]> {
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .order("entry_date", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchJournalEntry(
  id: number
): Promise<JournalEntryWithTasks | null> {
  // Fetch the journal entry
  const { data: entry, error: entryError } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .single();

  if (entryError) {
    if (entryError.code === "PGRST116") return null; // Not found
    throw entryError;
  }

  // Fetch only the most recent task activity per org_node_id for this journal entry
  // This query gets the latest activity for each unique task on the entry date
  const { data: tasks, error: tasksError } = await supabase
    .from("journal_entry_tasks")
    .select(
      `
      id,
      journal_entry_id,
      org_node_id,
      action,
      created_at
    `
    )
    .eq("journal_entry_id", id)
    .order("org_node_id", { ascending: true })
    .order("created_at", { ascending: false });

  if (tasksError) throw tasksError;

  // Group by org_node_id and take only the most recent entry for each task
  const uniqueTasks =
    tasks?.reduce((acc: JournalEntryTask[], task) => {
      const existingTaskIndex = acc.findIndex(
        (t) => t.org_node_id === task.org_node_id
      );
      if (existingTaskIndex === -1) {
        acc.push(task);
      }
      return acc;
    }, []) || [];

  return {
    ...entry,
    tasks: uniqueTasks,
  };
}

export async function createJournalEntry(entryData: {
  entry_date?: string;
  editorial_text?: string;
}): Promise<JournalEntry> {
  const { data, error } = await supabase
    .from("journal_entries")
    .insert([entryData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateJournalEntry(
  id: number,
  updates: {
    editorial_text?: string;
    entry_date?: string;
  }
): Promise<JournalEntry> {
  const { data, error } = await supabase
    .from("journal_entries")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteJournalEntry(id: number): Promise<void> {
  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function addJournalEntryTask(taskData: {
  journal_entry_id: number;
  org_node_id: number;
  action: "created" | "edited" | "completed";
}): Promise<JournalEntryTask> {
  const { data, error } = await supabase
    .from("journal_entry_tasks")
    .insert([taskData])
    .select()
    .single();

  if (error) throw error;
  return data;
}
