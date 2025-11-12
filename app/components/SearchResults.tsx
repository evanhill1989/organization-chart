// app/components/SearchResults.tsx
import { useEffect, useRef, useState } from "react";
import type { SearchResult } from "../lib/searchUtils";

interface SearchResultsProps {
  results: SearchResult[];
  onSelectResult: (result: SearchResult) => void;
  isVisible: boolean;
}

/**
 * Dropdown component displaying search results
 * Grouped by type (categories first, then tasks)
 * Supports keyboard navigation
 */
export default function SearchResults({
  results,
  onSelectResult,
  isVisible,
}: SearchResultsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (results[selectedIndex]) {
          onSelectResult(results[selectedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, results, selectedIndex, onSelectResult]);

  // Scroll selected item into view
  useEffect(() => {
    if (!resultsRef.current) return;
    const selectedElement = resultsRef.current.children[
      selectedIndex
    ] as HTMLElement;
    selectedElement?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [selectedIndex]);

  if (!isVisible || results.length === 0) {
    return null;
  }

  // Group results by type
  const categories = results.filter((r) => r.node.type === "category");
  const tasks = results.filter((r) => r.node.type === "task");

  return (
    <div
      ref={resultsRef}
      className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[400px] overflow-y-auto rounded-lg border border-gray-700/50 bg-gray-900/95 shadow-2xl backdrop-blur-sm dark:border-gray-600/50 dark:bg-gray-800/95"
    >
      {/* Categories section */}
      {categories.length > 0 && (
        <div>
          <div className="sticky top-0 bg-gray-800/90 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Categories
          </div>
          {categories.map((result) => {
            const globalIndex = results.indexOf(result);
            return (
              <ResultItem
                key={result.node.id}
                result={result}
                isSelected={globalIndex === selectedIndex}
                onClick={() => onSelectResult(result)}
              />
            );
          })}
        </div>
      )}

      {/* Tasks section */}
      {tasks.length > 0 && (
        <div>
          <div className="sticky top-0 bg-gray-800/90 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Tasks
          </div>
          {tasks.map((result) => {
            const globalIndex = results.indexOf(result);
            return (
              <ResultItem
                key={result.node.id}
                result={result}
                isSelected={globalIndex === selectedIndex}
                onClick={() => onSelectResult(result)}
              />
            );
          })}
        </div>
      )}

      {/* No results message */}
      {results.length === 0 && (
        <div className="px-4 py-8 text-center text-sm text-gray-400">
          No results found
        </div>
      )}
    </div>
  );
}

/**
 * Individual search result item
 */
function ResultItem({
  result,
  isSelected,
  onClick,
}: {
  result: SearchResult;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { node, path } = result;

  // Build breadcrumb display (skip the last item since it's the node name)
  const breadcrumb = path.slice(0, -1).join(" → ");

  return (
    <button
      onClick={onClick}
      className={`w-full border-b border-gray-700/30 px-4 py-3 text-left transition-colors dark:border-gray-600/30 ${
        isSelected
          ? "bg-blue-600/30 dark:bg-blue-700/30"
          : "hover:bg-gray-800/60 dark:hover:bg-gray-700/60"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Node name */}
          <div className="font-medium text-gray-100 dark:text-gray-200">
            {node.name}
          </div>

          {/* Breadcrumb path */}
          {breadcrumb && (
            <div className="mt-1 truncate text-xs text-gray-400 dark:text-gray-500">
              {breadcrumb}
            </div>
          )}

          {/* Details preview if available */}
          {node.details && (
            <div className="mt-1 line-clamp-2 text-xs text-gray-500">
              {node.details}
            </div>
          )}
        </div>

        {/* Type badge */}
        <div
          className={`shrink-0 rounded px-2 py-1 text-xs font-medium ${
            node.type === "category"
              ? "bg-purple-600/20 text-purple-300"
              : "bg-blue-600/20 text-blue-300"
          }`}
        >
          {node.type === "category" ? "Category" : "Task"}
        </div>
      </div>
    </button>
  );
}
