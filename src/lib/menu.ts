"use client";

/**
 * The site menu is local state in the nav. The chapter index and the scroll
 * cue need the same bit so they can step aside while the overlay is up.
 */
let open = false;
const listeners = new Set<() => void>();

export function setMenuOpen(next: boolean) {
  if (open === next) return;
  open = next;
  listeners.forEach((fn) => fn());
}

export function getMenuOpen() {
  return open;
}

export function subscribeMenu(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
