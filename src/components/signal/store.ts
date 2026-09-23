"use client";

import { MAX_PHASE, PHASE_INDEX, type Phase } from "./formations";

/**
 * Deliberately a mutable singleton rather than React state. Scroll updates
 * the phase on every frame, and routing that through React would re-render
 * the tree sixty times a second for a value only the GPU reads.
 */
type SignalStore = {
  /** Target position along the narrative, 0..6. */
  phase: number;
  /** Eased value actually handed to the shader. */
  rendered: number;
  /** Overall brightness. */
  intensity: number;
  /** Contact-form completion, 0..1. */
  resolve: number;
  /** Cluster or tier to pull forward; -1 is none. */
  focus: number;
  /** 0 = wide field, 1 = star-system zoom into the focused cluster. */
  zoom: number;
  zoomR: number;
  lookX: number;
  lookY: number;
  /** Pointer in NDC, -1..1. */
  mouseX: number;
  mouseY: number;
  mouseRX: number;
  mouseRY: number;
  /** False until the first real pointer sample, so the glow does not ease from 0,0. */
  mouseLive: boolean;
  /** Set by the field so callers can wake a demand-driven frameloop. */
  invalidate: (() => void) | null;
};

export const signal: SignalStore = {
  phase: 0,
  rendered: 0,
  intensity: 1,
  resolve: 0,
  focus: -1,
  zoom: 0,
  zoomR: 0,
  lookX: 0,
  lookY: 0,
  mouseX: 0,
  mouseY: 0,
  mouseRX: 0,
  mouseRY: 0,
  mouseLive: false,
  invalidate: null,
};

type Listener = () => void;
const listeners = new Set<Listener>();
let chapterIndex = 0;

function emitChapter() {
  const next = Math.round(signal.phase);
  if (next === chapterIndex) return;
  chapterIndex = next;
  listeners.forEach((fn) => fn());
}

export function subscribeChapter(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getChapterIndex() {
  return chapterIndex;
}

export function setPhase(next: number | Phase) {
  const value = typeof next === "number" ? next : PHASE_INDEX[next];
  signal.phase = Math.min(MAX_PHASE, Math.max(0, value));
  emitChapter();
  signal.invalidate?.();
}

/** Jump without easing — used on route changes so pages do not animate in. */
export function snapPhase(next: number | Phase) {
  setPhase(next);
  signal.rendered = signal.phase;
  signal.invalidate?.();
}

export function setIntensity(value: number) {
  signal.intensity = Math.max(0, value);
  signal.invalidate?.();
}

export function setResolve(value: number) {
  signal.resolve = Math.min(1, Math.max(0, value));
  signal.invalidate?.();
}

export function setFocus(cluster: number | null) {
  signal.focus = cluster ?? -1;
  signal.invalidate?.();
}

export function setZoom(value: number) {
  signal.zoom = Math.min(1, Math.max(0, value));
  signal.invalidate?.();
}

export function setLook(x: number, y: number) {
  signal.lookX = x;
  signal.lookY = y;
  signal.invalidate?.();
}

export function setMouse(x: number, y: number) {
  if (!signal.mouseLive) {
    signal.mouseRX = x;
    signal.mouseRY = y;
    signal.mouseLive = true;
  }
  signal.mouseX = x;
  signal.mouseY = y;
  signal.invalidate?.();
}
