"use client";

import type Snap from "lenis/snap";

/**
 * Chapters register here so the Lenis snap instance can pick them up after
 * it mounts, and so route changes rebind without a second observer.
 */
const pending = new Set<HTMLElement>();
const unsubs = new Map<HTMLElement, () => void>();
let snap: Snap | null = null;

const ALIGN = { align: "center" as const };

export function attachSnap(instance: Snap) {
  snap = instance;
  pending.forEach((el) => {
    unsubs.set(el, instance.addElement(el, ALIGN));
  });
}

export function detachSnap() {
  unsubs.forEach((off) => off());
  unsubs.clear();
  snap = null;
}

export function registerSnapEl(el: HTMLElement) {
  pending.add(el);
  if (snap) unsubs.set(el, snap.addElement(el, ALIGN));

  return () => {
    pending.delete(el);
    unsubs.get(el)?.();
    unsubs.delete(el);
  };
}

export function stopSnap() {
  snap?.stop();
}

export function startSnap() {
  snap?.start();
}

export function snapGoTo(index: number) {
  if (snap) {
    snap.resize();
    snap.goTo(index);
    return;
  }

  const el = [...pending][index];
  if (!el) return;
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
  snap?.next();
}

export function snapPrev() {
  snap?.previous();
}
