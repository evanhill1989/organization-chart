import { useState } from "react";

import { useAddOrgNode } from "../hooks/useAddOrgNode";
import type { OrgNode } from "../types/orgChart";
import AddNodeForm from "./AddNodeForm";

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
};

export default function OrgChartNode({
  node,
  level = 0,
  onTaskClick,
  openMap,
  toggleOpen,
  path,
}: OrgChartNodeProps) {
  const isTask = node.type === "task";
  const isOpen = openMap[path] || false;
  const addNodeMutation = useAddOrgNode(node.root_category);
  const [showAddModal, setShowAddModal] = useState(false);

  // Calculate the effective urgency and importance
  const effectiveUrgency = getEffectiveUrgency(node);
  const effectiveImportance = getEffectiveImportance(node);

  const handleAddNode = (newNode: {
    name: string;
    type: "category" | "task";
    details?: string;
    urgency?: number;
    importance?: number;
  }) => {
    const mutationData = {
      ...newNode,
      parent_id: node.id,
      tab_name: node.tab_name ?? "",
      root_category: node.root_category,
    };

    addNodeMutation.mutate(mutationData);
  };

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
        {/* Urgency Ball - positioned absolutely to orbit around the node */}
        {!node.is_completed && shouldShowUrgencyBall(effectiveUrgency) && (
          <div
            className={`absolute rounded-full pointer-events-none z-10 ${getUrgencyBallColor(
              effectiveUrgency
            )} ${getUrgencyBallSize(effectiveUrgency)} ${getUrgencyBallGlow(
              effectiveUrgency
            )}`}
            data-urgency-ball={path}
            style={{
              // Initial position - will be animated by GSAP
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
            onClick={() => toggleOpen(path)}
            type="button"
          >
            <span className="flex items-center justify-center gap-2">
              {node.name}
              <span className="ml-1 text-gray-400">{isOpen ? "▼" : "▶"}</span>
            </span>
          </button>
        )}
      </div>

      {/* Always render the children grid when expanded, even if empty */}
      {!isTask && isOpen && (
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
            />
          ))}

          {/* "+" button as a sibling to children */}
          <button
            className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold hover:bg-blue-700"
            onClick={() => setShowAddModal(true)}
            title="Add Node"
            type="button"
          >
            +
          </button>
        </div>
      )}

      {/* Modal for AddNodeForm */}
      {showAddModal && (
        <AddNodeForm
          parent_id={node.id}
          tab_name={node.tab_name ?? ""}
          onAdd={handleAddNode}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
