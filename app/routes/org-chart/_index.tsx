// app/routes/org-chart/_index.tsx
import { useState } from "react";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MobileNav from "../../components/MobileNav";
import DesktopNav from "../../components/DesktopNav";

import { useIsMobile } from "../../hooks/useIsMobile";
import QuickAddEditModal from "../../components/tasks/QuickAddEditModal";
import TasksDueToday from "../../components/tasks/TasksDueToday";
import MobileTimeReportModal from "../../components/ui/MobileTimeReportModal";
import MobileHamburgerMenu from "../../components/ui/MobileHamburgerMenu";
import CategoryList from "../../components/categories/CategoryList";

const queryClient = new QueryClient();

function OrgChartHomepageContent() {
  const isMobile = useIsMobile();

  // Modal states
  const [showTasksDueToday, setShowTasksDueToday] = useState(false);
  const [showQuickAddEdit, setShowQuickAddEdit] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>(
    undefined,
  );
  const [showTimeReport, setShowTimeReport] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);

  // Handler for clicking on a recent task
  const handleRecentTaskClick = (task: { id: number }) => {
    setSelectedTaskId(task.id);
    setShowQuickAddEdit(true);
  };

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

      {/* Header */}
      <div className="border-b border-gray-700/50 bg-gray-900/95 px-6 py-8 dark:border-gray-600/50 dark:bg-gray-800/95">
        <div className="mx-auto max-w-[1400px]">
          <h1 className="text-3xl font-bold text-white">Organization Chart</h1>
          <p className="mt-2 text-gray-400">
            Manage your categories and track tasks across all areas of your life
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="main p-4">
        <div className="mx-auto max-w-[1400px] px-2 py-4">
          {/* Category Management - Now with full CRUD functionality */}
          <CategoryList />
        </div>
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
          activeTab=""
        />
      )}
    </div>
  );
}

export default function OrgChartHomepage() {
  return (
    <ProtectedRoute>
      <QueryClientProvider client={queryClient}>
        <OrgChartHomepageContent />
      </QueryClientProvider>
    </ProtectedRoute>
  );
}
