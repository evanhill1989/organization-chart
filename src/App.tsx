import { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import OrgChartTab from "./OrgChartTab";

import type { OrgNode } from "./types/orgChart";
import { fetchOrgTree } from "./lib/fetchOrgTree";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import QuickAddEditModal from "./components/QuickAddEditModal";
import TimeAvailabilityReport from "./components/TimeAvailabilityReport";

gsap.registerPlugin(useGSAP);

const TABS = [
  "Household",
  "Finances",
  "Cleo",
  "Job",
  "Social",
  "Personal",
  "Orphans",
] as const;

export default function App() {
  // Dark mode state - simple implementation without context for now
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) {
      return JSON.parse(stored);
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", JSON.stringify(newMode));

    // Apply/remove dark class
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Apply dark mode on mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>(
    () =>
      (localStorage.getItem("activeTab") as (typeof TABS)[number]) ||
      "Household"
  );

  // Quick Add/Edit modal state - open by default on first load
  const [showQuickAddEdit, setShowQuickAddEdit] = useState(() => {
    // Check if user has seen the quick add modal before
    const hasSeenQuickAdd = localStorage.getItem("hasSeenQuickAdd");
    return !hasSeenQuickAdd; // Open by default if never seen
  });

  const handleCloseQuickAddEdit = () => {
    console.log("Closing Quick Add/Edit modal");
    setShowQuickAddEdit(false);
    // Mark that user has seen the quick add modal
    localStorage.setItem("hasSeenQuickAdd", "true");
  };

  const handleOpenQuickAddEdit = () => {
    console.log("Opening Quick Add/Edit modal");
    setShowQuickAddEdit(true);
  };

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  // React Query fetch for the active tab
  const {
    data: tree,
    isLoading,
    error,
    // isPlaceholderData,
  } = useQuery<OrgNode>({
    queryKey: ["orgTree", activeTab],
    queryFn: () => fetchOrgTree(activeTab),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="min-h-screen w-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
      <nav className="flex justify-between items-center bg-gray-900 dark:bg-gray-800 sticky top-0 z-10 px-4">
        {/* Tab Navigation */}
        <div className="flex justify-center items-center">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-lg font-medium border-b-2 transition-colors duration-200 ${
                activeTab === tab
                  ? "border-white text-white bg-gray-800 dark:bg-gray-700"
                  : "border-transparent text-gray-300 hover:text-white hover:bg-gray-800 dark:hover:bg-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right side nav items */}
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
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

          {/* Quick Add/Edit Button */}
          <button
            onClick={handleOpenQuickAddEdit}
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

          {/* Time Availability Report */}
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

      {console.log(
        "Rendering QuickAddEditModal with isOpen:",
        showQuickAddEdit
      )}
      <QuickAddEditModal
        isOpen={showQuickAddEdit}
        onClose={handleCloseQuickAddEdit}
      />
    </div>
  );
}
