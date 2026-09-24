import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { addressLine, nav, site, utilityNav } from "@/lib/site";
import { Rule } from "./Sheet";

export function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-fg transition-colors hover:border-[rgba(245,183,0,0.55)] hover:text-gold"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
          {children}
        </svg>
      </a>
    </li>
  );
}

export function Footer() {
  return (
    <footer className="sheet-ink-glass relative z-10 mt-[var(--sheet-inset)] mb-[var(--sheet-inset)] mx-[var(--sheet-inset)] overflow-hidden rounded-[var(--radius-sheet)] text-fg">
      <div className="sheet-pad py-16 md:py-20">
        <div className="grid gap-16 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <Link href="/" aria-label="4EOS home" className="inline-flex">
              <Logo mark="line" height={36} />
            </Link>
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
          <ul className="flex items-center gap-2">
            <SocialLink href={site.social.facebook} label="Facebook">
              <path d="M14.2 8.5h-2V7.1c0-.5.3-.6.6-.6h1.4V4.5h-1.9C10.2 4.5 9.2 5.6 9.2 7.4v1.1H7.6V11h1.6V19h2.6v-8H14l.2-2.5z" />
            </SocialLink>
            <SocialLink href={site.social.linkedin} label="LinkedIn">
              <path d="M6.7 9H4.5v10h2.2V9zM5.6 4.6c-.7 0-1.2.5-1.2 1.2s.5 1.2 1.2 1.2 1.2-.5 1.2-1.2-.5-1.2-1.2-1.2zM19.5 19h-2.2v-4.7c0-1.1 0-2.6-1.6-2.6s-1.8 1.2-1.8 2.5V19H11.7V9h2.1v1.3h.1c.3-.6 1-1.2 2.1-1.2 2.2 0 2.6 1.5 2.6 3.4V19z" />
            </SocialLink>
            <SocialLink href={site.social.x} label="X">
              <path d="M16.6 4.8h2l-4.4 5L19.6 19h-3.9l-3-4L9.2 19H7.2l4.7-5.4L4.6 4.8h4l2.8 3.7 5.2-3.7zm-.7 12.8h1.1L8.2 6.1H7.1l8.8 11.5z" />
            </SocialLink>
          </ul>
          <p className="micro text-fg-faint">{addressLine}</p>
        </div>
      </div>
    </footer>
  );
}
