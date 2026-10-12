"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import Snap from "lenis/snap";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/env";
import { scroll } from "@/lib/scroll";
import {
  attachSnap,
  detachSnap,
  phoneStrategyGesture,
  snapNext,
  snapPrev,
  snapTargetCount,
  snapToEl,
  syncPhoneSnapHold,
} from "@/lib/snap";

/** Long enough to cover one trackpad flick, short enough for a second notch. */
const STEP_COOLDOWN_MS = 640;

function scrollToHash() {
  const id = window.location.hash.slice(1);
  if (!id) return false;
  const el = document.getElementById(id)
    ?? (id === "chapter-strategy-services"
      ? document.getElementById("chapter-strategy")
      : null);
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
 * one clock. On the homepage story, one wheel notch or swipe advances exactly
 * one chapter. Other pages keep ordinary smooth scroll.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    let cooledUntil = 0;

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      smoothWheel: true,
      virtualScroll(data) {
        if (lenis.isStopped) return true;
        // A phone is one continuous page. Desktop still snaps one chapter.
        if (window.matchMedia("(pointer: coarse) and (max-width: 899px)").matches) return true;
        // Inner pages have no chapter list. Leave their scroll alone.
        if (snapTargetCount() < 2) return true;
        const { deltaX, deltaY } = data;
        if (Math.abs(deltaY) < 6 || Math.abs(deltaX) > Math.abs(deltaY)) return true;
        syncPhoneSnapHold();
        const direction = deltaY > 0 ? 1 : -1;
        const gesture = phoneStrategyGesture(direction, deltaY);
        // Still rows left in the strategy chapter. Let the swipe move them.
        if (gesture === "free") return true;
        const now = performance.now();
        if (data.event.cancelable) data.event.preventDefault();
        if (gesture === "held") return false;
        if (now < cooledUntil) return false;
        cooledUntil = now + STEP_COOLDOWN_MS;
        if (direction > 0) snapNext();
        else snapPrev();
        return false;
      },
    });

    const snap = new Snap(lenis, {
      type: "proximity",
      duration: 0.42,
      debounce: 160,
      distanceThreshold: "42%",
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });

    lenis.on("scroll", () => {
      ScrollTrigger.update();
      syncPhoneSnapHold();
    });
    scroll.lenis = lenis;
    attachSnap(snap, (value, done) => {
      lenis.scrollTo(value, {
        duration: 0.42,
        easing: (t) => 1 - Math.pow(1 - t, 3),
        lock: true,
        onComplete: () => done?.(),
      });
    });

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    window.addEventListener("hashchange", scrollToHash);
    window.addEventListener("resize", syncPhoneSnapHold);
    syncPhoneSnapHold();

    return () => {
      window.removeEventListener("hashchange", scrollToHash);
      window.removeEventListener("resize", syncPhoneSnapHold);
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
