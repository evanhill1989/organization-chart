import { useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import type { OrgNode } from "../types/orgChart";
import AddNodeForm from "./AddNodeForm";
import OrgChartNode from "./OrgChartNode";
import TaskDetailsModal from "./TaskDetailsModal";
import MobileOrgChart from "./MobileOrgChart";
import { useAddOrgNode } from "../hooks/useAddOrgNode";
import { useToggleOpen } from "../hooks/useToggleOpen"; // <-- new import
import { useIsMobile } from "../hooks/useIsMobile";

import {
  findAllUrgencyAnimationTargets,
  findDeepestImportanceAnimationTarget,
} from "../lib/animationTargets";
import {
  shouldShowUrgencyBall,
  createUrgencyOrbitalPath,
  getUrgencyMotionConfig,
} from "../lib/urgencyUtils";
import {
  getEffectiveImportance,
  getImportanceShadowColor,
} from "../lib/importanceUtils";

gsap.registerPlugin(MotionPathPlugin);

type OrgChartTabProps = {
  tree: OrgNode;
  tabName: string;
};

export default function OrgChartTab({ tree, tabName }: OrgChartTabProps) {
  const [modalTask, setModalTask] = useState<OrgNode | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({
    [`/${tabName}`]: true,
  });
  const isMobile = true;
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

  const toggleOpen = useToggleOpen(tree, tabName, setOpenMap); // <-- now from hook

  useGSAP(() => {
    gsap.killTweensOf("*");
    gsap.set("*", { scale: 1, boxShadow: "none" });

    const animateUrgencyBalls = () => {
      const urgencyTargets = new Set<string>();

      if (tree.children) {
        for (const child of tree.children) {
          const childTargets = findAllUrgencyAnimationTargets(
            child,
            openMap,
            `/${tabName}`
          );
          childTargets.forEach((target) => urgencyTargets.add(target));
        }
      }

      const urgencyBalls = document.querySelectorAll("[data-urgency-ball]");

      urgencyBalls.forEach((ball) => {
        const path = ball.getAttribute("data-urgency-ball");
        if (!path) return;

        if (!urgencyTargets.has(path)) {
          gsap.set(ball, { opacity: 0 });
          return;
        }

        gsap.set(ball, { opacity: 1 });

        const container = document.querySelector(`[data-node-path="${path}"]`);
        if (!container) return;

        const urgencyLevel = parseInt(
          container.getAttribute("data-urgency") || "1"
        );

        if (!shouldShowUrgencyBall(urgencyLevel)) return;

        const borderPath = createUrgencyOrbitalPath(container);
        const motionConfig = getUrgencyMotionConfig(urgencyLevel);

        gsap.set(ball, {
          position: "absolute",
          left: 0,
          top: 0,
          xPercent: -50,
          yPercent: -50,
        });

        gsap.to(ball, {
          motionPath: {
            path: borderPath,
            autoRotate: motionConfig.autoRotate,
            alignOrigin: [0.5, 0.5],
          },
          duration: motionConfig.duration,
          ease: motionConfig.ease,
          repeat: motionConfig.repeat,
        });
      });
    };

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

              gsap.set(targetElement, {
                boxShadow: `0 0 20px ${shadowColor}`,
              });

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

    gsap.delayedCall(0.1, () => {
      animateUrgencyBalls();
      animateImportance();
    });
  }, [openMap, tree, tabName]);

  return (
    <>
      {isMobile ? (
        <MobileOrgChart
          root={tree}
          tabName={tabName}
          onTaskClick={setModalTask}
          openMap={openMap}
          toggleOpen={toggleOpen}
        />
      ) : (
        <div className="w-full max-w-4xl mx-auto p-8">
          <h2 className="text-3xl font-bold text-center mb-8">{tabName}</h2>

          <div className="grid gap-4 w-full auto-cols-min grid-flow-col">
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

            <button
              className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold hover:bg-blue-700"
              onClick={() => setShowAddModal(true)}
              title="Add Node"
              type="button"
            >
              +
            </button>
          </div>

          {showAddModal && (
            <AddNodeForm
              parent_id={tree.id}
              tab_name={tabName}
              onAdd={handleAddNode}
              onClose={() => setShowAddModal(false)}
            />
          )}
        </div>
      )}

      <TaskDetailsModal task={modalTask} onClose={() => setModalTask(null)} />
    </>
  );
}
