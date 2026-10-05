"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { detectTier, prefersReducedMotion } from "@/lib/env";
import { signal } from "@/components/signal/store";

const SignalField = dynamic(() => import("@/components/signal/SignalField"), { ssr: false });

const LATTICE_PHASE = 1;

/**
 * Hero background. The static network (children) is the default and the
 * only version phones, touch devices, and reduced-motion users ever get.
 * Wide fine-pointer screens swap in a slow particle lattice once the page is
 * idle. Neither layer takes pointer events or carries content.
 */
export function HeroAtmosphere({ children }: { children: ReactNode }) {
  const host = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const wide = window.matchMedia("(pointer: fine) and (min-width: 64rem)").matches;
    if (!wide || prefersReducedMotion() || detectTier() === "none") return;
    let cancelled = false;
    const start = () => {
      if (cancelled) return;
      signal.phase = LATTICE_PHASE;
      signal.rendered = LATTICE_PHASE;
      signal.phaseVel = 0;
      signal.intensity = 0.7;
      signal.fieldGlow = 0;
      setLive(true);
      window.setTimeout(() => !cancelled && setReady(true), 120);
    };
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(start, { timeout: 2500 })
      : window.setTimeout(start, 1200);
    return () => {
      cancelled = true;
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, []);

  useEffect(() => {
    if (!live || !host.current) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 });
    io.observe(host.current);
    return () => io.disconnect();
  }, [live]);

  return (
    <div ref={host} className="hero-atmos" aria-hidden="true">
      <div className="static-net-layer" data-live={ready || undefined}>
        {children}
      </div>
      {live ? (
        <div className="field-fade" data-ready={ready || undefined}>
          <SignalField tier="reduced" ambient paused={!visible} />
        </div>
      ) : null}
    </div>
  );
}
