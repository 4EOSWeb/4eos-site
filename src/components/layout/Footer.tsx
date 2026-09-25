import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { MidwestLogo } from "@/components/brand/MidwestLogo";
import { addressLine, nav, site, utilityNav } from "@/lib/site";
import { SocialMarks } from "./SocialMarks";
import { Rule } from "./Sheet";

export function Footer() {
  return (
    <footer className="sheet-ink-glass relative z-10 mt-[var(--sheet-inset)] mb-[var(--sheet-inset)] mx-[var(--sheet-inset)] overflow-hidden rounded-[var(--radius-sheet)] text-fg">
      <div className="sheet-pad py-16 md:py-20">
        <div className="grid gap-16 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <div className="flex flex-wrap items-center gap-5">
              <Link href="/" aria-label="4EOS home" className="inline-flex">
                <Logo mark="line" height={36} />
              </Link>
              <Link href="/services/voip" aria-label="Midwest VoIP" className="inline-flex text-inherit">
                <MidwestLogo height={36} />
              </Link>
            </div>
            <p className="lede mt-8 max-w-sm">
              {site.tagline}
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-8 md:col-span-7 md:grid-cols-3"
          >
            <div>
              <p className="micro text-fg-faint">Practice</p>
              <ul className="mt-4 space-y-2">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm tracking-tight transition-colors hover:text-gold"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="micro text-fg-faint">Reach</p>
              <ul className="mt-4 space-y-2">
                {utilityNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm tracking-tight transition-colors hover:text-gold"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="micro text-fg-faint">Office</p>
              <address className="mt-4 space-y-2 not-italic text-sm tracking-tight text-fg-muted">
                <p>{site.address.street}</p>
                <p>
                  {site.address.city}, {site.address.region} {site.address.postal}
                </p>
                <p>
                  <a href={site.phoneHref} className="hover:text-gold">
                    {site.phone}
                  </a>
                </p>
                <p>
                  <a
                    href={`mailto:${site.helpdesk}`}
                    className="hover:text-gold"
                  >
                    {site.helpdesk}
                  </a>
                </p>
              </address>
            </div>
          </nav>
        </div>

        <Rule className="my-10" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="micro text-fg-faint">
            © 2026 {site.name}. Fort Wayne, Indiana.
          </p>
          <SocialMarks />
          <p className="micro text-fg-faint">{addressLine}</p>
        </div>
      </div>
    </footer>
  );
}
