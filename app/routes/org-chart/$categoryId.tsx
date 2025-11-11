// app/routes/org-chart/$categoryId.tsx
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

import { useCategoriesQuery } from "../../hooks/useCategoriesQuery";
import { QUERY_KEYS } from "../../lib/queryKeys";

const queryClient = new QueryClient();

function OrgChartContent() {
  const { categoryId } = useParams();
  const isMobile = useIsMobile();

  // Modal states
  const [showTasksDueToday, setShowTasksDueToday] = useState(false);
  const [showQuickAddEdit, setShowQuickAddEdit] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>(
    undefined,
  );
  const [showTimeReport, setShowTimeReport] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);

  // Fetch user's categories for validation
  const { data: categories, isLoading: categoriesLoading } =
    useCategoriesQuery();

  // Handler for clicking on a recent task
  const handleRecentTaskClick = (task: { id: number }) => {
    setSelectedTaskId(task.id);
    setShowQuickAddEdit(true);
  };

  // Fetch org tree for the selected category
  const {
    data: tree,
    isLoading: treeLoading,
    error,
  } = useQuery<OrgNode>({
    queryKey: QUERY_KEYS.orgTree(categoryId || ""),
    queryFn: () => fetchOrgTree(categoryId || ""),
    placeholderData: keepPreviousData,
    enabled: !!categoryId && !categoriesLoading, // Only fetch if categoryId exists and categories are loaded
  });

  // Loading state for categories
  if (categoriesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-gray-400">Loading categories...</div>
      </div>
    );
  }

  // Validate categoryId exists in user's categories
  const validCategory = categories?.find((cat) => cat.id === categoryId);

  if (!categoryId || !validCategory) {
    // If categoryId is invalid or not found, redirect to homepage
    return <Navigate to="/org-chart" replace />;
  }

  // Get the category name for display
  const categoryName = validCategory.name;

  return (
    <div className="app-layout">
      {/* Navigation */}
      <nav className="nav bg-gray-900 dark:bg-gray-800">
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

      {/* Main Content */}
      <main className="main p-4">
        {treeLoading && (
          <div className="text-gray-900 dark:text-gray-100">
            Loading {categoryName} tree...
          </div>
        )}
        {error && (
          <div className="text-red-600 dark:text-red-400">
            Error loading {categoryName} tree:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </div>
        )}
        {tree && <OrgChartRoot categoryId={categoryId} />}
      </main>

      {/* Modals */}
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
          activeTab={categoryId}
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
