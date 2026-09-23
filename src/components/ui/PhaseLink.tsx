"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Phase } from "@/components/signal/formations";
import { clusterCenter } from "@/components/signal/formations";
import { setFocus, setLook } from "@/components/signal/store";

export function PhaseLink({
  href,
  focus,
  className = "",
  children,
}: {
  href: string;
  phase: Phase;
  focus?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      onPointerEnter={() => {
        if (focus === undefined) return;
        setFocus(focus);
      }}
      onPointerLeave={() => {
        if (focus === undefined) return;
        setFocus(null);
      }}
      onPointerDown={() => {
        if (focus === undefined) return;
        const [x, y] = clusterCenter(focus);
        setFocus(focus);
        setLook(x, y);
      }}
    >
      {children}
    </Link>
  );
}
