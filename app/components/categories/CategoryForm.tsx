import { useState, useEffect } from "react";
import type { Category } from "../../types/orgChart";

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    color: string;
  }) => void;
  initialData?: Category; // For edit mode
  isLoading?: boolean;
}

// Common category colors
const PRESET_COLORS = [
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#10B981" },
  { name: "Red", value: "#EF4444" },
  { name: "Yellow", value: "#F59E0B" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Pink", value: "#EC4899" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Gray", value: "#6B7280" },
];

export default function CategoryForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: CategoryFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [customColor, setCustomColor] = useState("");

  // Load initial data for edit mode
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || "");
      setColor(initialData.color);
    } else {
      setName("");
      setDescription("");
      setColor("#3B82F6");
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalColor = customColor || color;
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      color: finalColor,
    });

    // Reset form
    setName("");
    setDescription("");
    setColor("#3B82F6");
    setCustomColor("");
  };

  const handleCancel = () => {
    setName("");
    setDescription("");
    setColor("#3B82F6");
    setCustomColor("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-700 bg-gray-900 p-6 shadow-xl dark:border-gray-600 dark:bg-gray-800">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">
            {initialData ? "Edit Category" : "Create Category"}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {initialData
              ? "Update your category details"
              : "Add a new category to organize your tasks"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div>
            <label
              htmlFor="category-name"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Work, Personal, Home"
              required
              maxLength={255}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Description Input */}
          <div>
            <label
              htmlFor="category-description"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Description (optional)
            </label>
            <textarea
              id="category-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this category for?"
              rows={3}
              maxLength={500}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Color
            </label>

            {/* Preset Colors */}
            <div className="mb-3 grid grid-cols-4 gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    setColor(preset.value);
                    setCustomColor("");
                  }}
                  className={`flex h-10 items-center justify-center rounded-lg border-2 transition-all ${
                    color === preset.value && !customColor
                      ? "border-white scale-105"
                      : "border-gray-600 hover:border-gray-400"
                  }`}
                  style={{ backgroundColor: preset.value }}
                  title={preset.name}
                >
                  {color === preset.value && !customColor && (
                    <svg
                      className="h-5 w-5 text-white drop-shadow"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {/* Custom Color Input */}
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customColor || color}
                onChange={(e) => setCustomColor(e.target.value)}
                className="h-10 w-16 cursor-pointer rounded border border-gray-600 bg-gray-800"
              />
              <span className="text-sm text-gray-400">
                Custom color: {customColor || color}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading
                ? "Saving..."
                : initialData
                  ? "Update Category"
                  : "Create Category"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 font-medium text-gray-300 transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
