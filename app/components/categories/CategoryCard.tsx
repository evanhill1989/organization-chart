import { Link } from "react-router";
import type { Category } from "../../types/orgChart";

interface CategoryCardProps {
  category: Category;
  nodeCount?: number;
  criticalCount?: number;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export default function CategoryCard({
  category,
  nodeCount = 0,
  criticalCount = 0,
  onEdit,
  onDelete,
}: CategoryCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-700/50 bg-gray-900/50 transition-all hover:border-blue-500/50 hover:bg-gray-800/50 hover:shadow-lg hover:shadow-blue-500/10 dark:border-gray-600/50 dark:bg-gray-800/50">
      {/* Color Bar */}
      <div
        className="absolute left-0 top-0 h-full w-1"
        style={{ backgroundColor: category.color }}
      />

      {/* Main Content */}
      <Link
        to={`/org-chart/${category.id}`}
        className="block p-6 pl-8"
      >
        {/* Category Name */}
        <h3 className="mb-2 text-lg font-semibold text-white group-hover:text-blue-400">
          {category.name}
        </h3>

        {/* Description */}
        {category.description && (
          <p className="mb-3 text-sm text-gray-400 line-clamp-2">
            {category.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          {/* Critical Task Badge */}
          {criticalCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-red-500 px-2 text-xs font-bold text-white">
                {criticalCount > 99 ? "99+" : criticalCount}
              </span>
              <span className="text-gray-400">
                Critical task{criticalCount !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Node Count */}
          {criticalCount === 0 && (
            <span className="text-gray-500">
              {nodeCount} node{nodeCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Arrow Icon */}
        <div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
          <svg
            className="h-5 w-5 text-blue-400"
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
      </Link>

      {/* Action Buttons - Only visible on hover */}
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {/* Edit Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onEdit(category);
          }}
          className="rounded bg-gray-800/90 p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-blue-400"
          title="Edit category"
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onDelete(category);
          }}
          className="rounded bg-gray-800/90 p-2 text-gray-400 transition-colors hover:bg-red-600 hover:text-white"
          title="Delete category"
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
