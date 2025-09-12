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
      <div className="flex w-full flex-col items-center">
        <h2 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
          {node.name}
        </h2>

        {node.children && node.children.length > 0 ? (
          <div className="grid auto-cols-min grid-flow-col gap-8">
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
    <div
      className={`flex flex-col items-center w-full ${
        level === 0 ? "" : "mt-4"
      }`}
    >
      <div
        data-node-path={path}
        data-urgency={effectiveUrgency}
        className={`bg-white rounded-lg shadow-amber-600 min-w-[120px] text-center outline outline-gray-400 relative ${
          node.is_completed ? "opacity-60 bg-green-50" : ""
        } ${getImportanceBorderClasses(
          effectiveImportance
        )} ${getImportanceGlowClasses(effectiveImportance)}`}
      >
        {/* Urgency Ball */}
        {!node.is_completed && shouldShowUrgencyBall(effectiveUrgency) && (
          <div
            className={`absolute rounded-full pointer-events-none z-10 ${getUrgencyBallColor(
              effectiveUrgency
            )} ${getUrgencyBallSize(effectiveUrgency)} ${getUrgencyBallGlow(
              effectiveUrgency
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
            className={`text-lg font-semibold underline hover:text-blue-200 focus:outline-none w-full h-full p-2 rounded-lg ${
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
            className="text-lg text-white font-semibold w-full text-center focus:outline-none bg-gray-800 p-2 rounded-lg"
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
        <div className="grid gap-4 mt-4 w-full auto-cols-min grid-flow-col">
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

          <button
            className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold hover:bg-blue-700"
            onClick={() => setShowTaskForm(true)}
            title="Add Task"
            type="button"
          >
            +
          </button>
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