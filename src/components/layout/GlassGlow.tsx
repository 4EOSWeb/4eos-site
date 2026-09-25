"use client";

import { useEffect } from "react";
import { setFieldGlow } from "@/components/signal/store";
import { detectTier } from "@/lib/env";

const GLASS = ".sheet-glass, .sheet-ink-glass, .menu-glass, .site-bar";

/** Puts the gold cursor light on whichever frosted surface is under the pointer. */
export function GlassGlow() {
  useEffect(() => {
    if (detectTier() === "mobile") return;

    let x = 0;
    let y = 0;
    let live = false;

    const place = () => {
      if (!live) return;
      const hit = document.elementFromPoint(x, y);
      const next = hit?.closest?.(GLASS) as HTMLElement | null;
      setFieldGlow(!next);
      if (!next) return;
      const box = next.getBoundingClientRect();
      next.style.setProperty("--gx", `${x - box.left}px`);
      next.style.setProperty("--gy", `${y - box.top}px`);
    };

    const move = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      live = true;
      place();
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", place, true);
    };
  }, []);

  return null;
}
