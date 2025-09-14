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

type OrgChartNodeProps = {
  node: OrgNode;
  level?: number;
  onTaskClick: (node: OrgNode) => void;
  openMap: Record<string, boolean>;
  toggleOpen: (path: string) => void;
  path: string;
  disableExpand?: boolean;
  isRoot?: boolean; // ✅ New prop for root-level handling
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
}: OrgChartNodeProps) {
  const isTask = node.type === "task";
  const isOpen = openMap[path] || false;
  const [showTaskForm, setShowTaskForm] = useState(false);

  // Calculate the effective urgency and importance
  const effectiveUrgency = getEffectiveUrgency(node);
  const effectiveImportance = getEffectiveImportance(node);

  const handleTaskFormClose = () => setShowTaskForm(false);

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
                key={child.name}
                node={child}
                level={level + 1}
                onTaskClick={onTaskClick}
                openMap={openMap}
                toggleOpen={toggleOpen}
                path={`${path}/${child.name}`}
                disableExpand={disableExpand}
                isRoot={false}
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
            rootCategory={node.root_category}
            tabName={node.root_category}
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

      {/* Children and add button */}
      {!isTask && isOpen && !disableExpand && (
        <div className="mt-4 grid grid-cols-2 grid-rows-1">
          <div className="grid w-full auto-cols-min grid-flow-col gap-x-4">
            {node.children?.map((child) => (
              <OrgChartNode
                key={child.name}
                node={child}
                level={level + 1}
                onTaskClick={onTaskClick}
                openMap={openMap}
                toggleOpen={toggleOpen}
                path={`${path}/${child.name}`}
                disableExpand={disableExpand}
                isRoot={false}
              />
            ))}
            {/* Add Category + Add Task buttons */}
            <div className="mb-4 flex justify-end gap-4 align-bottom">
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
                <span>Task</span>
              </button>
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
                <span>Category</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task form modal */}
      {showTaskForm && (
        <TaskForm
          parentId={node.id}
          parentName={node.name}
          rootCategory={node.root_category}
          tabName={node.root_category}
          onCancel={handleTaskFormClose}
        />
      )}
    </div>
  );
}
