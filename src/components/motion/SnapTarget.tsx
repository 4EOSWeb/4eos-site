"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { registerSnapEl } from "@/lib/snap";

/** A snap stop that is not a chapter and does not drive the field. */
export function SnapTarget({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return registerSnapEl(el);
  }, []);

  return (
    <div ref={ref} data-snap className={className}>
      {children}
    </div>
  );
}
