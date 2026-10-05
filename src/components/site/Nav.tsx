"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { isActive, mainNav, type MenuLink, type NavEntry } from "@/lib/nav";
import { consultHref, consultLabel, site } from "@/lib/site";
import { Glyph } from "./Glyph";

type Menu = Extract<NavEntry, { kind: "menu" }>;

const CLOSE_GRACE = 140;

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [seenPath, setSeenPath] = useState(pathname);
  const header = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | undefined>(undefined);

  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setOpen(null);
    setDrawer(false);
  }

  const cancelClose = useCallback(() => window.clearTimeout(timer.current), []);
  const scheduleClose = useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(null), CLOSE_GRACE);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (!open && !drawer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (open) {
        const trigger = document.getElementById(`nav-trigger-${open}`);
        setOpen(null);
        trigger?.focus();
      } else if (drawer) {
        setDrawer(false);
        menuBtn.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (open && header.current && !header.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, drawer]);

  useEffect(() => {
    document.body.classList.toggle("has-drawer", drawer);
    if (!drawer) return;
    const first = drawerRef.current?.querySelector<HTMLElement>("summary, a");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !drawerRef.current || !menuBtn.current) return;
      const items = [
        menuBtn.current,
        ...drawerRef.current.querySelectorAll<HTMLElement>("summary, a, button"),
      ].filter((el) => el.offsetParent !== null);
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("has-drawer");
    };
  }, [drawer]);

  const menus = mainNav.filter((e): e is Menu => e.kind === "menu");

  return (
    <>
      <header ref={header} className="site-nav surface-ink">
        <div className="wrap nav-inner">
          <Link href="/" className="nav-brand" aria-label="4EOS home">
            <Logo height={26} />
          </Link>

          <nav aria-label="Main" className="nav-links">
            <ul className="flex items-center">
              {mainNav.map((entry) =>
                entry.kind === "link" ? (
                  <li key={entry.href}>
                    <Link
                      href={entry.href}
                      className={`nav-item ${isActive(pathname, [entry.href]) ? "nav-current" : ""}`}
                      aria-current={isActive(pathname, [entry.href]) ? "page" : undefined}
                    >
                      {entry.bar ?? entry.label}
                    </Link>
                  </li>
                ) : (
                  <li
                    key={entry.id}
                    onPointerEnter={(e) => {
                      if (e.pointerType !== "mouse") return;
                      cancelClose();
                      setOpen(entry.id);
                    }}
                    onPointerLeave={(e) => {
                      if (e.pointerType === "mouse") scheduleClose();
                    }}
                  >
                    <button
                      type="button"
                      id={`nav-trigger-${entry.id}`}
                      className={`nav-item ${isActive(pathname, entry.match) ? "nav-current" : ""}`}
                      aria-expanded={open === entry.id}
                      aria-controls={`mega-${entry.id}`}
                      data-active={isActive(pathname, entry.match) || undefined}
                      onClick={() => setOpen((o) => (o === entry.id ? null : entry.id))}
                    >
                      {entry.bar ?? entry.label}
                      <Glyph name="caret" size={10} className="nav-caret" />
                    </button>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <div className="nav-right">
            <a href={site.phoneHref} className="nav-item nav-call">
              <Glyph name="call" size={16} />
              {site.phone}
            </a>
            <Link href={consultHref} className="btn btn-primary nav-cta">
              {consultLabel}
            </Link>
            <button
              ref={menuBtn}
              type="button"
              className="nav-item menu-btn"
              aria-expanded={drawer}
              aria-controls="site-drawer"
              onClick={() => setDrawer((d) => !d)}
            >
              <span className="menu-btn-bars" aria-hidden="true" />
              {drawer ? "Close" : "Menu"}
            </button>
          </div>
        </div>

        {menus.map((menu) => (
          <div
            key={menu.id}
            id={`mega-${menu.id}`}
            className="mega-panel surface-paper"
            data-open={open === menu.id}
            onPointerEnter={(e) => e.pointerType === "mouse" && cancelClose()}
            onPointerLeave={(e) => e.pointerType === "mouse" && scheduleClose()}
          >
            <div className={`wrap mega-grid ${menu.groups.length === 3 ? "mega-grid-4" : "mega-grid-3"}`}>
              {menu.groups.map((group, gi) => (
                <div key={`${menu.id}-${gi}`}>
                  <p className="label mega-col-head" aria-hidden={group.heading.trim() ? undefined : true}>
                    {group.heading}
                  </p>
                  <ul>
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <MegaLink link={link} pathname={pathname} />
                      </li>
                    ))}
                  </ul>
                  {gi === 0 ? (
                    <Link href={menu.overview.href} className="link-arrow mt-3">
                      {menu.overview.label}
                      <span aria-hidden="true" className="btn-arrow">
                        →
                      </span>
                    </Link>
                  ) : null}
                </div>
              ))}
              <div className="mega-feature">
                <p className="t-title-sm">{menu.feature.title}</p>
                <p>{menu.feature.body}</p>
                <div className="mt-auto">
                  <a href={menu.feature.href} className="btn btn-primary">
                    {menu.feature.label}
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div
          ref={drawerRef}
          id="site-drawer"
          className="drawer surface-ink"
          data-open={drawer}
        >
          <nav aria-label="Mobile" className="wrap">
            <Link href="/" className="drawer-link" aria-current={pathname === "/" ? "page" : undefined}>
              Home
            </Link>
            {mainNav.map((entry) =>
              entry.kind === "link" ? (
                <Link
                  key={entry.href}
                  href={entry.href}
                  className="drawer-link"
                  aria-current={isActive(pathname, [entry.href]) ? "page" : undefined}
                >
                  {entry.label}
                </Link>
              ) : (
                <details key={entry.id} className="drawer-group" open={isActive(pathname, entry.match) || undefined}>
                  <summary>
                    {entry.label}
                    <Glyph name="caret" size={14} className="nav-caret" />
                  </summary>
                  <ul>
                    <li>
                      <Link href={entry.overview.href} aria-current={pathname === entry.overview.href ? "page" : undefined}>
                        {entry.overview.label}
                      </Link>
                    </li>
                    {entry.groups.flatMap((g) => g.links).map((link) => (
                      <li key={link.href}>
                        {link.external ? (
                          <a href={link.href} target="_blank" rel="noopener noreferrer">
                            {link.label}
                          </a>
                        ) : (
                          <Link href={link.href} aria-current={pathname === link.href ? "page" : undefined}>
                            {link.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              ),
            )}
            <div className="drawer-contact">
              <Link href={consultHref} className="btn btn-primary btn-lg">
                {consultLabel}
              </Link>
              <a href={site.phoneHref} className="btn btn-secondary btn-lg">
                Call {site.phone}
              </a>
            </div>
          </nav>
        </div>
      </header>
      <div className="nav-scrim" data-open={open !== null} aria-hidden="true" onClick={() => setOpen(null)} />
    </>
  );
}

function MegaLink({ link, pathname }: { link: MenuLink; pathname: string }) {
  const content = (
    <>
      {link.glyph ? <Glyph name={link.glyph} size={20} /> : <span aria-hidden="true" />}
      <span>
        <b>{link.label}</b>
        {link.line ? <span>{link.line}</span> : null}
      </span>
    </>
  );
  if (link.external) {
    return (
      <a href={link.href} className="mega-link" target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }
  return (
    <Link href={link.href} className="mega-link" aria-current={pathname === link.href ? "page" : undefined}>
      {content}
    </Link>
  );
}
