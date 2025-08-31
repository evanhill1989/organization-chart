// app/routes/journal/entry.$entryId.tsx - SPA version (no loader)
import { useParams, Link } from "react-router";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { fetchJournalEntry } from "../../lib/journal";
import type { JournalEntryWithTasks } from "../../types/journal";
import { useEffect, useState } from "react";
import { useEditJournal } from "../../hooks/useEditJournal";

const queryClient = new QueryClient();

export default function JournalEntry() {
  return (
    <QueryClientProvider client={queryClient}>
      <JournalEntryContent />
    </QueryClientProvider>
  );
}

function JournalEntryContent() {
  const { entryId } = useParams();

  const {
    data: entry,
    isLoading,
    error,
  } = useQuery<JournalEntryWithTasks | null>({
    queryKey: ["journalEntry", entryId],
    queryFn: () => fetchJournalEntry(Number(entryId)),
    enabled: !!entryId && !isNaN(Number(entryId)),
  });

  const [editorialText, setEditorialText] = useState("");
  const editJournalMutation = useEditJournal();

  // Initialize text from entry when it loads
  useEffect(() => {
    if (entry) {
      setEditorialText(entry.editorial_text ?? "");
    }
  }, [entry]);

  // Debounced save on text change
  useEffect(() => {
    if (!entry) return;

    const timeout = setTimeout(() => {
      if (editorialText !== (entry.editorial_text ?? "")) {
        editJournalMutation.mutate({
          id: entry.id,
          editorial_text: editorialText,
        });
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [editorialText, entry, editJournalMutation]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (!entryId || isNaN(Number(entryId))) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Invalid Entry ID
          </h1>
          <Link to="/journal" className="text-blue-600 hover:underline">
            ← Back to Journal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <nav className="bg-gray-900 dark:bg-gray-800 px-4 py-3 space-x-4">
        <Link
          to="/"
          className="text-gray-300 hover:text-white transition-colors"
        >
          Home
        </Link>
        <Link
          to="/journal"
          className="text-gray-300 hover:text-white transition-colors"
        >
          Journal
        </Link>
      </nav>

      <main className="p-8 max-w-4xl mx-auto">
        {isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-600 dark:text-gray-300">
              Loading entry...
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="text-red-600 dark:text-red-400 mb-4">
              Error loading journal entry: {error.message}
            </div>
            <Link
              to="/journal"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back to Journal
            </Link>
          </div>
        )}

        {entry === null && !isLoading && !error && (
          <div className="text-center py-12">
            <div className="text-gray-600 dark:text-gray-300 mb-4">
              Journal entry not found
            </div>
            <Link
              to="/journal"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back to Journal
            </Link>
          </div>
        )}

        {entry && (
          <div className="space-y-6">
            {/* Entry Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {formatDate(entry.entry_date)}
                </h1>
                <div className="text-sm text-gray-500 dark:text-gray-400 text-right">
                  <div>Entry #{entry.id}</div>
                  <div>Created: {formatDateTime(entry.created_at)}</div>
                  {entry.updated_at !== entry.created_at && (
                    <div>Updated: {formatDateTime(entry.updated_at)}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Editorial Text */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Journal Entry
              </h2>
              <label className="block mb-2 font-semibold text-gray-700">
                Details:
              </label>
              <textarea
                className="w-full  p-2 border rounded mb-4"
                rows={4}
                value={editorialText}
                onChange={(e) => setEditorialText(e.target.value)}
              />
            </div>

            {/* Tasks */}
            {entry.tasks && entry.tasks.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Task Activity
                </h2>
                <div className="space-y-3">
                  {entry.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between bg-white dark:bg-gray-700 rounded p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            task.action === "completed"
                              ? "bg-green-500"
                              : task.action === "created"
                                ? "bg-blue-500"
                                : "bg-yellow-500"
                          }`}
                        />
                        <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                          {task.action}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          task #{task.org_node_id}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDateTime(task.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-4 pt-6">
              <Link
                to="/journal"
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Back to Journal
              </Link>
              <Link
                to={`/journal/edit/${entry.id}`}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Entry
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
