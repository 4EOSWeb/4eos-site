"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { PHASE_INDEX, type Phase } from "./formations";
import { setPhase } from "./store";
import { prefersReducedMotion } from "@/lib/env";
import { registerSnapEl } from "@/lib/snap";

/**
 * Binds a section of the page to a formation. Scrolling a chapter into view
 * morphs the field from the previous formation to this one, and the field
 * then holds while the chapter is read.
 */
export function SignalChapter({
  phase,
  children,
  className = "",
  id,
}: {
  phase: Phase;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const index = PHASE_INDEX[phase];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const releaseSnap = registerSnapEl(el);
    const from = Math.max(0, index - 1);
    const reduced = prefersReducedMotion();

    if (reduced) {
      // No scroll-linked motion: the formation is simply correct by the time
      // the chapter is on screen.
      const trigger = ScrollTrigger.create({
        trigger: el,
        start: "top 70%",
        end: "bottom 30%",
        onToggle: (self) => {
          if (self.isActive) setPhase(index);
        },
      });
      return () => {
        releaseSnap();
        trigger.kill();
      };
    }

    // Only the chapter currently crossing the viewport may drive the field.
    // Without this guard every chapter reports on refresh and whichever runs
    // last wins, which at the top of the page is the final chapter.
    const apply = (self: ScrollTrigger) => {
      if (!self.isActive) return;
      setPhase(from + (index - from) * self.progress);
    };

    let live = true;
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      // "top 18%" matches SNAP_TOP in snap.ts. The formation finishes on
      // the same line the page lands, including for a tall chapter.
      end: "top 18%",
      onUpdate: apply,
      onRefresh: apply,
      onLeave: () => {
        if (live) setPhase(index);
      },
      onLeaveBack: () => {
        if (live) setPhase(from);
      },
    });

    return () => {
      live = false;
      releaseSnap();
      trigger.kill();
    };
  }, [index]);

  return (
    <div ref={ref} id={id} data-snap className={className}>
      {children}
    </div>
  );
}
