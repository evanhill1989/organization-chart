// app/routes/journal/entry.$entryId.tsx - SPA version (no loader)
import { useParams, Link } from "react-router";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { fetchJournalEntry } from "../../lib/journal";
import type { JournalEntryWithTasks } from "../../types/journal";
import type { OrgNodeRow } from "../../types/orgChart";
import { useEffect, useState } from "react";
import { useEditJournal } from "../../hooks/useEditJournal";
import TaskForm from "../../components/tasks/TaskForm";
import ProtectedRoute from "../../components/auth/ProtectedRoute";

const queryClient = new QueryClient();

export default function JournalEntry() {
  return (
    <ProtectedRoute>
      <QueryClientProvider client={queryClient}>
        <JournalEntryContent />
      </QueryClientProvider>
    </ProtectedRoute>
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
  const [selectedTask, setSelectedTask] = useState<OrgNodeRow | null>(null);
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
              <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
                Details:
              </label>
              <textarea
                className="w-full p-2 border rounded mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
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
                      onClick={() => task.org_node && setSelectedTask(task.org_node)}
                      className="flex items-center justify-between bg-white dark:bg-gray-700 rounded p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
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
                          {task.org_node && `: ${task.org_node.name}`}
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

            {/* AI Prompt Template */}
            {entry.tasks && entry.tasks.length > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6 border-2 border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    AI Journal Prompt
                  </h2>
                  <button
                    onClick={() => {
                      const promptText = document.getElementById("ai-prompt")?.innerText;
                      if (promptText) {
                        navigator.clipboard.writeText(promptText);
                        alert("Prompt copied to clipboard!");
                      }
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    Copy Prompt
                  </button>
                </div>
                <div
                  id="ai-prompt"
                  className="bg-white dark:bg-gray-800 rounded p-4 font-mono text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap"
                >
{`I'm creating a journal entry for ${formatDate(entry.entry_date)}. Please help me write a meaningful reflection based on my task activity for the day.

Task Activity Summary:
${entry.tasks.map((task) => {
  const taskNode = task.org_node;
  if (!taskNode) return `- ${task.action.toUpperCase()}: task #${task.org_node_id} (details unavailable)`;

  const parts = [`- ${task.action.toUpperCase()}: ${taskNode.name}`];

  if (taskNode.details) {
    parts.push(`  Description: ${taskNode.details}`);
  }

  if (taskNode.importance) {
    parts.push(`  Importance: ${taskNode.importance}/10`);
  }

  if (taskNode.deadline) {
    parts.push(`  Deadline: ${new Date(taskNode.deadline).toLocaleDateString()}`);
  }

  if (taskNode.completion_time) {
    parts.push(`  Estimated time: ${taskNode.completion_time} hours`);
  }

  if (task.action === "completed" && taskNode.completion_comment) {
    parts.push(`  Completion note: ${taskNode.completion_comment}`);
  }

  return parts.join('\n');
}).join('\n\n')}

${editorialText ? `\nMy initial thoughts:\n${editorialText}\n` : ''}
Please help me create a journal entry that:
1. Reflects on the significance of these task activities
2. Identifies any patterns or themes in my work
3. Acknowledges progress and accomplishments
4. Notes any challenges or concerns
5. Provides thoughtful perspective on my productivity and priorities

Write in a personal, reflective tone suitable for a private journal entry.`}
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

        {/* Task Form Modal */}
        {selectedTask && (
          <TaskForm task={selectedTask} onCancel={() => setSelectedTask(null)} />
        )}
      </main>
    </div>
  );
}
