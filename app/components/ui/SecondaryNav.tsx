// app/components/ui/SecondaryNav.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import TabNavigationList from "./TabNavigationList";
import GlobalSearchBar from "../GlobalSearchBar";
import type { SearchResult } from "../../lib/searchUtils";

interface SecondaryNavProps {
  activeTab: string;
  variant?: "desktop" | "mobile";
  onTaskSelect?: (taskId: number) => void; // Callback to open task modal
}

/**
 * Secondary navigation bar for org-chart category tabs
 * Positioned below the main navigation, only visible on org-chart routes
 * Includes global search with Ctrl+K shortcut
 */
export default function SecondaryNav({
  activeTab,
  variant = "desktop",
  onTaskSelect,
}: SecondaryNavProps) {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Ctrl+K keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (variant === "mobile") {
          setShowMobileSearch(true);
          // Focus after state updates
          setTimeout(() => searchInputRef.current?.focus(), 0);
        } else {
          searchInputRef.current?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [variant]);

  // Handle search result selection
  const handleSelectResult = (result: SearchResult) => {
    if (result.node.type === "task") {
      // Open task modal via callback
      onTaskSelect?.(result.node.id);
    } else if (result.node.type === "category") {
      // Navigate to category route
      navigate(`/org-chart/${result.categoryId}`);
    }

    // Close mobile search after selection
    if (variant === "mobile") {
      setShowMobileSearch(false);
    }
  };

  if (variant === "mobile") {
    return (
      <div className="border-b border-gray-700/30 bg-gray-900/90 shadow-sm backdrop-blur-sm dark:border-gray-600/30 dark:bg-gray-800/90">
        <div className="mx-auto px-4 py-2">
          {/* Mobile: Show search icon, expand to full search bar when clicked */}
          <div className="flex items-center gap-3">
            {!showMobileSearch ? (
              /* Search icon button */
              <button
                onClick={() => setShowMobileSearch(true)}
                className="flex w-full items-center gap-2 rounded-lg border border-gray-700/50 bg-gray-800/60 px-4 py-2 text-sm text-gray-400 transition-colors hover:border-gray-600/50 hover:text-gray-300"
                aria-label="Open search"
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span>Search categories & tasks...</span>
              </button>
            ) : (
              /* Full search bar */
              <div className="flex flex-1 items-center gap-2">
                <GlobalSearchBar
                  ref={searchInputRef}
                  onSelectResult={handleSelectResult}
                  placeholder="Search categories & tasks... (Ctrl+K)"
                  className="flex-1"
                />
                <button
                  onClick={() => setShowMobileSearch(false)}
                  className="shrink-0 rounded-lg p-2 text-gray-400 hover:text-gray-200"
                  aria-label="Close search"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop variant
  return (
    <div className="border-b border-gray-700/30 bg-gray-900/90 shadow-sm backdrop-blur-sm dark:border-gray-600/30 dark:bg-gray-800/90">
      <div className="mx-auto max-w-[1800px] px-6 py-2">
        <div className="flex items-center gap-6">
          {/* Tab navigation */}
          <div className="flex-1">
            <TabNavigationList activeTab={activeTab} variant={variant} />
          </div>

          {/* Search bar */}
          <div className="w-80">
            <GlobalSearchBar
              ref={searchInputRef}
              onSelectResult={handleSelectResult}
              placeholder="Search... (Ctrl+K)"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
