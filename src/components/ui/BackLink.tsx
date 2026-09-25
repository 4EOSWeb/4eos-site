"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { leaveViaBack, previousSpot, type Spot } from "@/lib/trail";

/** Same back control on every inner page: large, labeled, top of the column.
 *  The label is the page the reader just left. The href and label props are
 *  the fallback when this page was opened directly. */
export function BackLink({
  href,
  label,
  tone = "dark",
}: {
  href: string;
  label: string;
  /** Bone pages use dark type on a light glass. */
  tone?: "dark" | "bone";
}) {
  const [spot, setSpot] = useState<Spot | null>(null);

  useEffect(() => {
    setSpot(previousSpot());
  }, []);

  const dest = spot ?? { href, label };

  return (
    <Link
      href={dest.href}
      className={`back-link${tone === "bone" ? " back-link-bone" : ""}`}
      onClick={() => leaveViaBack()}
    >
      <span aria-hidden>←</span>
      <span>Back to {dest.label}</span>
    </Link>
  );
}
