"use client";

import { useEffect } from "react";
import { setScene } from "@/components/signal/store";

/**
 * Pins the field to a strategy-row picture. The chapter phase stays where
 * the page put it; this only mixes the service formation over it.
 */
export function ScenePin({ scene }: { scene: number | null }) {
  useEffect(() => {
    setScene(scene, true);
    return () => setScene(null, true);
  }, [scene]);

  return null;
}
