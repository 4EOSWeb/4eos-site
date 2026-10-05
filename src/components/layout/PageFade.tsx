"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Crossfades the sheet column on route change. The Signal is not inside. */
export function PageFade({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-fade">
      {children}
    </div>
  );
}
