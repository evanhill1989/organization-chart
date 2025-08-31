// app/routes/journal/_index.tsx
import { Link } from "react-router";

export default function JournalHome() {
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

      <main className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Journal
        </h1>

        <div className="space-y-4">
          <Link
            to="/journal/new"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            New Entry
          </Link>

          {/* TODO: Add list of existing entries */}
        </div>
      </main>
    </div>
  );
}
