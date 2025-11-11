// app/routes/food-planning/grocery-list.tsx
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Link } from "react-router";
import { fetchGroceryList } from "../../lib/foodPlanning/groceryList";
import type { GroceryListItem } from "../../types/foodPlanning";
import ProtectedRoute from "../../components/auth/ProtectedRoute";

const queryClient = new QueryClient();

function GroceryListContent() {
  const {
    data: items,
    isLoading,
    error,
  } = useQuery<GroceryListItem[]>({
    queryKey: ["groceryList"],
    queryFn: fetchGroceryList,
  });

  // Group items by category
  const groupedItems = items?.reduce(
    (acc, item) => {
      const category = item.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    {} as Record<string, GroceryListItem[]>
  );

  const categoryOrder = ["Produce", "Dairy", "Meat", "Pantry", "Frozen", "Other"];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-900 dark:bg-gray-800 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-gray-300 hover:text-white transition-colors"
            >
              ← Home
            </Link>
            <span className="text-gray-500">|</span>
            <Link
              to="/food-planning/meal-plan"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Meal Plan
            </Link>
            <Link
              to="/food-planning/grocery-list"
              className="text-blue-400 font-semibold"
            >
              Grocery List
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Grocery List
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your shopping list
            </p>
          </div>

          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            + Add Item
          </button>
        </div>

        {isLoading && (
          <div className="text-center py-8">
            <div className="text-gray-600 dark:text-gray-300">
              Loading grocery list...
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="text-red-600 dark:text-red-400">
              Error loading grocery list: {(error as Error).message}
            </div>
          </div>
        )}

        {items && items.length === 0 && (
          <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              Your grocery list is empty
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
              Add items manually or generate from your meal plan
            </p>
          </div>
        )}

        {groupedItems && Object.keys(groupedItems).length > 0 && (
          <div className="space-y-6">
            {categoryOrder.map((category) => {
              const categoryItems = groupedItems[category];
              if (!categoryItems || categoryItems.length === 0) return null;

              const checkedCount = categoryItems.filter(
                (item) => item.is_checked
              ).length;

              return (
                <div key={category}>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    {category}
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                      ({checkedCount}/{categoryItems.length})
                    </span>
                  </h2>

                  <div className="space-y-2">
                    {categoryItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          item.is_checked
                            ? "bg-gray-100 dark:bg-gray-800"
                            : "bg-gray-50 dark:bg-gray-800/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.is_checked}
                          onChange={() => {}}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />

                        <div className="flex-1">
                          <div
                            className={`font-medium ${
                              item.is_checked
                                ? "line-through text-gray-500 dark:text-gray-500"
                                : "text-gray-900 dark:text-gray-100"
                            }`}
                          >
                            {item.ingredient_name}
                            {item.quantity && (
                              <span className="text-gray-500 dark:text-gray-400 ml-2">
                                ({item.quantity})
                              </span>
                            )}
                          </div>
                          {item.source_meal_id && (
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              From meal plan
                            </div>
                          )}
                        </div>

                        <button className="text-gray-400 hover:text-red-600 transition-colors">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <button className="text-red-600 dark:text-red-400 hover:underline font-medium">
                Clear Checked Items
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function GroceryList() {
  return (
    <ProtectedRoute>
      <QueryClientProvider client={queryClient}>
        <GroceryListContent />
      </QueryClientProvider>
    </ProtectedRoute>
  );
}
