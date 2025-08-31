// app/routes/org-chart/$tabName.tsx - Clean version
import { useState, useEffect } from "react";
import { Link, useParams, Navigate } from "react-router";
import {
  useQuery,
  keepPreviousData,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

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
  const { tabName } = useParams();
  const activeTab = tabName || "Household";

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) {
      return JSON.parse(stored);
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const [showQuickAddEdit, setShowQuickAddEdit] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const {
    data: tree,
    isLoading,
    error,
  } = useQuery<OrgNode>({
    queryKey: ["orgTree", activeTab],
    queryFn: () => fetchOrgTree(activeTab),
    placeholderData: keepPreviousData,
  });

  // Validate tab name and redirect if invalid (after all hooks)
  if (tabName && !TABS.includes(tabName as (typeof TABS)[number])) {
    return <Navigate to="/org-chart/Household" replace />;
  }

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", JSON.stringify(newMode));

    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
      <nav className="flex justify-between items-center bg-gray-900 dark:bg-gray-800 sticky top-0 z-10 px-4">
        <div className="flex justify-center items-center">
          <Link
            to="/"
            className="px-4 py-3 text-lg font-medium text-gray-300 hover:text-white hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors mr-4"
          >
            ← Home
          </Link>
          {TABS.map((tab) => (
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
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="text-gray-300 hover:text-white transition-colors"
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
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
            onClick={() => setShowQuickAddEdit(true)}
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
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-4">
        {isLoading && (
          <div className="text-gray-900 dark:text-gray-100">
            Loading {activeTab} tree...
          </div>
        )}
        {error && (
          <div className="text-red-600 dark:text-red-400">
            Error loading {activeTab} tree
          </div>
        )}
        {tree && <OrgChartTab tree={tree} tabName={activeTab} />}
      </main>

      <QuickAddEditModal
        isOpen={showQuickAddEdit}
        onClose={() => setShowQuickAddEdit(false)}
      />
    </div>
  );
}

export default function OrgChartRoute() {
  return (
    <QueryClientProvider client={queryClient}>
      <OrgChartContent />
    </QueryClientProvider>
  );
}
