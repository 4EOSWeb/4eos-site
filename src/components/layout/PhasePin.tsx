"use client";

import { useEffect } from "react";
import { type Phase } from "@/components/signal/formations";
import { snapPhase } from "@/components/signal/store";

/** Pins the persistent field to this page's formation on mount and change. */
export function PhasePin({ phase }: { phase: Phase }) {
  useEffect(() => {
    snapPhase(phase);
  }, [phase]);

  return null;
}
