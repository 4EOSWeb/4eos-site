"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PHASES } from "@/components/signal/formations";
import {
  getChapterIndex,
  subscribeChapter,
} from "@/components/signal/store";
import { getMenuOpen, subscribeMenu } from "@/lib/menu";
import {
  snapGoTo,
  snapNext,
  snapPrev,
  snapTargetCount,
  subscribeSnapTargets,
} from "@/lib/snap";

/** Visitor-facing names. The field still calls the first scene unmanaged. */
const CHAPTER_LABEL: Record<string, string> = {
  unmanaged: "Home",
};

function label(name: string) {
  return CHAPTER_LABEL[name] ?? name.charAt(0).toUpperCase() + name.slice(1);
}

/** How long the page must sit untouched before the down cue appears. */
const IDLE_MS = 4500;

/**
 * Bottom index and scroll prompt. Ticks replace the old right-hand list.
 * Gold marks the chapter you are in. The prompt stays until there is
 * nothing further to reach.
 */
export function ChapterRail() {
  const pathname = usePathname();
  const [active, setActive] = useState(0);
  const [targets, setTargets] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [more, setMore] = useState(false);
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    setActive(getChapterIndex());
    return subscribeChapter(() => setActive(getChapterIndex()));
  }, []);

  useEffect(() => {
    setTargets(snapTargetCount());
    return subscribeSnapTargets(() => setTargets(snapTargetCount()));
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(getMenuOpen());
    return subscribeMenu(() => setMenuOpen(getMenuOpen()));
  }, []);

  useEffect(() => {
    const measure = () => {
      const el = document.documentElement;
      const overflows = el.scrollHeight > window.innerHeight + 32;
      const atEnd = window.scrollY + window.innerHeight >= el.scrollHeight - 24;
      setMore(overflows && !atEnd);
    };

    measure();
    const observed = new ResizeObserver(measure);
    observed.observe(document.documentElement);
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      observed.disconnect();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [pathname, targets]);

  useEffect(() => {
    let timer = 0;
    const arm = () => {
      setIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), IDLE_MS);
    };
    arm();
    const names = ["pointerdown", "wheel", "keydown", "touchstart", "scroll"] as const;
    for (const name of names) window.addEventListener(name, arm, { passive: true });
    return () => {
      window.clearTimeout(timer);
      for (const name of names) window.removeEventListener(name, arm);
    };
  }, [pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (snapTargetCount() < 2) return;
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

  const story = targets >= 2;
  const current = story ? PHASES[active] : undefined;

  if (pathname.startsWith("/analytics") || menuOpen || (!story && !more)) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[35] flex items-end justify-between gap-6 px-[var(--sheet-inset)] pb-4">
      {story && current ? (
        <nav aria-label="Chapters" className="pointer-events-auto min-w-0">
          <p className="micro text-fg">{label(current)}</p>
          <ol className="mt-1 flex items-center">
            {PHASES.map((name, i) => {
              const here = i === active;
              return (
                <li key={name}>
                  <button
                    type="button"
                    aria-current={here ? "true" : undefined}
                    aria-label={`Chapter ${String(i).padStart(2, "0")}, ${label(name)}`}
                    onClick={() => snapGoTo(i)}
                    className="group flex h-11 w-6 items-center justify-center"
                  >
                    <span
                      className={`block h-px w-3.5 ${
                        here ? "bg-gold" : "bg-fg/35 group-hover:bg-fg"
                      }`}
                    />
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      ) : (
        <span />
      )}

      {more && idle ? (
        <button
          type="button"
          onClick={() => (story ? snapNext() : window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" }))}
          aria-label="Scroll down"
          className="scroll-cue pointer-events-auto mb-1 flex shrink-0 flex-col items-center"
        >
          {[0, 1, 2].map((i) => (
            <svg
              key={i}
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="scroll-cue-chevron"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <path
                d="M5 8.5 12 15.5 19 8.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ))}
        </button>
      ) : null}
    </div>
  );
}
