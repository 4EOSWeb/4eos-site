"use client";

import type Lenis from "lenis";
import { startSnap, stopSnap } from "./snap";

/**
 * Holds the live Lenis instance so overlays can stop the page scrolling.
 * Lenis owns the wheel and touch handlers, so `overflow: hidden` alone does
 * not stop it, and stopping Lenis alone does not stop native scroll when
 * reduced motion means Lenis was never started.
 */
export const scroll: { lenis: Lenis | null } = { lenis: null };

export function lockScroll() {
  stopSnap();
  scroll.lenis?.stop();
  document.documentElement.style.overflow = "hidden";
}

export function unlockScroll() {
  document.documentElement.style.overflow = "";
  scroll.lenis?.start();
  startSnap();
}
