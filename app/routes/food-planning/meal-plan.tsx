// app/routes/food-planning/meal-plan.tsx
import { useState } from "react";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Link } from "react-router";
import { fetchMealTemplates } from "../../lib/foodPlanning/mealTemplates";
import type { MealTemplate, Person } from "../../types/foodPlanning";
import ProtectedRoute from "../../components/auth/ProtectedRoute";

const queryClient = new QueryClient();

function MealPlanContent() {
  const [selectedPerson, setSelectedPerson] = useState<Person>("adult");

  const {
    data: templates,
    isLoading,
    error,
  } = useQuery<MealTemplate[]>({
    queryKey: ["mealTemplates"],
    queryFn: fetchMealTemplates,
  });

  const filteredTemplates = templates?.filter(
    (t) => t.person === selectedPerson
  );

  // Group templates by meal type
  const groupedTemplates = filteredTemplates?.reduce(
    (acc, template) => {
      if (!acc[template.meal_type]) {
        acc[template.meal_type] = [];
      }
      acc[template.meal_type].push(template);
      return acc;
    },
    {} as Record<string, MealTemplate[]>
  );

  const mealTypeOrder = [
    "pre-breakfast",
    "smoothie",
    "breakfast",
    "snack",
    "lunch",
    "dinner",
  ];

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
              className="text-blue-400 font-semibold"
            >
              Meal Plan
            </Link>
            <Link
              to="/food-planning/grocery-list"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Grocery List
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Meal Templates
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your reusable meal templates
            </p>
          </div>

          {/* Person Toggle */}
          <div className="flex gap-2 bg-gray-200 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setSelectedPerson("adult")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedPerson === "adult"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              Adult
            </button>
            <button
              onClick={() => setSelectedPerson("toddler")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedPerson === "toddler"
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              Toddler
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-8">
            <div className="text-gray-600 dark:text-gray-300">
              Loading meal templates...
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="text-red-600 dark:text-red-400">
              Error loading templates: {(error as Error).message}
            </div>
          </div>
        )}

        {groupedTemplates && Object.keys(groupedTemplates).length === 0 && (
          <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              No meal templates yet for {selectedPerson}
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
              Run the seed data SQL to populate your standard meals
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              + Add Template
            </button>
          </div>
        )}

        {groupedTemplates && Object.keys(groupedTemplates).length > 0 && (
          <div className="space-y-8">
            {mealTypeOrder.map((mealType) => {
              const templatesForType = groupedTemplates[mealType];
              if (!templatesForType || templatesForType.length === 0)
                return null;

              return (
                <div key={mealType}>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 capitalize flex items-center gap-2">
                    {mealType.replace("-", " ")}
                    {templatesForType.some((t) => t.is_fixed) && (
                      <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                        Fixed
                      </span>
                    )}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templatesForType.map((template) => (
                      <div
                        key={template.id}
                        className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          template.is_fixed ? "border-2 border-green-500" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {template.name}
                          </h3>
                        </div>

                        {template.ingredients.length > 0 && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <div className="font-medium mb-1">Ingredients:</div>
                            <ul className="list-disc list-inside space-y-0.5">
                              {template.ingredients.map((ing, idx) => (
                                <li key={idx}>
                                  {ing.quantity
                                    ? `${ing.quantity} ${ing.name}`
                                    : ing.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {template.notes && (
                          <div className="text-sm text-gray-500 dark:text-gray-500 italic">
                            {template.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default function MealPlan() {
  return (
    <ProtectedRoute>
      <QueryClientProvider client={queryClient}>
        <MealPlanContent />
      </QueryClientProvider>
    </ProtectedRoute>
  );
}
