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
      const top = el.getBoundingClientRect().top;
      const vh = window.innerHeight;
      // Still mostly below the fold: the chapter on screen keeps its scene.
      if (top > vh * 0.72) return;
      if (top <= vh * 0.04) {
        setPhase(index);
        return;
      }
      setPhase(from + (index - from) * self.progress);
    };

    let live = true;
    const trigger = ScrollTrigger.create({
      trigger: el,
      // The blend runs while the chapter is entering. It is finished
      // before the chapter locks to the top, and the next chapter does
      // not start until it has actually crossed into the viewport.
      start: "top 80%",
      end: "top 20%",
      onUpdate: apply,
      onLeave: () => {
        if (live) setPhase(index);
      },
      onLeaveBack: () => {
        if (live) setPhase(from);
      },
      onRefresh: () => {
        if (!live) return;
        const top = el.getBoundingClientRect().top;
        if (top <= window.innerHeight * 0.2 && top > -window.innerHeight * 0.45) {
          setPhase(index);
        }
      },
    });

    return () => {
      live = false;
      releaseSnap();
      trigger.kill();
    };
  }, [index]);

  return (
    <div
      ref={ref}
      id={id}
      data-snap
      data-phase={index}
      className={`h-dvh overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}
