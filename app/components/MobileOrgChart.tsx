// app/components/MobileOrgChart.tsx (Updated with Add Button)
import { useState } from "react";
import type { OrgNode } from "../types/orgChart";
import OrgChartNode from "./OrgChartNode";
import TaskForm from "./tasks/TaskForm";

type MobileOrgChartProps = {
  root: OrgNode;
  currentNode: OrgNode;
  activePath: string;
  setActivePath: (path: string) => void;
  onTaskClick: (node: OrgNode) => void;
  tabName: string;
};

export default function MobileOrgChart({
  currentNode,
  activePath,
  setActivePath,
  onTaskClick,
  tabName,
}: MobileOrgChartProps) {
  // ✅ Add state for task form
  const [showTaskForm, setShowTaskForm] = useState(false);

  // ✅ Pure functions - no state management
  const goForward = (child: OrgNode) => {
    const newPath = `${activePath}/${child.name}`;
    console.log(`Mobile: navigating forward to ${newPath}`);
    setActivePath(newPath);
  };

  const goBack = () => {
    const parentPath =
      activePath.split("/").slice(0, -1).join("/") || `/${tabName}`;
    console.log(`Mobile: navigating back to ${parentPath}`);
    setActivePath(parentPath);
  };

  // ✅ Handle task form close
  const handleTaskFormClose = () => setShowTaskForm(false);

  // ✅ Helper for breadcrumb display with safety checks
  const getBreadcrumb = () => {
    // Safety check for undefined activePath
    if (!activePath || typeof activePath !== "string") {
      console.warn(
        "MobileOrgChart: activePath is undefined or not a string:",
        activePath,
      );
      return tabName; // Fallback to just the tab name
    }

    try {
      return activePath.replace(`/${tabName}`, tabName).replace(/\//g, " → ");
    } catch (error) {
      console.error("Error generating breadcrumb:", error);
      return tabName; // Fallback to just the tab name
    }
  };

  // ✅ Additional safety checks
  if (!activePath) {
    console.error(
      "MobileOrgChart: activePath is required but was:",
      activePath,
    );
    return (
      <div className="mx-auto flex w-full max-w-md flex-col p-4">
        <div className="py-8 text-center text-red-600">
          Navigation error: Invalid path
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col p-4">
      <h2 className="mb-4 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
        {tabName}
      </h2>

      {/* Breadcrumb */}
      <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
        {getBreadcrumb()}
      </div>

      {/* Back button */}
      {activePath !== `/${tabName}` && (
        <button
          onClick={goBack}
          className="mb-4 text-left font-semibold text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← Back
        </button>
      )}

      {/* ✅ Add button - positioned prominently at top of children list */}
      {currentNode.type === "category" && (
        <div className="mb-4 flex justify-center">
          <button
            className="flex items-center justify-center space-x-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-blue-700 active:bg-blue-800"
            onClick={() => setShowTaskForm(true)}
            title="Add new task or category"
            type="button"
          >
            <svg
              className="h-5 w-5"
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
            <span>Add Task</span>
          </button>
        </div>
      )}

      {/* Children list */}
      <div className="flex flex-col gap-4">
        {currentNode.children?.map((child) => {
          const childPath = `${activePath}/${child.name}`;

          return (
            <div
              key={childPath}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex-1">
                <OrgChartNode
                  node={child}
                  level={1} // Always level 1 for mobile children
                  onTaskClick={onTaskClick}
                  openMap={{}} // ✅ No longer needed - empty object
                  toggleOpen={() => {}} // ✅ No longer needed - empty function
                  path={childPath}
                  disableExpand={true} // ✅ Disable desktop expand behavior
                  isRoot={false}
                />
              </div>

              {/* Forward navigation button */}
              {!child.is_completed && child.children?.length ? (
                <button
                  onClick={() => goForward(child)}
                  className="flex-shrink-0 rounded border border-blue-600 px-3 py-1 text-sm text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                >
                  Enter →
                </button>
              ) : null}
            </div>
          );
        })}

        {/* Empty state */}
        {!currentNode.children?.length && (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            No items in this category
            {currentNode.type === "category" && (
              <div className="mt-4">
                <button
                  className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                  onClick={() => setShowTaskForm(true)}
                >
                  Add First Task
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ✅ Task form modal */}
      {showTaskForm && (
        <TaskForm
          parentId={currentNode.id}
          parentName={currentNode.name}
          rootCategory={currentNode.root_category}
          tabName={currentNode.root_category}
          onCancel={handleTaskFormClose}
        />
      )}
    </div>
  );
}
