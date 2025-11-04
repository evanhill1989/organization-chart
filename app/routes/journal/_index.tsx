// app/routes/journal/_index.tsx
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Link } from "react-router";
import { fetchAllJournalEntries } from "../../lib/journal";
import type { JournalEntry } from "../../types/journal";
import ProtectedRoute from "../../components/auth/ProtectedRoute";

const queryClient = new QueryClient();

function JournalHomeContent() {
  const {
    data: entries,
    isLoading,
    error,
  } = useQuery<JournalEntry[]>({
    queryKey: ["journalEntries"],
    queryFn: fetchAllJournalEntries,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <nav className="bg-gray-900 dark:bg-gray-800 px-4 py-3">
        <Link
          to="/"
          className="text-gray-300 hover:text-white transition-colors"
        >
          ← Home
        </Link>
      </nav>

      <main className="p-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Journal
          </h1>
          <Link
            to="/journal/new"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            New Entry
          </Link>
        </div>

        {isLoading && (
          <div className="text-center py-8">
            <div className="text-gray-600 dark:text-gray-300">
              Loading entries...
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="text-red-600 dark:text-red-400">
              Error loading journal entries: {error.message}
            </div>
          </div>
        )}

        {entries && entries.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              No journal entries yet
            </div>
            <Link
              to="/journal/new"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Create your first entry
            </Link>
          </div>
        )}

        {entries && entries.length > 0 && (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {formatDate(entry.entry_date)}
                  </h2>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </div>
                </div>

                {entry.editorial_text && (
                  <div className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                    {entry.editorial_text.substring(0, 200)}
                    {entry.editorial_text.length > 200 && "..."}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Entry #{entry.id}
                  </div>
                  <Link
                    to={`/journal/entry/${entry.id}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Read more →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function JournalHome() {
  return (
    <ProtectedRoute>
      <QueryClientProvider client={queryClient}>
        <JournalHomeContent />
      </QueryClientProvider>
    </ProtectedRoute>
  );
}
