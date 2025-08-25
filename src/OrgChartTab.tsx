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
  calculateUrgencyLevel,
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

// Helper function to find the deepest visible node that should show urgency balls
function findDeepestUrgencyAnimationTarget(
  node: OrgNode,
  openMap: Record<string, boolean>,
  basePath: string
): string | null {
  const currentPath = basePath ? `${basePath}/${node.name}` : `/${node.name}`;
  const effectiveUrgency = getEffectiveUrgency(node);

  // If this node doesn't have urgency > 1, it and its children can't be targets
  if (effectiveUrgency <= 1) return null;

  // If this is a task with urgency > 1, it should animate
  if (node.type === "task") return currentPath;

  // If this is a closed category with urgency > 1, it should animate
  const isOpen = openMap[currentPath];
  if (!isOpen) return currentPath;

  // If this category is open, check its children for deeper targets
  if (node.children) {
    for (const child of node.children) {
      const childTarget = findDeepestUrgencyAnimationTarget(
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
  const [importance, setImportance] = useState(modalTask?.importance ?? 1);

  // New deadline-related states
  const [deadline, setDeadline] = useState(modalTask?.deadline ?? "");
  const [completionTime, setCompletionTime] = useState(
    modalTask?.completion_time ?? 1
  );
  const [uniqueDaysRequired, setUniqueDaysRequired] = useState(
    modalTask?.unique_days_required ?? 1
  );

  const addNodeMutation = useAddOrgNode(tabName);
  const editNodeMutation = useEditOrgNode(tabName);
  const deleteNodeMutation = useDeleteOrgNode(tabName);

  // Ref for modal GSAP animation
  const modalRef = useRef<HTMLDivElement>(null);

  // Calculate current urgency level for modal animation
  const currentUrgencyLevel =
    modalTask?.type === "task"
      ? calculateUrgencyLevel(deadline, completionTime, uniqueDaysRequired)
      : 1;

  // GSAP animation for modal urgency or importance level 10
  useGSAP(() => {
    if (
      modalTask?.type === "task" &&
      (currentUrgencyLevel === 10 || importance === 10)
    ) {
      gsap.to(modalRef.current, {
        scale: 1.02,
        duration: 1,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1,
      });
    }
  }, [modalTask, currentUrgencyLevel, importance]);

  const handleAddNode = (newNode: {
    name: string;
    type: "category" | "task";
    details?: string;
    importance?: number;
    deadline?: string;
    completion_time?: number;
    unique_days_required?: number;
  }) => {
    const mutationData = {
      ...newNode,
      parent_id: tree.id,
      tab_name: tabName,
      root_category: tabName,
    };

    addNodeMutation.mutate(mutationData);
  };

  // Helper to format date for input[type="date"]
  const formatDateForInput = (date?: string) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  useEffect(() => {
    setDetails(modalTask?.details ?? "");
    setImportance(modalTask?.importance ?? 1);
    setDeadline(modalTask?.deadline ?? "");
    setCompletionTime(modalTask?.completion_time ?? 1);
    setUniqueDaysRequired(modalTask?.unique_days_required ?? 1);
  }, [modalTask]);

  useEffect(() => {
    if (!modalTask) return;
    const timeout = setTimeout(() => {
      if (
        details !== modalTask.details ||
        importance !== modalTask.importance ||
        deadline !== modalTask.deadline ||
        completionTime !== modalTask.completion_time ||
        uniqueDaysRequired !== modalTask.unique_days_required
      ) {
        editNodeMutation.mutate({
          id: modalTask.id,
          details,
          importance: modalTask.type === "task" ? importance : undefined,
          deadline: modalTask.type === "task" ? deadline : undefined,
          completion_time:
            modalTask.type === "task" ? completionTime : undefined,
          unique_days_required:
            modalTask.type === "task" ? uniqueDaysRequired : undefined,
        });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeout);
  }, [
    details,
    importance,
    deadline,
    completionTime,
    uniqueDaysRequired,
    modalTask,
    editNodeMutation,
  ]);

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

    // Animate urgency balls for only the deepest visible nodes
    const animateUrgencyBalls = () => {
      // First, collect all urgency targets (deepest nodes that should show balls)
      const urgencyTargets = new Set<string>();

      if (tree.children) {
        for (const child of tree.children) {
          const urgencyTargetPath = findDeepestUrgencyAnimationTarget(
            child,
            openMap,
            `/${tabName}`
          );
          if (urgencyTargetPath) {
            urgencyTargets.add(urgencyTargetPath);
          }
        }
      }

      // Find all nodes with urgency balls
      const urgencyBalls = document.querySelectorAll("[data-urgency-ball]");

      urgencyBalls.forEach((ball) => {
        const path = ball.getAttribute("data-urgency-ball");
        if (!path) return;

        // Only animate balls for nodes that are deepest targets
        if (!urgencyTargets.has(path)) {
          // Hide balls that shouldn't be animated
          gsap.set(ball, { opacity: 0 });
          return;
        }

        // Show and animate balls for deepest targets
        gsap.set(ball, { opacity: 1 });

        // Find the corresponding container
        const container = document.querySelector(`[data-node-path="${path}"]`);
        if (!container) return;

        // Get the urgency level from the container
        const urgencyLevel = parseInt(
          container.getAttribute("data-urgency") || "1"
        );

        if (!shouldShowUrgencyBall(urgencyLevel)) return;

        // Create the border-following path
        const borderPath = createUrgencyOrbitalPath(container, urgencyLevel);
        const motionConfig = getUrgencyMotionConfig(urgencyLevel);

        // Position the ball relative to the container's coordinate system
        gsap.set(ball, {
          position: "absolute",
          left: 0,
          top: 0,
          xPercent: -50, // Center the ball on the path
          yPercent: -50,
        });

        // Animate along the border path
        gsap.to(ball, {
          motionPath: {
            path: borderPath,
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
            className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative max-h-[90vh] overflow-y-auto"
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

                <div className="mb-4">
                  <label className="block mb-2 font-semibold text-gray-700">
                    Deadline:
                  </label>
                  <input
                    className="w-full text-black p-2 border rounded"
                    type="date"
                    value={formatDateForInput(deadline)}
                    onChange={(e) => {
                      setDeadline(e.target.value);
                      editNodeMutation.mutate({
                        id: modalTask.id,
                        deadline: e.target.value,
                      });
                      setModalTask({ ...modalTask, deadline: e.target.value });
                    }}
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2 font-semibold text-gray-700">
                    Estimated Completion Time (hours):
                  </label>
                  <input
                    className="w-full text-black p-2 border rounded"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={completionTime}
                    onChange={(e) => {
                      const newCompletionTime = Number(e.target.value);
                      setCompletionTime(newCompletionTime);
                      editNodeMutation.mutate({
                        id: modalTask.id,
                        completion_time: newCompletionTime,
                      });
                      setModalTask({
                        ...modalTask,
                        completion_time: newCompletionTime,
                      });
                    }}
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2 font-semibold text-gray-700">
                    Unique Days Required:
                  </label>
                  <input
                    className="w-full text-black p-2 border rounded"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={uniqueDaysRequired}
                    onChange={(e) => {
                      const newUniqueDaysRequired = Number(e.target.value);
                      setUniqueDaysRequired(newUniqueDaysRequired);
                      editNodeMutation.mutate({
                        id: modalTask.id,
                        unique_days_required: newUniqueDaysRequired,
                      });
                      setModalTask({
                        ...modalTask,
                        unique_days_required: newUniqueDaysRequired,
                      });
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Number of separate days needed to complete this task
                  </p>
                </div>

                {/* Show calculated urgency level */}
                <div className="mb-4 p-3 bg-gray-100 rounded">
                  <label className="block mb-1 font-semibold text-gray-700">
                    Calculated Urgency Level:
                  </label>
                  <div className="text-lg font-bold text-blue-600">
                    Level {currentUrgencyLevel}
                  </div>
                  {deadline && completionTime && uniqueDaysRequired && (
                    <p className="text-xs text-gray-600 mt-1">
                      Based on deadline, completion time, and unique days
                      required
                    </p>
                  )}
                </div>
              </>
            )}

            <label className="block mb-2 font-semibold text-gray-700">
              Details:
            </label>
            <textarea
              className="w-full text-black p-2 border rounded mb-4"
              rows={4}
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
