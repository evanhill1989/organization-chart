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
import TasksDueToday from "../../components/TasksDueToday";
import MobileHamburgerMenu from "../../components/ui/MobileHamburgerMenu";
import MobileTimeReportModal from "../../components/ui/MobileTimeReportModal";
import DarkModeToggle from "../../components/ui/DarkModeToggle";
import TasksDueTodayButton from "../../components/TasksDueTodayButton";
import QuickAddButton from "../../components/QuickAddButton";

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
  const [showTasksDueToday, setShowTasksDueToday] = useState(false);

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
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
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
              <DarkModeToggle />

              <button
                onClick={() => setShowTasksDueToday(true)}
                className="text-gray-300 hover:text-white transition-colors flex items-center space-x-1"
                title="Tasks Due Today"
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="hidden sm:inline text-sm">Today</span>
              </button>
              {/* TimeAvailabilityReport */}
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

              <QuickAddButton onClick={() => setShowQuickAddEdit(true)} />
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
              <DarkModeToggle />
              <TasksDueTodayButton onClick={() => setShowTasksDueToday(true)} />

              <QuickAddButton
                onClick={() => setShowQuickAddEdit(true)}
                showLabel
                className="bg-gray-800 hover:bg-gray-700"
              />

              <TimeAvailabilityReport />
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex  p-4">
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

      <TasksDueToday
        isOpen={showTasksDueToday}
        onClose={() => setShowTasksDueToday(false)}
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
