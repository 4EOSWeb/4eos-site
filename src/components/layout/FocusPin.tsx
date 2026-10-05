"use client";

import { useEffect } from "react";
import { clusterCenter } from "@/components/signal/formations";
import { setFocus, setLook, setZoom } from "@/components/signal/store";

/**
 * Pins the persistent field to one industry cluster and, when asked,
 * zooms the camera into it. Cleanup restores the wide view.
 */
export function FocusPin({
  focus,
  zoom = false,
}: {
  focus?: number;
  zoom?: boolean;
}) {
  useEffect(() => {
    if (focus === undefined) {
      setFocus(null);
      setZoom(0);
      setLook(0, 0);
      return;
    }

    const [x, y] = clusterCenter(focus);
    setFocus(focus);
    setLook(x, y);
    setZoom(zoom ? 1 : 0);

    return () => {
      setFocus(null);
      setZoom(0);
    };
  }, [focus, zoom]);

  return null;
}
