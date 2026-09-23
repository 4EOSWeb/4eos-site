"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { addressLine, nav, site, utilityNav } from "@/lib/site";
import { lockScroll, unlockScroll } from "@/lib/scroll";

/**
 * Wordmark and the word MENU. No calls to action live in the navigation —
 * the routes that matter are reachable from the menu and the footer, and a
 * permanent button in the corner would undercut everything else on the page.
 */
export function Nav({ tone = "light" }: { tone?: "light" | "dark" }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panel = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!open) return;

    lockScroll();
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>("a, button")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      // Keep focus inside the overlay while it is up.
      const focusable = panel.current?.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])",
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      unlockScroll();
      (previous ?? toggle.current)?.focus();
    };
  }, [open]);

  const ink = tone === "dark";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 flex h-[var(--nav-h)] items-center justify-between px-[var(--sheet-inset)] ${
          ink ? "text-bone-fg" : "text-fg"
        }`}
      >
        <Link
          href="/"
          aria-label="4EOS home"
          className="inline-flex items-center py-2 transition-opacity hover:opacity-70"
        >
          <Logo height={26} />
        </Link>

        <button
          ref={toggle}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="site-menu"
          className="micro relative py-2 transition-opacity hover:opacity-70"
        >
          {open ? "Close" : "Menu"}
        </button>
      </header>

      <div
        id="site-menu"
        ref={panel}
        hidden={!open}
        className="menu-glass fixed inset-0 z-40 flex flex-col justify-between overflow-y-auto px-[var(--sheet-inset)] pt-[calc(var(--nav-h)+4vh)] pb-[var(--sheet-inset)] text-fg"
      >
        <nav aria-label="Main">
          <ul>
            {nav.map((item, i) => (
              <li key={item.href} className="border-t border-hairline">
                <Link
                  href={item.href}
                  className="group flex items-baseline gap-[3vw] py-[1.4vh] transition-colors hover:text-gold"
                >
                  <span className="micro w-8 shrink-0 transition-colors group-hover:text-gold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="display text-[clamp(2.2rem,6.5vw,5.5rem)]">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-wrap items-end justify-between gap-8 border-t border-hairline pt-6">
          <ul className="flex gap-8">
            {utilityNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="micro transition-colors hover:text-gold"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <address className="micro not-italic text-fg-muted">
            <a href={site.phoneHref} className="hover:text-gold">
              {site.phone}
            </a>
            <span className="px-2 text-fg-faint">/</span>
            <a href={`mailto:${site.helpdesk}`} className="hover:text-gold">
              {site.helpdesk}
            </a>
            <span className="hidden px-2 text-fg-faint sm:inline">/</span>
            <span className="hidden sm:inline">{addressLine}</span>
          </address>
        </div>
      </div>
    </>
  );
}
