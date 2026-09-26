"use client";

import { useEffect } from "react";
import { detectTier, prefersReducedMotion } from "@/lib/env";
import {
  setCloud,
  setFocus,
  setZoom,
  signal,
  snapPhase,
} from "@/components/signal/store";

/**
 * After the camera has passed through an industry face, pull back out,
 * then let those points gather into the unmanaged cloud.
 */
export function IndustrySettle() {
  useEffect(() => {
    const onCube = signal.rendered > 3.4 && signal.rendered < 4.6;
    const skip = !onCube || detectTier() === "mobile" || prefersReducedMotion();
    if (skip) {
      setZoom(0);
      setFocus(null);
      setCloud(0, true);
      snapPhase("unmanaged");
      return;
    }

    let stage: "in" | "back" | "orbs" | "done" = "in";
    let heldSince = 0;
    const started = performance.now();
    let raf = 0;

    const finish = () => {
      if (stage === "done") return;
      stage = "done";
      signal.cloudR = 1;
      snapPhase("unmanaged");
      setCloud(0);
      setZoom(0);
      setFocus(null);
    };

    const tick = (now: number) => {
      if (stage === "done") return;
      if (now - started > 12000) {
        finish();
        return;
      }
      if (stage === "in") {
        if (signal.zoomR > 0.9) {
          if (heldSince === 0) heldSince = now;
          if (now - heldSince > 280) {
            stage = "back";
            setZoom(0);
          }
        }
      } else if (stage === "back") {
        if (signal.zoomR < 0.05) {
          stage = "orbs";
          setCloud(1);
        }
      } else if (signal.cloudR > 0.97) {
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (stage !== "done") setCloud(0, true);
    };
  }, []);

  return null;
}
