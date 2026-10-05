import Link from "next/link";
import type { ReactNode } from "react";
import { consultHref, consultLabel, site } from "@/lib/site";
import { Footer } from "./Footer";
import { Glyph } from "./Glyph";
import { Nav } from "./Nav";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Nav />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
      <nav className="mobile-bar surface-ink" aria-label="Quick actions">
        <Link href={consultHref} className="btn btn-primary">
          {consultLabel}
        </Link>
        <a href={site.phoneHref} className="btn btn-secondary" aria-label={`Call 4EOS at ${site.phone}`}>
          <Glyph name="call" size={16} />
          Call
        </a>
      </nav>
    </>
  );
}
