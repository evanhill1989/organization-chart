import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  shouldShowUrgencyBall,
  createUrgencyOrbitalPath,
  getUrgencyMotionConfig,
} from "../lib/urgencyUtils";
import {
  findAllUrgencyAnimationTargets,
  findDeepestImportanceAnimationTarget,
} from "../lib/animationTargets";
import {
  getEffectiveImportance,
  getImportanceShadowColor,
} from "../lib/importanceUtils";

interface UseOrgChartAnimationsProps {
  containerRef: React.RefObject<HTMLDivElement>;
  tree: any;
  openMap: Record<string, boolean>;
  tabName: string;
  isMobile: boolean;
}

export function useOrgChartAnimations({
  containerRef,
  tree,
  openMap,
  tabName,
  isMobile,
}: UseOrgChartAnimationsProps) {
  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      // --- Urgency Ball Animation ---
      const animateUrgencyBalls = () => {
        const urgencyTargets = new Set<string>();

        if (tree.children) {
          for (const child of tree.children) {
            const childTargets = findAllUrgencyAnimationTargets(
              child,
              openMap,
              `/${tabName}`
            );
            childTargets.forEach((t) => urgencyTargets.add(t));
          }
        }

        const urgencyBalls = container.querySelectorAll("[data-urgency-ball]");

        urgencyBalls.forEach((ball) => {
          const path = ball.getAttribute("data-urgency-ball");
          if (!path) return;

          if (!urgencyTargets.has(path)) {
            gsap.set(ball, { opacity: 0 });
            return;
          }

          gsap.set(ball, { opacity: 1 });

          const nodeContainer = container.querySelector(
            `[data-node-path="${path}"]`
          );
          if (!nodeContainer) return;

          const urgencyLevel = parseInt(
            nodeContainer.getAttribute("data-urgency") || "1"
          );
          if (!shouldShowUrgencyBall(urgencyLevel)) return;

          try {
            const borderPath = createUrgencyOrbitalPath(nodeContainer);
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
          } catch (err) {
            console.error(`GSAP: failed animating ball for ${path}`, err);
          }
        });
      };

      // --- Importance Highlight Animation ---
      const animateImportance = () => {
        if (!tree.children) return;

        for (const child of tree.children) {
          const importanceTargetPath = findDeepestImportanceAnimationTarget(
            child,
            openMap,
            `/${tabName}`
          );

          if (!importanceTargetPath) continue;

          const targetElement = container.querySelector(
            `[data-node-path="${importanceTargetPath}"]`
          );
          if (!targetElement) continue;

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
      };

      // Run animations after DOM/layout is ready
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          animateUrgencyBalls();
          animateImportance();
        });
      });
    },
    { scope: containerRef, dependencies: [tree, openMap, tabName, isMobile] }
  );
}
