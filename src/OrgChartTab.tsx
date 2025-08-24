import { useState, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import type { OrgNode } from "./types/orgChart";
import AddNodeForm from "./AddNodeForm";
import OrgChartNode from "./OrgChartNode";
import { useAddOrgNode } from "./hooks/useAddOrgNode";
import { useDeleteOrgNode } from "./hooks/useDeleteOrgNode";
import { useEditOrgNode } from "./hooks/useEditOrgNode";
import {
  getEffectiveUrgency,
  shouldShowUrgencyBall,
  createUrgencyOrbitalPath,
  getUrgencyMotionConfig,
} from "./lib/urgencyUtils";
import {
  getEffectiveImportance,
  getImportanceShadowColor,
} from "./lib/importanceUtils";

// Register the MotionPathPlugin
gsap.registerPlugin(MotionPathPlugin);

type OrgChartTabProps = {
  tree: OrgNode;
  tabName: string;
};

// Helper function to find the deepest visible node that should animate for importance
function findDeepestImportanceAnimationTarget(
  node: OrgNode,
  openMap: Record<string, boolean>,
  basePath: string
): string | null {
  const currentPath = basePath ? `${basePath}/${node.name}` : `/${node.name}`;
  const effectiveImportance = getEffectiveImportance(node);

  // If this node doesn't have level 10 importance, it and its children can't be targets
  if (effectiveImportance !== 10) return null;

  // If this is a task with level 10 importance, it should animate
  if (node.type === "task") return currentPath;

  // If this is a closed category with level 10 importance, it should animate
  const isOpen = openMap[currentPath];
  if (!isOpen) return currentPath;

  // If this category is open, check its children for deeper targets
  if (node.children) {
    for (const child of node.children) {
      const childTarget = findDeepestImportanceAnimationTarget(
        child,
        openMap,
        currentPath
      );
      if (childTarget) return childTarget; // Return first found deep target
    }
  }

  return null; // This open category has no deeper targets
}

export default function OrgChartTab({ tree, tabName }: OrgChartTabProps) {
  const [modalTask, setModalTask] = useState<OrgNode | null>(null);
  const [details, setDetails] = useState(modalTask?.details ?? "");
  const [urgency, setUrgency] = useState(modalTask?.urgency ?? 1);
  const [importance, setImportance] = useState(modalTask?.importance ?? 1);
  const addNodeMutation = useAddOrgNode(tabName);
  const editNodeMutation = useEditOrgNode(tabName);
  const deleteNodeMutation = useDeleteOrgNode(tabName);

  // Ref for modal GSAP animation
  const modalRef = useRef<HTMLDivElement>(null);

  // GSAP animation for modal urgency or importance level 10
  useGSAP(() => {
    if (modalTask?.type === "task" && (urgency === 10 || importance === 10)) {
      gsap.to(modalRef.current, {
        scale: 1.02,
        duration: 1,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
      });
    }
  }, [modalTask, urgency, importance]);

  const handleAddNode = (newNode: {
    name: string;
    type: "category" | "task";
    details?: string;
    urgency?: number;
    importance?: number;
  }) => {
    const mutationData = {
      ...newNode,
      parent_id: tree.id,
      tab_name: tabName,
      root_category: tabName,
    };

    addNodeMutation.mutate(mutationData);
  };

  useEffect(() => {
    setDetails(modalTask?.details ?? "");
    setUrgency(modalTask?.urgency ?? 1);
    setImportance(modalTask?.importance ?? 1);
  }, [modalTask]);

  useEffect(() => {
    if (!modalTask) return;
    const timeout = setTimeout(() => {
      if (
        details !== modalTask.details ||
        urgency !== modalTask.urgency ||
        importance !== modalTask.importance
      ) {
        editNodeMutation.mutate({
          id: modalTask.id,
          details,
          urgency: modalTask.type === "task" ? urgency : undefined,
          importance: modalTask.type === "task" ? importance : undefined,
        });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeout);
  }, [details, urgency, importance, modalTask, editNodeMutation]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({
    [`/${tabName}`]: true,
  });

  const toggleOpen = (path: string) => {
    setOpenMap((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  // Global animation management
  useGSAP(() => {
    // Clear all existing animations first
    gsap.killTweensOf("*");
    gsap.set("*", { scale: 1, boxShadow: "none" });

    // Animate urgency balls for all visible nodes
    const animateUrgencyBalls = () => {
      // Find all nodes with urgency balls
      const urgencyBalls = document.querySelectorAll("[data-urgency-ball]");

      urgencyBalls.forEach((ball) => {
        const path = ball.getAttribute("data-urgency-ball");
        if (!path) return;

        // Find the corresponding container
        const container = document.querySelector(`[data-node-path="${path}"]`);
        if (!container) return;

        // Get the urgency level from the container
        const urgencyLevel = parseInt(
          container.getAttribute("data-urgency") || "1"
        );

        if (!shouldShowUrgencyBall(urgencyLevel)) return;

        // Create the sophisticated orbital path using MotionPathPlugin
        const orbitalPath = createUrgencyOrbitalPath(container, urgencyLevel);
        const motionConfig = getUrgencyMotionConfig(urgencyLevel);

        // Set initial position to start of path
        gsap.set(ball, {
          xPercent: -50,
          yPercent: -50,
        });

        // Animate along the custom orbital path
        gsap.to(ball, {
          motionPath: {
            path: orbitalPath,
            autoRotate: motionConfig.autoRotate,
            alignOrigin: [0.5, 0.5], // Center the ball on the path
          },
          duration: motionConfig.duration,
          ease: motionConfig.ease,
          repeat: motionConfig.repeat,
        });
      });
    };

    // Animate importance (level 10 scaling)
    const animateImportance = () => {
      if (tree.children) {
        for (const child of tree.children) {
          const importanceTargetPath = findDeepestImportanceAnimationTarget(
            child,
            openMap,
            `/${tabName}`
          );

          if (importanceTargetPath) {
            const targetSelector = `[data-node-path="${importanceTargetPath}"]`;
            const targetElement = document.querySelector(targetSelector);

            if (targetElement) {
              const effectiveImportance = getEffectiveImportance(child);
              const shadowColor = getImportanceShadowColor(effectiveImportance);

              // Set the shadow
              gsap.set(targetElement, {
                boxShadow: `0 0 20px ${shadowColor}`,
              });

              // Animate the scale
              gsap.to(targetElement, {
                scale: 1.03,
                duration: 1.2,
                ease: "power2.inOut",
                yoyo: true,
                repeat: -1,
              });
            }
          }
        }
      }
    };

    // Small delay to ensure DOM is ready and elements are properly sized
    gsap.delayedCall(0.1, () => {
      animateUrgencyBalls();
      animateImportance();
    });
  }, [openMap, tree]);

  return (
    <div className="w-full max-w-4xl mx-auto p-8">
      <h2 className="text-3xl font-bold text-center mb-8">{tabName}</h2>
      <div className="grid gap-4 w-full auto-cols-min grid-flow-col">
        {/* Render all children of the top_category as siblings */}
        {tree.children?.map((child) => (
          <OrgChartNode
            key={child.name}
            node={child}
            onTaskClick={setModalTask}
            openMap={openMap}
            toggleOpen={toggleOpen}
            path={`/${tabName}/${child.name}`}
          />
        ))}

        {/* "+" button as a sibling */}
        <button
          className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold hover:bg-blue-700"
          onClick={() => setShowAddModal(true)}
          title="Add Node"
          type="button"
        >
          +
        </button>
      </div>

      {/* Modal for AddNodeForm */}
      {showAddModal && (
        <AddNodeForm
          parent_id={tree.id}
          tab_name={tabName}
          onAdd={handleAddNode}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Modal for task details */}
      {modalTask && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative"
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
              onClick={() => setModalTask(null)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-4">{modalTask.name}</h3>

            {modalTask.type === "task" && (
              <>
                <div className="mb-4">
                  <label className="block mb-2 font-semibold text-gray-700">
                    Urgency (1-10):
                  </label>
                  <select
                    className="w-full text-black p-2 border rounded"
                    value={urgency}
                    onChange={(e) => {
                      const newUrgency = Number(e.target.value);
                      setUrgency(newUrgency);
                      editNodeMutation.mutate({
                        id: modalTask.id,
                        urgency: newUrgency,
                      });
                      setModalTask({ ...modalTask, urgency: newUrgency });
                    }}
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block mb-2 font-semibold text-gray-700">
                    Importance (1-10):
                  </label>
                  <select
                    className="w-full text-black p-2 border rounded"
                    value={importance}
                    onChange={(e) => {
                      const newImportance = Number(e.target.value);
                      setImportance(newImportance);
                      editNodeMutation.mutate({
                        id: modalTask.id,
                        importance: newImportance,
                      });
                      setModalTask({ ...modalTask, importance: newImportance });
                    }}
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <label className="block mb-2 font-semibold text-gray-700">
              Details:
            </label>
            <textarea
              className="w-full text-black p-2 border rounded mb-4"
              value={details}
              onChange={(e) => {
                setDetails(e.target.value);
                editNodeMutation.mutate({
                  id: modalTask.id,
                  details: e.target.value,
                });
                setModalTask({ ...modalTask, details: e.target.value });
              }}
            />

            <button
              className="mt-6 bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700"
              onClick={() => {
                deleteNodeMutation.mutate(modalTask.id);
                setModalTask(null);
              }}
            >
              Delete Task
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
