// app/routes/journal/entry.$entryId.tsx
import { useParams, Link } from "react-router";
import type { Route } from "./+types/entry.$entryId";

export async function loader({ params }: Route.LoaderArgs) {
  const { entryId } = params;

  // TODO: Fetch journal entry from your database
  // For now, just return the ID
  return { entryId };
}

export default function JournalEntry() {
  const params = useParams();
  const entryId = params.entryId;

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
          Journal Entry #{entryId}
        </h1>

        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            This is where you would display journal entry {entryId}
          </p>

          {/* TODO: Add actual journal entry content */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Entry Content
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Journal entry content will go here...
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
