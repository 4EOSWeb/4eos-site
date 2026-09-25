"use client";

import { useEffect } from "react";
import { setFieldGlow } from "@/components/signal/store";
import { detectTier } from "@/lib/env";

const GLASS = ".sheet-glass, .sheet-ink-glass, .menu-glass, .site-bar";

/** Puts the gold cursor light on whichever frosted surface is under the pointer. */
export function GlassGlow() {
  useEffect(() => {
    if (detectTier() === "mobile") return;

    const move = (event: PointerEvent) => {
      const next = (event.target as Element | null)?.closest?.(GLASS) as HTMLElement | null;
      setFieldGlow(!next);
      if (!next) return;
      const box = next.getBoundingClientRect();
      next.style.setProperty("--gx", `${event.clientX - box.left}px`);
      next.style.setProperty("--gy", `${event.clientY - box.top}px`);
    };

    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return null;
}
