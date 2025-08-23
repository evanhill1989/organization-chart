import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import type { OrgNode } from "./types/orgChart";
import AddNodeForm from "./AddNodeForm";
import { useAddOrgNode } from "./hooks/useAddOrgNode";
import {
  getUrgencyBorderClasses,
  getUrgencyGlowClasses,
  getEffectiveUrgency,
} from "./lib/urgencyUtils";

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

  // Calculate the effective urgency (own urgency for tasks, max child urgency for categories)
  const effectiveUrgency = getEffectiveUrgency(node);

  // Ref for GSAP animation
  const nodeRef = useRef<HTMLDivElement>(null);

  // GSAP animation for urgency level 10
  useGSAP(() => {
    if (effectiveUrgency === 10) {
      gsap.to(nodeRef.current, {
        scale: 1.05,
        duration: 0.8,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
      });
    }
  }, [effectiveUrgency]);

  const handleAddNode = (newNode: {
    name: string;
    type: "category" | "task";
    details?: string;
    urgency?: number;
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
        ref={nodeRef}
        className={`bg-white rounded-lg shadow min-w-[120px] text-center outline outline-gray-400 relative ${getUrgencyBorderClasses(
          effectiveUrgency
        )} ${getUrgencyGlowClasses(effectiveUrgency)}`}
      >
        {isTask ? (
          <button
            className="text-lg text-white font-semibold underline hover:text-blue-200 focus:outline-none bg-blue-600 w-full h-full p-2 rounded-lg"
            onClick={() => onTaskClick(node)}
          >
            {node.name}
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
        <div className="grid gap-4 mt-4 w-full auto-cols-min grid-flow-col outline-2 outline-amber-300">
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
