"use client";

import { useEffect } from "react";
import { setFieldGlow } from "@/components/signal/store";

const GLASS = ".sheet-glass, .sheet-ink-glass, .menu-glass, .site-bar";

/** Puts the gold cursor light on whichever frosted surface is under the pointer. */
export function GlassGlow() {
  useEffect(() => {
    let current: HTMLElement | null = null;

    const move = (event: PointerEvent) => {
      const next = (event.target as Element | null)?.closest?.(GLASS) as HTMLElement | null;
      if (current && current !== next) {
        current.style.removeProperty("--gx");
        current.style.removeProperty("--gy");
      }
      current = next;
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
