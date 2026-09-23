"use client";

import type Snap from "lenis/snap";
import { setPhase } from "@/components/signal/store";

/**
 * Chapters register here so the Lenis snap instance can pick them up after
 * it mounts, and so route changes rebind without a second observer.
 */
const pending = new Set<HTMLElement>();
const unsubs = new Map<HTMLElement, () => void>();
const registryListeners = new Set<() => void>();
let snap: Snap | null = null;
let scrollToValue: ((value: number, done?: () => void) => void) | null = null;

const ALIGN = { align: "start" as const };

/**
 * A chapter rests with its top flush with the viewport. The field trigger
 * finishes before that, and the next chapter has not started yet, so the
 * formation is a single scene when the page lands.
 */
export const SNAP_TOP = 0;

function emitRegistry() {
  registryListeners.forEach((fn) => fn());
}

export function snapTargetCount() {
  return pending.size;
}

export function subscribeSnapTargets(fn: () => void) {
  registryListeners.add(fn);
  return () => {
    registryListeners.delete(fn);
  };
}

export function attachSnap(
  instance: Snap,
  scrollTo?: (value: number, done?: () => void) => void,
) {
  snap = instance;
  scrollToValue = scrollTo ?? null;
  pending.forEach((el) => {
    unsubs.set(el, instance.addElement(el, ALIGN));
  });
}

export function detachSnap() {
  unsubs.forEach((off) => off());
  unsubs.clear();
  snap = null;
  scrollToValue = null;
}

export function registerSnapEl(el: HTMLElement) {
  pending.add(el);
  if (snap) unsubs.set(el, snap.addElement(el, ALIGN));
  emitRegistry();

  return () => {
    pending.delete(el);
    unsubs.get(el)?.();
    unsubs.delete(el);
    emitRegistry();
  };
}

/** Scroll position that puts this element's top on the snap line. */
export function snapScrollFor(el: HTMLElement) {
  const top = el.getBoundingClientRect().top + window.scrollY;
  return Math.max(0, Math.round(top - window.innerHeight * SNAP_TOP));
}

function nearestIndex() {
  const y = window.scrollY;
  let best = 0;
  let bestDist = Number.POSITIVE_INFINITY;
  [...pending].forEach((el, i) => {
    const dist = Math.abs(snapScrollFor(el) - y);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  });
  return best;
}

function moveBy(direction: 1 | -1) {
  const count = pending.size;
  if (count === 0) return;
  const index = nearestIndex() + direction;
  if (index < 0 || index >= count) return;
  snapGoTo(index);
}

export function stopSnap() {
  snap?.stop();
}

export function startSnap() {
  snap?.start();
}

export function snapGoTo(index: number) {
  const el = [...pending][index];
  if (!el) return;

  const value = snapScrollFor(el);
  const settle = () => {
    const phase = el.dataset.phase;
    if (phase) setPhase(Number(phase));
  };
  if (scrollToValue) {
    scrollToValue(value, settle);
    return;
  }

  el.scrollIntoView({ block: "start", behavior: "auto" });
  settle();
}

/** Land on the same top magnet the rail uses. */
export function snapToEl(el: HTMLElement) {
  const index = [...pending].indexOf(el);
  if (index < 0) return false;
  snapGoTo(index);
  return true;
}

export function snapNext() {
  moveBy(1);
}

export function snapPrev() {
  moveBy(-1);
}
