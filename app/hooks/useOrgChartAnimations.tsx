// app/hooks/useOrgChartAnimations.tsx (Updated)
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
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
import type { OrgNode } from "../types/orgChart";

interface UseOrgChartAnimationsProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  tree: OrgNode;
  openMap: Record<string, boolean>;
  tabName: string;
  isMobile: boolean;
  // ✅ NEW: Add mobile-specific navigation state
  activePath?: string; // Only needed for mobile
}

export function useOrgChartAnimations({
  containerRef,
  tree,
  openMap,
  tabName,
  isMobile,
  activePath, // ✅ NEW: Include mobile path in dependencies
}: UseOrgChartAnimationsProps) {
  useGSAP(
    () => {
      const container = containerRef?.current;
      if (!container) {
        console.log("🔍 GSAP: No container found, skipping animations");
        return;
      }

      // ✅ Clear ALL existing animations first
      gsap.killTweensOf("*");
      gsap.set("*", { clearProps: "all" });

      // ✅ Add a small delay to ensure DOM is ready after navigation
      const animationTimeout = setTimeout(() => {
        try {
          if (!isMobile) {
            // Desktop animations (existing logic)
            animateUrgencyBalls();
            animateImportance();
          } else {
            // ✅ Mobile animations - simpler approach
            animateMobileUrgencyBalls();
          }
        } catch (error) {
          console.error("🚨 GSAP: Animation error:", error);
        }
      }, 100); // Increased delay for mobile DOM updates

      // --- Desktop Urgency Ball Animation ---
      const animateUrgencyBalls = () => {
        const urgencyTargets = new Set<string>();

        if (tree.children) {
          for (const child of tree.children) {
            const childTargets = findAllUrgencyAnimationTargets(
              child,
              openMap,
              `/${tabName}`,
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
            `[data-node-path="${path}"]`,
          );
          if (!nodeContainer) return;

          const urgencyLevel = parseInt(
            nodeContainer.getAttribute("data-urgency") || "1",
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
            console.error(`🚨 GSAP: Failed animating ball for ${path}`, err);
          }
        });
      };

      // ✅ NEW: Mobile-specific urgency ball animation
      const animateMobileUrgencyBalls = () => {
        const urgencyBalls = container.querySelectorAll("[data-urgency-ball]");

        urgencyBalls.forEach((ball) => {
          const path = ball.getAttribute("data-urgency-ball");
          if (!path) return;

          const nodeContainer = container.querySelector(
            `[data-node-path="${path}"]`,
          );
          if (!nodeContainer) {
            gsap.set(ball, { opacity: 0 });
            return;
          }

          const urgencyLevel = parseInt(
            nodeContainer.getAttribute("data-urgency") || "1",
          );

          if (!shouldShowUrgencyBall(urgencyLevel)) {
            gsap.set(ball, { opacity: 0 });
            return;
          }

          try {
            // ✅ Ensure ball is visible first
            gsap.set(ball, { opacity: 1 });

            // ✅ Mobile: Use simpler border animation instead of motion path
            const borderPath = createUrgencyOrbitalPath(nodeContainer);
            const motionConfig = getUrgencyMotionConfig(urgencyLevel);

            // ✅ Set initial position
            gsap.set(ball, {
              position: "absolute",
              left: 0,
              top: 0,
              xPercent: -50,
              yPercent: -50,
            });

            // ✅ Animate with motion path
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
            console.error(
              `🚨 GSAP: Failed animating mobile ball for ${path}`,
              err,
            );
            // ✅ Fallback: simple rotation animation
            gsap.set(ball, {
              position: "absolute",
              left: "50%",
              top: "0px",
              xPercent: -50,
              yPercent: -50,
            });

            gsap.to(ball, {
              rotation: 360,
              duration: getUrgencyMotionConfig(urgencyLevel).duration,
              repeat: -1,
              ease: "none",
              transformOrigin: "50% 100px", // Circular path around the node
            });
          }
        });
      };

      // --- Desktop Importance Highlight Animation ---
      const animateImportance = () => {
        if (!tree.children) return;

        for (const child of tree.children) {
          const importanceTargetPath = findDeepestImportanceAnimationTarget(
            child,
            openMap,
            `/${tabName}`,
          );

          if (!importanceTargetPath) continue;

          const targetElement = container.querySelector(
            `[data-node-path="${importanceTargetPath}"]`,
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

      // Cleanup function
      return () => {
        clearTimeout(animationTimeout);
        gsap.killTweensOf("*");
        gsap.set("*", { clearProps: "all" });
      };
    },
    {
      scope: containerRef,
      // ✅ Updated dependencies to include mobile navigation state
      dependencies: [tree, openMap, tabName, isMobile, activePath],
      revertOnUpdate: true, // ✅ This ensures cleanup on dependency changes
    },
  );
}
