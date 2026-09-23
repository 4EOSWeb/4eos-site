"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/env";

/**
 * Word-level gold reveal. The words that carry the claim light as the
 * statement enters, which is how gold is used on the site: never as a
 * decoration, only as emphasis.
 */
export function GoldReveal({
  text,
  marks,
  as: Tag = "h2",
  className = "",
}: {
  text: string;
  /** Exact words (case-insensitive) that take the accent. */
  marks: string[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const set = new Set(marks.map((w) => w.toLowerCase()));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const words = el.querySelectorAll<HTMLElement>("[data-mark]");
    if (!words.length) return;

    if (prefersReducedMotion()) {
      words.forEach((w) => (w.style.color = "var(--color-gold)"));
      return;
    }

    const tween = gsap.fromTo(
      words,
      { color: "currentColor" },
      {
        color: "var(--color-gold)",
        stagger: 0.08,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 75%",
          once: true,
        },
      },
    );

    return () => {
      tween.kill();
      ScrollTrigger.getAll()
        .filter((t) => t.trigger === el)
        .forEach((t) => t.kill());
    };
  }, []);

  const nodes = text.split(/(\s+)/).map((token, i) => {
    if (/^\s+$/.test(token)) return token;
    const clean = token.replace(/[^\w]/g, "").toLowerCase();
    if (set.has(clean)) {
      return (
        <span key={i} data-mark>
          {token}
        </span>
      );
    }
    return <span key={i}>{token}</span>;
  });

  return (
    <Tag ref={ref as never} className={className}>
      {nodes}
    </Tag>
  );
}
