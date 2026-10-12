"use client";

import { useEffect } from "react";
import { rememberLeave } from "@/lib/trail";

/** Remember the page a reader leaves, so Back can name it. */
export function Trail() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a");
      if (!link || link.classList.contains("back-link")) return;
      const href = link.getAttribute("href");
      if (!href || /^(https?:|mailto:|tel:)/.test(href)) return;
      rememberLeave();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
