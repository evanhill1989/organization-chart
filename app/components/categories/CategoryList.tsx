import { useState } from "react";
import CategoryCard from "./CategoryCard";
import CategoryForm from "./CategoryForm";
import CategoryTemplateModal from "./CategoryTemplateModal";
import { useCategoriesQuery } from "../../hooks/useCategoriesQuery";
import { useAddCategory } from "../../hooks/useAddCategory";
import { useEditCategory } from "../../hooks/useEditCategory";
import { useDeleteCategory } from "../../hooks/useDeleteCategory";
import { useArchiveCategory } from "../../hooks/useArchiveCategory";
import { useCategoryNodeCounts } from "../../hooks/useCategoryNodeCounts";
import { useCriticalTaskCounts } from "../../hooks/useCriticalTaskCounts";
import type { Category } from "../../types/orgChart";

export default function CategoryList() {
  const [showForm, setShowForm] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(
    undefined
  );
  const [deletingCategory, setDeletingCategory] = useState<
    Category | undefined
  >(undefined);
  const [archivingCategory, setArchivingCategory] = useState<
    Category | undefined
  >(undefined);

  // Queries
  const { data: categories, isLoading, error } = useCategoriesQuery();
  const { data: nodeCounts } = useCategoryNodeCounts();
  const criticalCounts = useCriticalTaskCounts();

  // Mutations
  const addMutation = useAddCategory();
  const editMutation = useEditCategory();
  const deleteMutation = useDeleteCategory();
  const archiveMutation = useArchiveCategory();

  // Handlers
  const handleCreate = () => {
    setEditingCategory(undefined);
    setShowForm(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = (category: Category) => {
    // Check if category has nodes
    const nodeCount = nodeCounts?.[category.id] || 0;
    if (nodeCount > 0) {
      // Suggest archiving instead
      setArchivingCategory(category);
    } else {
      setDeletingCategory(category);
    }
  };

  const confirmDelete = async () => {
    if (!deletingCategory) return;

    try {
      await deleteMutation.mutateAsync({ id: deletingCategory.id });
      setDeletingCategory(undefined);
    } catch (err) {
      console.error("Failed to delete category:", err);
      // Error already displayed via mutation error handling
    }
  };

  const confirmArchive = async () => {
    if (!archivingCategory) return;

    try {
      await archiveMutation.mutateAsync({
        id: archivingCategory.id,
        archive: true,
      });
      setArchivingCategory(undefined);
    } catch (err) {
      console.error("Failed to archive category:", err);
    }
  };

  const handleFormSubmit = async (data: {
    name: string;
    description?: string;
    color: string;
  }) => {
    try {
      if (editingCategory) {
        await editMutation.mutateAsync({
          id: editingCategory.id,
          ...data,
        });
      } else {
        await addMutation.mutateAsync(data);
      }
      setShowForm(false);
      setEditingCategory(undefined);
    } catch (err) {
      console.error("Failed to save category:", err);
      // Error already displayed via mutation error handling
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading categories...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-6">
        <h3 className="mb-2 text-lg font-semibold text-red-400">
          Error loading categories
        </h3>
        <p className="text-sm text-red-300">
          {error instanceof Error ? error.message : "Unknown error occurred"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        {/* Header with Create Button */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Categories</h2>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Category
          </button>
        </div>

        {/* Category Grid */}
        {categories && categories.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => {
              const nodeCount = nodeCounts?.[category.id] || 0;
              const criticalCount = criticalCounts[category.name] || 0;

              return (
                <CategoryCard
                  key={category.id}
                  category={category}
                  nodeCount={nodeCount}
                  criticalCount={criticalCount}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-700/50 bg-gray-900/30 p-12 text-center dark:border-gray-600/50 dark:bg-gray-800/30">
            <svg
              className="mx-auto mb-4 h-12 w-12 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mb-2 text-lg font-semibold text-white">
              No categories yet
            </h3>
            <p className="mb-4 text-sm text-gray-400">
              Create your first category or use a template to get started quickly
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleCreate}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Create Category
              </button>
              <button
                onClick={() => setShowTemplateModal(true)}
                className="rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700"
              >
                Use Template
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      <CategoryForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingCategory(undefined);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingCategory}
        isLoading={addMutation.isPending || editMutation.isPending}
      />

      {/* Template Modal */}
      <CategoryTemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
      />

      {/* Archive Confirmation Modal */}
      {archivingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-yellow-700 bg-gray-900 p-6 shadow-xl dark:border-yellow-600 dark:bg-gray-800">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20">
                <svg
                  className="h-6 w-6 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">
                  Archive Category?
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  <span className="font-medium text-white">
                    {archivingCategory.name}
                  </span>{" "}
                  contains {nodeCounts?.[archivingCategory.id] || 0} nodes.
                </p>
                <p className="mt-2 text-sm text-yellow-400">
                  Archiving is recommended instead of deleting. Archived categories can be restored later.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmArchive}
                disabled={archiveMutation.isPending}
                className="flex-1 rounded-lg bg-yellow-600 px-4 py-2 font-medium text-white transition-colors hover:bg-yellow-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {archiveMutation.isPending ? "Archiving..." : "Archive Category"}
              </button>
              <button
                onClick={() => setArchivingCategory(undefined)}
                disabled={archiveMutation.isPending}
                className="flex-1 rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 font-medium text-gray-300 transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-red-700 bg-gray-900 p-6 shadow-xl dark:border-red-600 dark:bg-gray-800">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
                <svg
                  className="h-6 w-6 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">
                  Delete Category
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-white">
                    {deletingCategory.name}
                  </span>
                  ?
                </p>
                <p className="mt-2 text-sm text-red-400">
                  Warning: This will also delete all nodes in this category.
                  This action cannot be undone.
                </p>
              </div>
            </div>

            {deleteMutation.error && (
              <div className="mb-4 rounded bg-red-500/10 p-3 text-sm text-red-400">
                {deleteMutation.error instanceof Error
                  ? deleteMutation.error.message
                  : "Failed to delete category"}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Category"}
              </button>
              <button
                onClick={() => setDeletingCategory(undefined)}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 font-medium text-gray-300 transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
