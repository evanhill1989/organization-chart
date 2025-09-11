// Updated app/routes/org-chart/$tabName.tsx with mobile-friendly nav
import { useState } from "react";
import { useParams, Navigate } from "react-router";
import {
  useQuery,
  keepPreviousData,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import OrgChartTab from "../../components/OrgChartTab";
import QuickAddEditModal from "../../components/tasks/QuickAddEditModal";

import type { OrgNode } from "../../types/orgChart";
import { fetchOrgTree } from "../../lib/fetchOrgTree";
import TasksDueToday from "../../components/tasks/TasksDueToday";
import MobileHamburgerMenu from "../../components/ui/MobileHamburgerMenu";
import MobileTimeReportModal from "../../components/ui/MobileTimeReportModal";

import { useIsMobile } from "../../hooks/useIsMobile";
import MobileNav from "../../components/MobileNav";
import DesktopNav from "../../components/DesktopNav";

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

  const [showTasksDueToday, setShowTasksDueToday] = useState(false);

  // Mobile menu states

  const [showQuickAddEdit, setShowQuickAddEdit] = useState(false);
  const [showTimeReport, setShowTimeReport] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const isMobile = useIsMobile();

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
    <div className="flex min-h-screen w-screen flex-col bg-white transition-colors dark:bg-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-gray-900 dark:bg-gray-800">
        {isMobile ? (
          // Mobile Navigation
          <MobileNav
            onOpenTasksDueToday={() => setShowTasksDueToday(true)}
            onOpenQuickAdd={() => setShowQuickAddEdit(true)}
            onOpenTimeReport={() => setShowTimeReport(true)}
            onOpenHamburger={() => setShowHamburgerMenu(true)}
          />
        ) : (
          // Desktop Navigation (unchanged)
          <DesktopNav
            onOpenTasksDueToday={() => setShowTasksDueToday(true)}
            onOpenQuickAdd={() => setShowQuickAddEdit(true)}
            activeTab={activeTab}
          />
        )}
      </nav>

      {/* Main Content */}
      <main className="flex flex-1 p-4">
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
      {showTasksDueToday && (
        <TasksDueToday
          isOpen={showTasksDueToday}
          onClose={() => setShowTasksDueToday(false)}
        />
      )}

      {showQuickAddEdit && (
        <QuickAddEditModal
          isOpen={showQuickAddEdit}
          onClose={() => setShowQuickAddEdit(false)}
        />
      )}

      {showTimeReport && (
        <MobileTimeReportModal
          isOpen={showTimeReport}
          onClose={() => setShowTimeReport(false)}
        />
      )}

      {showHamburgerMenu && (
        <MobileHamburgerMenu
          isOpen={showHamburgerMenu}
          onClose={() => setShowHamburgerMenu(false)}
          activeTab={activeTab}
        />
      )}
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
