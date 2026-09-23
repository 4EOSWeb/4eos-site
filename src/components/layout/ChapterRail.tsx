"use client";

import { useEffect, useState } from "react";
import { PHASES } from "@/components/signal/formations";
import {
  getChapterIndex,
  subscribeChapter,
} from "@/components/signal/store";
import { snapGoTo, snapNext, snapPrev } from "@/lib/snap";

/**
 * Fixed right-edge chapter index. The active numeral is gold — the only
 * decorative use of gold on the site, and it is semantic: you are here.
 */
export function ChapterRail() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(getChapterIndex());
    return subscribeChapter(() => setActive(getChapterIndex()));
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.closest("input, textarea, select, [contenteditable='true']") ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "ArrowDown" || event.key === "j" || event.key === "J") {
        event.preventDefault();
        snapNext();
      } else if (event.key === "ArrowUp" || event.key === "k" || event.key === "K") {
        event.preventDefault();
        snapPrev();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <nav
      aria-label="Chapters"
      className="pointer-events-none fixed top-1/2 right-[var(--sheet-inset)] z-20 hidden -translate-y-1/2 min-[900px]:block"
    >
      <ol className="pointer-events-auto relative flex flex-col border-l border-hairline">
        {PHASES.map((name, i) => {
          const current = i === active;
          return (
            <li key={name} className="relative">
              <span
                aria-hidden
                className={`absolute top-1/2 -left-px h-4 w-px -translate-y-1/2 ${
                  current ? "bg-gold" : "bg-transparent"
                }`}
              />
              <button
                type="button"
                aria-current={current ? "true" : undefined}
                aria-label={`Chapter ${String(i).padStart(2, "0")}, ${name}`}
                onClick={() => snapGoTo(i)}
                className={`flex items-baseline gap-2.5 py-1.5 pl-4 text-left transition-colors ${
                  current ? "text-gold" : "text-fg/45 hover:text-fg"
                }`}
              >
                <span className="micro">{String(i).padStart(2, "0")}</span>
                <span className="micro max-w-[10ch] truncate">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
