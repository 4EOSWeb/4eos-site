"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import Snap from "lenis/snap";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/env";
import { scroll } from "@/lib/scroll";
import { attachSnap, detachSnap, snapToEl } from "@/lib/snap";

function scrollToHash() {
  const id = window.location.hash.slice(1);
  if (!id) return false;
  const el = document.getElementById(id);
  if (!el) return false;
  scroll.lenis?.resize();
  if (snapToEl(el)) return true;
  el.scrollIntoView({
    block: "center",
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
  return true;
}

/**
 * Drives Lenis from the GSAP ticker so smooth scroll and ScrollTrigger share
 * one clock. Snap is proximity, not mandatory: a section magnetises into
 * centre when the user eases off, and yields if they keep scrolling.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      smoothWheel: true,
    });

    const snap = new Snap(lenis, {
      type: "proximity",
      duration: 0.42,
      debounce: 160,
      distanceThreshold: "42%",
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });

    lenis.on("scroll", ScrollTrigger.update);
    scroll.lenis = lenis;
    attachSnap(snap);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    window.addEventListener("hashchange", scrollToHash);

    return () => {
      window.removeEventListener("hashchange", scrollToHash);
      gsap.ticker.remove(tick);
      detachSnap();
      snap.destroy();
      scroll.lenis = null;
      lenis.destroy();
    };
  }, []);

  // /#chapter-industries must wait until HomeView has a real height. Two
  // frames is not enough — Lenis still has the previous page's limit.
  useEffect(() => {
    if (typeof window === "undefined" || !window.location.hash) return;

    let cancelled = false;
    let frames = 0;
    let lastTop = Number.NaN;
    let stable = 0;
    let raf = 0;

    const tick = () => {
      if (cancelled) return;
      frames += 1;
      const id = window.location.hash.slice(1);
      const el = id ? document.getElementById(id) : null;
      if (!el) {
        if (frames < 60) raf = requestAnimationFrame(tick);
        return;
      }
      const top = el.getBoundingClientRect().top + window.scrollY;
      if (Number.isFinite(lastTop) && Math.abs(top - lastTop) < 2 && top > 80) {
        stable += 1;
      } else {
        stable = 0;
        lastTop = top;
      }
      if (stable >= 2 || frames > 50) {
        ScrollTrigger.refresh();
        scrollToHash();
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return null;
}
