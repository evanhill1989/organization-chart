import { useState, useEffect } from "react";
import { Link, useParams, Navigate } from "react-router";
import {
  useQuery,
  keepPreviousData,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

// Temporarily comment out these imports to test if they're causing issues
import OrgChartTab from "../../components/OrgChartTab";
import QuickAddEditModal from "../../components/QuickAddEditModal";
import TimeAvailabilityReport from "../../components/TimeAvailabilityReport";
import type { OrgNode } from "../../types/orgChart";
import { fetchOrgTree } from "../../lib/fetchOrgTree";

const queryClient = new QueryClient();

const TABS = [
  "Household",
  "Finances",
  "Cleo",
  "Job",
  "Social",
  "Personal",
  "Orphans",
] as const;

function OrgChartContent() {
  console.log("🎯 OrgChartRoute component starting to render");

  const { tabName } = useParams();
  console.log("📝 Received tabName from params:", tabName);

  const activeTab = tabName || "Household";
  console.log("✅ Active tab resolved to:", activeTab);

  // Always call hooks first, before any conditional logic
  const [isDarkMode, setIsDarkMode] = useState(() => {
    console.log("🌙 Initializing dark mode state");
    try {
      const stored = localStorage.getItem("darkMode");
      console.log("💾 Stored dark mode value:", stored);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        console.log("🔄 Parsed dark mode:", parsed);
        return parsed;
      }
      const systemPreference = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      console.log("🖥️ System dark mode preference:", systemPreference);
      return systemPreference;
    } catch (error) {
      console.error("❌ Error initializing dark mode:", error);
      return false;
    }
  });

  console.log("🌓 Dark mode state:", isDarkMode);

  useEffect(() => {
    console.log("🔄 Dark mode useEffect running, isDarkMode:", isDarkMode);
    try {
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
        console.log("🌙 Added dark class to document");
      } else {
        document.documentElement.classList.remove("dark");
        console.log("☀️ Removed dark class from document");
      }
    } catch (error) {
      console.error("❌ Error applying dark mode:", error);
    }
  }, [isDarkMode]);

  console.log("🔍 About to run useQuery for activeTab:", activeTab);

  const {
    data: tree,
    isLoading,
    error,
  } = useQuery<OrgNode>({
    queryKey: ["orgTree", activeTab],
    queryFn: () => {
      console.log("📡 fetchOrgTree called for tab:", activeTab);
      return fetchOrgTree(activeTab);
    },
    placeholderData: keepPreviousData,
  });

  console.log(
    "📊 Query state - isLoading:",
    isLoading,
    "error:",
    error,
    "tree:",
    tree
  );

  const [showQuickAddEdit, setShowQuickAddEdit] = useState(false);
  console.log("⚡ showQuickAddEdit state:", showQuickAddEdit);

  // Validate tab name and redirect if invalid (after all hooks)
  if (tabName && !TABS.includes(tabName as (typeof TABS)[number])) {
    console.log("❌ Invalid tab name, redirecting:", tabName);
    return <Navigate to="/org-chart/Household" replace />;
  }

  console.log("✅ Tab validation passed for:", tabName);

  const toggleDarkMode = () => {
    console.log("🔄 toggleDarkMode called, current state:", isDarkMode);
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      localStorage.setItem("darkMode", JSON.stringify(newMode));
      console.log("💾 Saved new dark mode to localStorage:", newMode);

      if (newMode) {
        document.documentElement.classList.add("dark");
        console.log("🌙 Applied dark mode to document");
      } else {
        document.documentElement.classList.remove("dark");
        console.log("☀️ Removed dark mode from document");
      }
    } catch (error) {
      console.error("❌ Error in toggleDarkMode:", error);
    }
  };

  console.log("🎨 About to render JSX");

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen w-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
        <nav className="flex justify-between items-center bg-gray-900 dark:bg-gray-800 sticky top-0 z-10 px-4">
          <div className="flex justify-center items-center">
            <Link
              to="/"
              className="px-4 py-3 text-lg font-medium text-gray-300 hover:text-white hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors mr-4"
            >
              ← Home
            </Link>
            {TABS.map((tab) => {
              console.log(
                `🔗 Rendering tab link for: ${tab}, active: ${activeTab === tab}`
              );
              return (
                <Link
                  key={tab}
                  to={`/org-chart/${tab}`}
                  className={`px-6 py-3 text-lg font-medium border-b-2 transition-colors duration-200 ${
                    activeTab === tab
                      ? "border-white text-white bg-gray-800 dark:bg-gray-700"
                      : "border-transparent text-gray-300 hover:text-white hover:bg-gray-800 dark:hover:bg-gray-700"
                  }`}
                >
                  {tab}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                console.log("🔄 Dark mode button clicked");
                toggleDarkMode();
              }}
              className="text-gray-300 hover:text-white transition-colors"
              title={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {isDarkMode ? (
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
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
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
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            <button
              onClick={() => {
                console.log("➕ Quick add button clicked");
                setShowQuickAddEdit(true);
              }}
              className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1"
              title="Quick Add/Edit Task"
            >
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="hidden sm:inline text-sm">Quick Add</span>
            </button>

            <TimeAvailabilityReport />
            <div className="text-gray-400 text-sm">Time Report Disabled</div>
          </div>
        </nav>

        <main className="flex-1 flex items-center justify-center p-4">
          {isLoading && (
            <div className="text-gray-900 dark:text-gray-100">
              <p>Loading {activeTab} tree...</p>
              <p className="text-sm mt-2">
                Query status: {isLoading ? "Loading" : "Done"}
              </p>
              {console.log("🔄 Rendering loading state")}
            </div>
          )}
          {error && (
            <div className="text-red-600 dark:text-red-400">
              <p>Error loading {activeTab} tree</p>
              <p className="text-sm mt-2">
                Error details: {error?.message || "Unknown error"}
              </p>
              {console.error("❌ Rendering error state:", error)}
            </div>
          )}
          {tree && !isLoading && !error && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {activeTab} Org Chart
              </h2>
              <div className="text-gray-600 dark:text-gray-300 space-y-2">
                <p>Tree data loaded successfully!</p>
                <p>Tree ID: {tree.id}</p>
                <p>Tree Name: {tree.name}</p>
                <p>Children Count: {tree.children?.length || 0}</p>
                <OrgChartTab tree={tree} tabName={activeTab} />
              </div>
              {console.log("✅ Rendering tree data:", tree)}
            </div>
          )}
          {!isLoading && !error && !tree && (
            <div className="text-gray-600 dark:text-gray-300">
              <p>No tree data available</p>
              {console.log("⚠️ No tree data state")}
            </div>
          )}
        </main>

        {showQuickAddEdit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4">Quick Add/Edit (Debug)</h3>
              <p>Modal would appear here</p>
              <button
                onClick={() => {
                  console.log("❌ Closing quick add modal");
                  setShowQuickAddEdit(false);
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}
        <QuickAddEditModal
          isOpen={showQuickAddEdit}
          onClose={() => setShowQuickAddEdit(false)}
        />
      </div>
    </QueryClientProvider>
  );
}

export default function OrgChartRoute() {
  return (
    <QueryClientProvider client={queryClient}>
      <OrgChartContent />
    </QueryClientProvider>
  );
}
