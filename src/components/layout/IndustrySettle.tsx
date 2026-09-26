"use client";

import { useEffect } from "react";
import { detectTier, prefersReducedMotion } from "@/lib/env";
import {
  setCloud,
  setFocus,
  setIntensity,
  setZoom,
  signal,
  snapPhase,
} from "@/components/signal/store";

/**
 * The zoom through an industry face ends on black. From that black the
 * unmanaged dots fade in. The die stays gone until the industries chapter
 * is on screen again.
 */
export function IndustrySettle() {
  useEffect(() => {
    const onCube = signal.rendered > 3.4 && signal.rendered < 4.6;
    const skip = !onCube || detectTier() === "mobile" || prefersReducedMotion();
    if (skip) {
      setZoom(0);
      signal.zoomR = 0;
      setFocus(null);
      setCloud(0, true);
      setIntensity(1);
      snapPhase("unmanaged");
      return;
    }

    let stage: "in" | "fade" | "done" = "in";
    let heldSince = 0;
    let fadeFrom = 0;
    const started = performance.now();
    let raf = 0;

    const cutToCloud = () => {
      // The field is already black. Move the camera home and swap the
      // formation before any of it is visible again.
      signal.intensity = 0;
      signal.zoom = 0;
      signal.zoomR = 0;
      setFocus(null);
      setCloud(0, true);
      snapPhase("unmanaged");
      signal.invalidate?.();
    };

    const tick = (now: number) => {
      if (stage === "done") return;
      if (now - started > 12000) {
        cutToCloud();
        signal.intensity = 1;
        stage = "done";
        return;
      }
      if (stage === "in") {
        if (signal.zoomR > 0.97) {
          if (heldSince === 0) heldSince = now;
          if (now - heldSince > 180) {
            cutToCloud();
            stage = "fade";
            fadeFrom = now;
          }
        }
      } else {
        const t = Math.min(1, (now - fadeFrom) / 1000);
        signal.intensity = 1 - Math.pow(1 - t, 2);
        signal.invalidate?.();
        if (t >= 1) {
          signal.intensity = 1;
          stage = "done";
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (stage !== "done") {
        setCloud(0, true);
        setIntensity(1);
      }
    };
  }, []);

  return null;
}
