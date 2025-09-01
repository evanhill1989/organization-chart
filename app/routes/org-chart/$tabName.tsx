// Updated app/routes/org-chart/$tabName.tsx with mobile-friendly nav
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

// Mobile Navigation Components
function MobileHamburgerMenu({
  isOpen,
  onClose,
  activeTab,
}: {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Menu Panel */}
      <div className="fixed top-0 left-0 h-full w-80 bg-gray-900 dark:bg-gray-800 shadow-xl transform transition-transform">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Navigation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <div className="p-4">
          <Link
            to="/"
            className="block py-3 px-4 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors mb-2"
            onClick={onClose}
          >
            ← Home
          </Link>

          <div className="border-t border-gray-700 pt-4 mt-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
              Categories
            </h3>
            <div className="space-y-1">
              {TABS.map((tab) => (
                <Link
                  key={tab}
                  to={`/org-chart/${tab}`}
                  onClick={onClose}
                  className={`block py-3 px-4 rounded transition-colors ${
                    activeTab === tab
                      ? "bg-gray-700 text-white border-l-4 border-blue-500"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  {tab}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileTimeReportModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="fixed inset-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col max-h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Time Report
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <TimeAvailabilityReport />
        </div>
      </div>
    </div>
  );
}

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

  // Mobile menu states
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [showQuickAddEdit, setShowQuickAddEdit] = useState(false);
  const [showMobileTimeReport, setShowMobileTimeReport] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
      {/* Navigation */}
      <nav className="bg-gray-900 dark:bg-gray-800 sticky top-0 z-40">
        {isMobile ? (
          // Mobile Navigation
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left: Hamburger Menu */}
            <button
              onClick={() => setShowHamburgerMenu(true)}
              className="text-gray-300 hover:text-white p-2 rounded transition-colors"
              aria-label="Open navigation menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Right: Action buttons */}
            <div className="flex items-center space-x-2">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="text-gray-300 hover:text-white p-2 rounded transition-colors"
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

              {/* Time Report */}
              <button
                onClick={() => setShowMobileTimeReport(true)}
                className="text-gray-300 hover:text-white p-2 rounded transition-colors"
                title="Time Report"
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>

              {/* Quick Add */}
              <button
                onClick={() => setShowQuickAddEdit(true)}
                className="text-gray-300 hover:text-white p-2 rounded transition-colors"
                title="Quick Add Task"
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
              </button>
            </div>
          </div>
        ) : (
          // Desktop Navigation (unchanged)
          <div className="flex justify-between items-center px-4">
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
          </div>
        )}
      </nav>

      {/* Main Content */}
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

      {/* Mobile Modals */}
      <MobileHamburgerMenu
        isOpen={showHamburgerMenu}
        onClose={() => setShowHamburgerMenu(false)}
        activeTab={activeTab}
      />

      <MobileTimeReportModal
        isOpen={showMobileTimeReport}
        onClose={() => setShowMobileTimeReport(false)}
      />

      {/* Shared Modals */}
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
