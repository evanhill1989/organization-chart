// Updated app/routes/org-chart/$tabName.tsx with mobile-friendly nav
import { useState } from "react";
import { useParams, Navigate } from "react-router";
import {
  useQuery,
  keepPreviousData,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import OrgChartRoot from "../../components/OrgChartRoot";
import QuickAddEditModal from "../../components/tasks/QuickAddEditModal";
import ProtectedRoute from "../../components/auth/ProtectedRoute";

import type { OrgNode } from "../../types/orgChart";
import { fetchOrgTree } from "../../lib/fetchOrgTree";
import TasksDueToday from "../../components/tasks/TasksDueToday";
import MobileHamburgerMenu from "../../components/ui/MobileHamburgerMenu";
import MobileTimeReportModal from "../../components/ui/MobileTimeReportModal";

import { useIsMobile } from "../../hooks/useIsMobile";
import MobileNav from "../../components/MobileNav";
import DesktopNav from "../../components/DesktopNav";
import TimeAvailabilityReport from "../../components/TimeAvailabilityReport";
import SecondaryNav from "../../components/ui/SecondaryNav";

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
  const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>(
    undefined
  );
  const [showTimeReport, setShowTimeReport] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const isMobile = useIsMobile();

  // Handler for clicking on a recent task
  const handleRecentTaskClick = (task: { id: number }) => {
    setSelectedTaskId(task.id);
    setShowQuickAddEdit(true);
  };

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
    <div className="app-layout">
      {/* Navigation */}
      <nav className="nav sticky top-0 z-40 bg-gray-900 dark:bg-gray-800">
        {isMobile ? (
          <MobileNav
            onOpenTasksDueToday={() => setShowTasksDueToday(true)}
            onOpenTimeReport={() => setShowTimeReport(true)}
            onOpenQuickAdd={() => setShowQuickAddEdit(true)}
            onOpenHamburger={() => setShowHamburgerMenu(true)}
          />
        ) : (
          <DesktopNav
            onOpenTasksDueToday={() => setShowTasksDueToday(true)}
            onOpenQuickAdd={() => setShowQuickAddEdit(true)}
            onOpenHamburger={() => setShowHamburgerMenu(true)}
            onRecentTaskClick={handleRecentTaskClick}
          />
        )}
      </nav>

      {/* Secondary Navigation - Category Tabs (Desktop only) */}
      {!isMobile && (
        <div className="sticky top-[60px] z-30">
          <SecondaryNav activeTab={activeTab} variant="desktop" />
        </div>
      )}

      {/* Main Content */}
      <main className="main p-4">
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
        {tree && <OrgChartRoot tabName={activeTab} />}
      </main>

      {/* Desktop TimeAvailabilityReport aside */}
      {/* {!isMobile && <TimeAvailabilityReport />} */}

      {/* Mobile Modals (no change) */}
      {showTasksDueToday && (
        <TasksDueToday
          isOpen={showTasksDueToday}
          onClose={() => setShowTasksDueToday(false)}
        />
      )}
      {showQuickAddEdit && (
        <QuickAddEditModal
          isOpen={showQuickAddEdit}
          onClose={() => {
            setShowQuickAddEdit(false);
            setSelectedTaskId(undefined);
          }}
          initialTaskId={selectedTaskId}
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
    <ProtectedRoute>
      <QueryClientProvider client={queryClient}>
        <OrgChartContent />
      </QueryClientProvider>
    </ProtectedRoute>
  );
}
