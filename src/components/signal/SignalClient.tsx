"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { detectTier, type DeviceTier } from "@/lib/env";

// Three plus the field is the largest thing on the site, so it is kept out
// of the initial bundle and only requested once the tier is known.
const SignalField = dynamic(() => import("./SignalField"), { ssr: false });

/**
 * Mounted once from the root layout so the live field survives route
 * changes. Pages pin a formation through PhasePin; they do not remount this.
 */
export function SignalClient() {
  const [tier, setTier] = useState<DeviceTier | null>(null);

  useEffect(() => {
    // Defer past hydration so the text is interactive before the GPU work
    // starts competing for the main thread. Zoom and display scaling change
    // the CSS viewport after load, so the tier is measured again then.
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
    if (tier && tier !== "none") {
      document.documentElement.classList.add("signal-live");
    }
    return () => document.documentElement.classList.remove("signal-live");
  }, [tier]);

  if (!tier || tier === "none") return null;
  return <SignalField tier={tier} />;
}
