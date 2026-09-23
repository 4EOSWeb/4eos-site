"use client";

/**
 * Rendering capability detection. The Signal is expensive, so it is sized
 * to the device rather than shipped uniformly. Mobile gets no WebGL at all.
 */

export type DeviceTier = "full" | "reduced" | "none";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}

/**
 * Coarse pointer plus a narrow viewport means a phone, and phones fall back
 * to the static poster. Low core counts and low memory drop to the reduced
 * point budget rather than being cut off entirely.
 */
export function detectTier(): DeviceTier {
  if (typeof window === "undefined") return "none";
  if (!hasWebGL()) return "none";

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 900;
  if (coarse && narrow) return "none";

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;
  if (cores <= 4 || (memory !== undefined && memory <= 4)) return "reduced";
  // CSS pixels, not the panel. A 1920-wide laptop at Windows 150% reports
  // about 1280 and should keep the desktop field.
  if (window.innerWidth < 1100) return "reduced";

  return "full";
}

/** Point budget per tier, per the plan: 60k desktop, 24k laptop, 0 mobile. */
export const POINT_BUDGET: Record<DeviceTier, number> = {
  full: 60_000,
  reduced: 24_000,
  none: 0,
};
