import { useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import type { OrgNode } from "./types/orgChart";
import AddNodeForm from "./AddNodeForm";
import OrgChartNode from "./OrgChartNode";
import TaskDetailsModal from "./components/TaskDetailsModal";
import { useAddOrgNode } from "./hooks/useAddOrgNode";
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({
    [`/${tabName}`]: true,
  });

  const addNodeMutation = useAddOrgNode(tabName);

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

      {/* Task Details Modal */}

      <TaskDetailsModal task={modalTask} onClose={() => setModalTask(null)} />
    </div>
  );
}
