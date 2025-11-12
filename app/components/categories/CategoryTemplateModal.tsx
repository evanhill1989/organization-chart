import { useState } from "react";
import { CATEGORY_TEMPLATES, type TemplateSet } from "../../lib/categoryTemplates";
import { useAddCategory } from "../../hooks/useAddCategory";

interface CategoryTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CategoryTemplateModal({
  isOpen,
  onClose,
}: CategoryTemplateModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateSet | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const addCategoryMutation = useAddCategory();

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return;

    setIsCreating(true);

    try {
      // Create all categories from the template
      for (const category of selectedTemplate.categories) {
        await addCategoryMutation.mutateAsync({
          name: category.name,
          description: category.description,
          color: category.color,
        });
      }

      // Close modal after successful creation
      onClose();
    } catch (error) {
      console.error("Failed to apply template:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-lg border border-gray-700 bg-gray-900 p-6 shadow-xl dark:border-gray-600 dark:bg-gray-800">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Category Templates</h2>
          <p className="mt-2 text-sm text-gray-400">
            Choose a template to quickly set up your categories
          </p>
        </div>

        {/* Template Selection */}
        {!selectedTemplate ? (
          <div className="space-y-3">
            {CATEGORY_TEMPLATES.map((template) => (
              <button
                key={template.name}
                onClick={() => setSelectedTemplate(template)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 p-4 text-left transition-all hover:border-blue-500 hover:bg-gray-750 dark:border-gray-600"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">
                      {template.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                      {template.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {template.categories.map((cat) => (
                        <span
                          key={cat.name}
                          className="flex items-center gap-1.5 rounded-full bg-gray-700 px-2.5 py-1 text-xs text-gray-300"
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Template Preview */
          <div>
            <button
              onClick={() => setSelectedTemplate(null)}
              className="mb-4 flex items-center gap-2 text-sm text-gray-400 hover:text-white"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to templates
            </button>

            <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 dark:border-gray-600">
              <h3 className="mb-2 text-xl font-semibold text-white">
                {selectedTemplate.name}
              </h3>
              <p className="mb-4 text-sm text-gray-400">
                {selectedTemplate.description}
              </p>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-300">
                  Categories ({selectedTemplate.categories.length}):
                </p>
                {selectedTemplate.categories.map((cat) => (
                  <div
                    key={cat.name}
                    className="flex items-start gap-3 rounded bg-gray-750 p-3"
                  >
                    <span
                      className="mt-1 h-3 w-3 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-white">{cat.name}</p>
                      <p className="text-sm text-gray-400">{cat.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          {selectedTemplate ? (
            <>
              <button
                onClick={handleApplyTemplate}
                disabled={isCreating}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCreating ? "Creating Categories..." : "Apply Template"}
              </button>
              <button
                onClick={onClose}
                disabled={isCreating}
                className="rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 font-medium text-gray-300 transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 font-medium text-gray-300 transition-colors hover:bg-gray-700"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
