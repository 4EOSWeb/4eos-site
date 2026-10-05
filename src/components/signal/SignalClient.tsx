"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { detectTier, prefersReducedMotion, type DeviceTier } from "@/lib/env";
import { MAX_PHASE } from "./formations";
import { setPhase } from "./store";

const SignalField = dynamic(() => import("./SignalField"), { ssr: false });

/**
 * The particle field, mounted once so it survives route changes.
 * Scrolling a page morphs it through the same formations as before.
 * Reduced motion holds the calm lattice and draws it once.
 */
export function SignalClient() {
  const [tier, setTier] = useState<DeviceTier | null>(null);

  useEffect(() => {
    let timer = 0;
    const apply = () => setTier(detectTier());
    const id = window.setTimeout(apply, 0);
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(apply, 180);
    };
    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(id);
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    if (tier && tier !== "none") document.documentElement.classList.add("signal-live");
    return () => document.documentElement.classList.remove("signal-live");
  }, [tier]);

  useEffect(() => {
    if (!tier || tier === "none") return;
    if (prefersReducedMotion()) {
      setPhase(1);
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      setPhase(progress * MAX_PHASE);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [tier]);

  if (!tier || tier === "none") return null;
  return <SignalField tier={tier} />;
}
