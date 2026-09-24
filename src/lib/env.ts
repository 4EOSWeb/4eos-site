"use client";

/**
 * Rendering capability detection. The Signal is expensive, so it is sized
 * to the device rather than shipped uniformly. Phones keep a live field
 * with a small point budget. Devices without WebGL get the still poster.
 */

export type DeviceTier = "full" | "reduced" | "mobile" | "none";

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
 * Coarse pointer plus a narrow viewport means a phone. Low core counts and
 * low memory drop a desktop to the reduced point budget.
 */
export function detectTier(): DeviceTier {
  if (typeof window === "undefined") return "none";
  if (!hasWebGL()) return "none";

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 900;
  // Phones get a live field with far fewer points. A fine pointer, including
  // a narrowed desktop window, never takes this path.
  if (coarse && narrow) return "mobile";

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;
  if (cores <= 4 || (memory !== undefined && memory <= 4)) return "reduced";
  // CSS pixels, not the panel. A 1920-wide laptop at Windows 150% reports
  // about 1280 and should keep the desktop field.
  if (window.innerWidth < 1100) return "reduced";

  return "full";
}

/** Point budget per tier. Desktop stays 60k, laptops 24k. Phones draw 8k. */
export const POINT_BUDGET: Record<DeviceTier, number> = {
  full: 60_000,
  reduced: 24_000,
  mobile: 8_000,
  none: 0,
};

/** How far phone formations are pulled in so a portrait frame can hold them.
 *  Desktop multiplies by 1, so this never changes that picture. */
export const MOBILE_FIT = 0.58;
