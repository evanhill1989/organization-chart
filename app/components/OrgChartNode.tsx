// app/components/OrgChartNode.tsx (Updated with isRoot handling)
import { useState } from "react";
import type { OrgNode } from "../types/orgChart";
import TaskForm from "./tasks/TaskForm";

import {
  getEffectiveUrgency,
  getUrgencyBallColor,
  getUrgencyBallGlow,
  getUrgencyBallSize,
  shouldShowUrgencyBall,
} from "../lib/urgencyUtils";
import {
  getEffectiveImportance,
  getImportanceBorderClasses,
  getImportanceGlowClasses,
} from "../lib/importanceUtils";
import CategoryForm from "./ui/CategoryForm";

type OrgChartNodeProps = {
  node: OrgNode;
  level?: number;
  onTaskClick: (node: OrgNode) => void;
  openMap: Record<string, boolean>;
  toggleOpen: (path: string) => void;
  path: string;
  disableExpand?: boolean;
  isRoot?: boolean; // ✅ New prop for root-level handling
  categoryId?: string; // UUID of the category this node belongs to
  categoryName?: string; // Name of the category for display
};

export default function OrgChartNode({
  node,
  level = 0,
  onTaskClick,
  openMap,
  toggleOpen,
  path,
  disableExpand,
  isRoot = false,
  categoryId,
  categoryName,
}: OrgChartNodeProps) {
  const isTask = node.type === "task";
  const isOpen = openMap[path] || false;
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Calculate the effective urgency and importance
  const effectiveUrgency = getEffectiveUrgency(node);
  const effectiveImportance = getEffectiveImportance(node);

  const handleTaskFormClose = () => setShowTaskForm(false);
  const handleCategoryFormClose = () => setShowCategoryForm(false);

  // ✅ Handle root node differently (desktop only)
  if (isRoot) {
    return (
      <div className="grid auto-cols-min grid-flow-col gap-8">
        <h2 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
          {node.name}
        </h2>

        {node.children && node.children.length > 0 ? (
          <div className="node-with-children">
            {node.children.map((child) => (
              <OrgChartNode
                key={child.id}
                node={child}
                level={level + 1}
                onTaskClick={onTaskClick}
                openMap={openMap}
                toggleOpen={toggleOpen}
                path={`${path}/${child.name}`}
                disableExpand={disableExpand}
                isRoot={false}
                categoryId={categoryId || node.category_id}
                categoryName={categoryName || node.name}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              No items in this category yet.
            </p>
          </div>
        )}

        {/* Root level task form */}
        {showTaskForm && (
          <TaskForm
            parentId={node.id}
            parentName={node.name}
            categoryId={categoryId || node.category_id}
            tabName={categoryName || node.name}
            onCancel={handleTaskFormClose}
          />
        )}

        {showCategoryForm && (
          <CategoryForm
            parentId={node.id}
            parentName={node.name}
            categoryId={categoryId || node.category_id}
            tabName={categoryName || node.name}
            onCancel={handleTaskFormClose}
          />
        )}
      </div>
    );
  }

  // ✅ Regular node rendering (existing logic)
  return (
    <div className="flex w-full flex-col items-center">
      <div
        data-node-path={path}
        data-urgency={effectiveUrgency}
        className={`relative min-w-[120px] rounded-lg bg-white text-center shadow-amber-600 outline outline-gray-400 ${
          node.is_completed ? "bg-green-50 opacity-60" : ""
        } ${getImportanceBorderClasses(
          effectiveImportance,
        )} ${getImportanceGlowClasses(effectiveImportance)}`}
      >
        {/* Urgency Ball */}
        {!node.is_completed && shouldShowUrgencyBall(effectiveUrgency) && (
          <div
            className={`pointer-events-none absolute z-10 rounded-full ${getUrgencyBallColor(
              effectiveUrgency,
            )} ${getUrgencyBallSize(effectiveUrgency)} ${getUrgencyBallGlow(
              effectiveUrgency,
            )}`}
            data-urgency-ball={path}
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        )}

        {isTask ? (
          <button
            className={`h-full w-full rounded-lg p-2 text-lg font-semibold underline hover:text-blue-200 focus:outline-none ${
              node.is_completed
                ? "bg-green-600 text-white line-through"
                : "bg-blue-600 text-white"
            }`}
            onClick={() => onTaskClick(node)}
          >
            {node.name}
            {node.is_completed && <span className="ml-2 text-xs">✓</span>}
          </button>
        ) : (
          <button
            className="w-full rounded-lg bg-gray-800 p-2 text-center text-lg font-semibold text-white focus:outline-none"
            onClick={() => !disableExpand && toggleOpen(path)}
            type="button"
            disabled={disableExpand}
          >
            <span className="flex items-center justify-center gap-2">
              {node.name}
              {!disableExpand && (
                <span className="ml-1 text-gray-400">
                  {isOpen ? "▼" : "▶"}
                </span>
              )}
            </span>
          </button>
        )}
      </div>

      {/* Updated section for category children */}
      {!isTask && isOpen && !disableExpand && (
        <div className="mt-4 grid w-full auto-cols-min grid-flow-col gap-4">
          {node.children?.map((child) => (
            <OrgChartNode
              key={child.id}
              node={child}
              level={level + 1}
              onTaskClick={onTaskClick}
              openMap={openMap}
              toggleOpen={toggleOpen}
              path={`${path}/${child.name}`}
              disableExpand={disableExpand}
              isRoot={false}
              categoryId={categoryId}
              categoryName={categoryName}
            />
          ))}

          {/* Action buttons */}
          <div className="flex gap-2">
            {/* Add Task button */}
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white hover:bg-blue-700"
              onClick={() => setShowTaskForm(true)}
              title="Add Task"
              type="button"
            >
              +
            </button>

            {/* Add Category button */}
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-xl font-bold text-white hover:bg-green-700"
              onClick={() => setShowCategoryForm(true)}
              title="Add Category"
              type="button"
            >
              📁
            </button>

            {/* Delete Category button - only show if no children */}
            {(!node.children || node.children.length === 0) && (
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-xl font-bold text-white hover:bg-red-700"
                onClick={() => {
                  setShowDeleteConfirm(true);
                }}
                title="Delete Category"
                type="button"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      )}
      {/* Task form modal */}
      {showTaskForm && (
        <TaskForm
          parentId={node.id}
          parentName={node.name}
          categoryId={categoryId}
          tabName={categoryName}
          onCancel={handleTaskFormClose}
        />
      )}

      {showDeleteConfirm && (
        <div className="bg-opacity-50 fixed inset-0 z-[70] flex items-center justify-center bg-black">
          <div className="mx-4 max-w-sm rounded-lg bg-white p-6 text-black">
            <h3 className="mb-4 text-lg font-bold">Delete Category</h3>
            <p className="mb-4">
              Are you sure you want to delete "{node.name}"?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle delete logic here
                  setShowDeleteConfirm(false);
                }}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showCategoryForm && (
        <CategoryForm
          parentId={node.id}
          parentName={node.name}
          categoryId={categoryId}
          tabName={categoryName}
          onCancel={handleCategoryFormClose}
        />
      )}
    </div>
  );
}
