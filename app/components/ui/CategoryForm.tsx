// app/components/CategoryForm.tsx
import { useState, useEffect } from "react";

import { OrgNodeRow } from "../../types/orgChart";
import { useDeleteCategory, useSaveCategory } from "../../hooks/useCategories";

interface CategoryFormProps {
  category?: OrgNodeRow; // undefined = creating new
  onCancel: () => void;
  // Props for category creation
  parentId?: number;
  parentName?: string;
  categoryId: string; // UUID reference to categories table
  categoryName: string; // Category display name
}

export default function CategoryForm({
  category,
  onCancel,
  parentId,
  parentName,
  categoryId,
  categoryName,
}: CategoryFormProps) {
  const [name, setName] = useState(category?.name ?? "");

  // Reuse existing hooks - they work for any org node type
  const saveCategory = useSaveCategory();
  const deleteCategory = useDeleteCategory();

  const isCreating = !category;
  const isEditing = !!category;

  // Sync when editing category changes
  useEffect(() => {
    if (category) {
      setName(category.name);
    }
  }, [category]);

  // Display parent context for user clarity
  const displayParentPath = () => {
    if (isEditing && categoryName) {
      return categoryName;
    }
    if (isCreating && parentName && categoryName) {
      return `${categoryName} > ${parentName}`;
    }
    return "Unknown";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Determine parent context - use props for new categories, existing data for edits
    const effectiveParentId = category?.parent_id ?? parentId;
    const effectiveCategoryId = category?.category_id ?? categoryId;

    // Validation for new categories
    if (isCreating && (!effectiveParentId || !effectiveCategoryId)) {
      console.error("❌ Missing required parent context for new category:", {
        parentId: effectiveParentId,
        categoryId: effectiveCategoryId,
      });
      alert("Missing parent information. Please try again.");
      return;
    }

    const categoryData = {
      id: category?.id,
      name: name.trim(),
      parent_id: effectiveParentId,
      category_id: effectiveCategoryId,
      type: "category" as const,
    };

    console.log("🚀 Submitting category data:", categoryData);

    saveCategory.mutate(categoryData, {
      onSuccess: (savedCategory) => {
        console.log("✅ Category saved successfully:", savedCategory);
        onCancel(); // close modal after save
      },
      onError: (error) => {
        console.error("❌ Failed to save category:", error);
        alert(`Failed to save category: ${error.message}`);
      },
    });
  };

  const handleDelete = () => {
    if (category?.id) {
      if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
        return;
      }

      console.log("🗑️ Deleting category:", category.id);
      deleteCategory.mutate(category.id, {
        onSuccess: () => {
          console.log("✅ Category deleted successfully");
          onCancel();
        },
        onError: (error) => {
          console.error("❌ Failed to delete category:", error);
          alert(`Failed to delete category: ${error.message}`);
        },
      });
    }
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-[70] flex items-center justify-center bg-black">
      <form
        onSubmit={handleSubmit}
        className="mx-4 max-h-[90vh] w-full max-w-md space-y-4 overflow-y-auto rounded-lg bg-white p-6 text-black shadow-md"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">
              {isCreating ? "Create New Category" : `Edit Category`}
            </h3>
            <p className="text-sm text-gray-600">
              {isCreating
                ? `Adding to: ${displayParentPath()}`
                : `Location: ${displayParentPath()}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-2xl font-bold text-gray-500 hover:text-gray-800"
          >
            ×
          </button>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Category Name *
          </label>
          <input
            className="w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter category name"
            required
          />
        </div>

        <div className="flex justify-between border-t pt-4">
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteCategory.isPending}
              className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleteCategory.isPending ? "Deleting..." : "Delete Category"}
            </button>
          )}

          <div className={`${isEditing ? "ml-auto" : ""} space-x-2`}>
            <button
              type="button"
              onClick={onCancel}
              className="rounded bg-gray-300 px-4 py-2 text-white hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveCategory.isPending || !name.trim()}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saveCategory.isPending
                ? isCreating
                  ? "Creating..."
                  : "Saving..."
                : isCreating
                  ? "Create Category"
                  : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
