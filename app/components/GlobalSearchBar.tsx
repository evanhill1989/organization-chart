// app/components/GlobalSearchBar.tsx
import { forwardRef, useState, useRef, useEffect } from "react";
import { useFetchAllNodes } from "../hooks/useFetchAllNodes";
import { useCategoriesQuery } from "../hooks/useCategoriesQuery";
import { searchNodes, type SearchResult } from "../lib/searchUtils";
import SearchResults from "./SearchResults";

interface GlobalSearchBarProps {
  onSelectResult: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Global search bar component with fuzzy search across all nodes
 * Supports keyboard navigation and Ctrl+K shortcut (handled by parent)
 */
const GlobalSearchBar = forwardRef<HTMLInputElement, GlobalSearchBarProps>(
  ({ onSelectResult, placeholder = "Search...", className = "" }, ref) => {
    const [query, setQuery] = useState("");
    const [showResults, setShowResults] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const { data: allNodes = [] } = useFetchAllNodes();
    const { data: categories = [] } = useCategoriesQuery();

    // Perform search
    const searchResults = query.trim()
      ? searchNodes(query, allNodes, categories)
      : [];

    // Handle result selection
    const handleSelectResult = (result: SearchResult) => {
      setQuery("");
      setShowResults(false);
      onSelectResult(result);
    };

    // Handle click outside to close results
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setShowResults(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle Escape to close results
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape" && showResults) {
          setShowResults(false);
          setQuery("");
        }
      };

      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }, [showResults]);

    return (
      <div ref={containerRef} className={`relative ${className}`}>
        {/* Search Input */}
        <div className="relative">
          <input
            ref={ref}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => query && setShowResults(true)}
            placeholder={placeholder}
            className="w-full rounded-lg border border-gray-700/50 bg-gray-800/60 px-4 py-2 pr-10 text-sm text-gray-100 placeholder-gray-500 transition-colors focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600/50 dark:bg-gray-700/60"
          />

          {/* Search Icon */}
          <svg
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          {/* Clear button */}
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setShowResults(false);
              }}
              className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        <SearchResults
          results={searchResults}
          onSelectResult={handleSelectResult}
          isVisible={showResults && query.trim().length > 0}
        />
      </div>
    );
  }
);

GlobalSearchBar.displayName = "GlobalSearchBar";

export default GlobalSearchBar;
