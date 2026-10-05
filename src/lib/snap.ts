"use client";

import type Snap from "lenis/snap";
import { holdPhase, releasePhaseHold, setPhase, signal } from "@/components/signal/store";

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

/** Document order. A target that mounts late must not sort after the footer. */
function ordered() {
  return [...pending].sort((a, b) => snapScrollFor(a) - snapScrollFor(b));
}

function nearestIndex() {
  const y = window.scrollY;
  const list = ordered();
  let best = 0;
  let bestDist = Number.POSITIVE_INFINITY;
  list.forEach((el, i) => {
    const dist = Math.abs(snapScrollFor(el) - y);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  });
  return best;
}

function moveBy(direction: 1 | -1) {
  const list = ordered();
  if (list.length === 0) return;
  const tall = tallStrategy();
  if (tall && insideEl(tall)) {
    const index = list.indexOf(tall) + direction;
    if (index < 0 || index >= list.length) return;
    snapGoTo(index);
    return;
  }
  const index = nearestIndex() + direction;
  if (index < 0 || index >= list.length) return;
  snapGoTo(index);
}

export function stopSnap() {
  snap?.stop();
}

export function startSnap() {
  snap?.start();
}

const PHONE_MQ = "(pointer: coarse) and (max-width: 899px)";

function isPhoneLayout() {
  return window.matchMedia(PHONE_MQ).matches;
}

/** Strategy is the only chapter that may grow past one screen, and only on a phone. */
function tallStrategy(): HTMLElement | null {
  if (!isPhoneLayout()) return null;
  const el = document.getElementById("chapter-strategy");
  if (!el || !pending.has(el)) return null;
  if (el.offsetHeight <= window.innerHeight + 24) return null;
  return el;
}

function insideEl(el: HTMLElement, y = window.scrollY) {
  const top = snapScrollFor(el);
  const bottom = top + el.offsetHeight;
  return y >= top - 2 && y < bottom - 2;
}

function strategyBounds(el: HTMLElement) {
  const top = snapScrollFor(el);
  const maxY = Math.max(top, top + el.offsetHeight - window.innerHeight);
  return { top, maxY };
}

/**
 * On a phone, a strategy chapter taller than the screen scrolls internally.
 * "free" lets the gesture move the page. "held" already parked at the edge
 * so the rows stay readable. "chapter" means the caller should change chapters.
 */
export function phoneStrategyGesture(
  direction: 1 | -1,
  delta: number,
): "free" | "held" | "chapter" {
  const el = tallStrategy();
  if (!el || !insideEl(el)) return "chapter";
  const { top, maxY } = strategyBounds(el);
  const y = window.scrollY;
  const room = direction > 0 ? maxY - y : y - top;
  if (room <= 16) return "chapter";
  if (Math.abs(delta) < room - 4) return "free";
  const dest = direction > 0 ? maxY : top;
  if (scrollToValue) scrollToValue(Math.round(dest));
  else window.scrollTo({ top: Math.round(dest), behavior: "auto" });
  return "held";
}

/** A tall strategy chapter must not be yanked back to its top. Every other
 *  phone screen, including the six services, keeps the magnet. */
export function syncPhoneSnapHold() {
  if (isPhoneLayout()) stopSnap();
  else startSnap();
}

function scrollInside(el: HTMLElement, direction: 1 | -1) {
  const { top, maxY } = strategyBounds(el);
  const room = direction > 0 ? maxY - window.scrollY : window.scrollY - top;
  // At the edge the next gesture changes chapter instead of nudging a few pixels.
  if (room <= 16) return false;
  const dest = Math.min(
    maxY,
    Math.max(top, window.scrollY + direction * Math.round(window.innerHeight * 0.82)),
  );
  if (Math.abs(dest - window.scrollY) < 2) return false;
  if (scrollToValue) scrollToValue(Math.round(dest));
  else window.scrollTo({ top: Math.round(dest), behavior: "auto" });
  return true;
}

let snapGen = 0;

export function snapGoTo(index: number) {
  const el = ordered()[index];
  if (!el) return;

  const value = snapScrollFor(el);
  const phase = el.dataset.phase;
  const destination = phase === undefined ? null : Number(phase);
  // A jump across several chapters, such as the wordmark back to the top,
  // must not walk the field through every picture on the way.
  const skip =
    destination !== null &&
    Number.isFinite(destination) &&
    Math.abs(destination - signal.phase) > 1.01;
  const gen = ++snapGen;
  if (skip) holdPhase(destination);
  const settle = () => {
    if (gen !== snapGen) return;
    if (skip) releasePhaseHold();
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
  const index = ordered().indexOf(el);
  if (index < 0) return false;
  snapGoTo(index);
  return true;
}

export function snapNext() {
  const tall = tallStrategy();
  if (tall && insideEl(tall) && scrollInside(tall, 1)) return;
  moveBy(1);
}

export function snapPrev() {
  const tall = tallStrategy();
  if (tall && insideEl(tall) && scrollInside(tall, -1)) return;
  moveBy(-1);
}
