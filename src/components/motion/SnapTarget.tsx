"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { registerSnapEl } from "@/lib/snap";

/** A snap stop that is not a chapter and does not drive the field. */
export function SnapTarget({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return registerSnapEl(el);
  }, []);

  return <div ref={ref}>{children}</div>;
}
