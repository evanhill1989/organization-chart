// app/routes/journal/new.tsx
import { Link } from "react-router";

export default function NewJournalEntry() {
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

      <main className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          New Journal Entry
        </h1>

        {/* TODO: Add journal entry form */}
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
          <p className="text-gray-600 dark:text-gray-300">
            Journal entry form will go here...
          </p>
        </div>
      </main>
    </div>
  );
}
