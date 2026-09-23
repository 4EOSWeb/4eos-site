"use client";

import type Snap from "lenis/snap";

/**
 * Chapters register here so the Lenis snap instance can pick them up after
 * it mounts, and so route changes rebind without a second observer.
 */
const pending = new Set<HTMLElement>();
const unsubs = new Map<HTMLElement, () => void>();
const registryListeners = new Set<() => void>();
let snap: Snap | null = null;
let scrollToValue: ((value: number) => void) | null = null;

const ALIGN = { align: "center" as const };

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
  scrollTo?: (value: number) => void,
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

function nearestIndex() {
  const els = [...pending];
  const mid = window.innerHeight / 2;
  let best = 0;
  let bestDist = Number.POSITIVE_INFINITY;
  els.forEach((el, i) => {
    const rect = el.getBoundingClientRect();
    const dist = Math.abs(rect.top + rect.height / 2 - mid);
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

  // Centre the element ourselves. Lenis snap sorts by absolute position,
  // which does not match chapter order once a value is negative.
  const top = el.getBoundingClientRect().top + window.scrollY;
  const value = Math.max(
    0,
    Math.round(top + el.offsetHeight / 2 - window.innerHeight / 2),
  );
  if (scrollToValue) {
    scrollToValue(value);
    return;
  }

  el.scrollIntoView({ block: "center", behavior: "smooth" });
}

/** Land on the same centre magnet the rail and proximity snap use. */
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
