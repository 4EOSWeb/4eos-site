import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { SocialMarks } from "./SocialMarks";
import { getService, industries } from "@/lib/content";
import { consultHref, consultLabel, site } from "@/lib/site";

const serviceLinks = (
  ["managed-it", "backup-disaster-recovery", "network-infrastructure", "cybersecurity", "cloud-microsoft-365", "it-strategy", "hardware"] as const
).map((slug) => {
  const s = getService(slug);
  return { href: s.href, label: s.short };
});

const columns = [
  { heading: "Services", links: [...serviceLinks, { href: "/secureai", label: "SecureAI" }, { href: "/services", label: "All services" }] },
  {
    heading: "Industries",
    links: [...industries.map((i) => ({ href: `/industries/${i.slug}`, label: i.title })), { href: "/industries", label: "All industries" }],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About 4EOS" },
      { href: "/voip", label: "Midwest VoIP" },
      { href: "/data-center", label: "SafeHouse DataCenter" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { href: "/resources", label: "Resources" },
      { href: "/blog", label: "Insights" },
      { href: "/faq", label: "FAQ" },
      { href: "/support", label: "Client support" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="site-footer surface-ink">
      <div className="wrap">
        <div className="footer-top">
          <div className="grid content-start gap-6">
            <Link href="/" aria-label="4EOS home" className="nav-brand">
              <Logo mark="line" height={34} />
            </Link>
            <p className="body-sm max-w-[32ch]">{site.tagline}</p>
            <div>
              <Link href={consultHref} className="btn btn-primary">
                {consultLabel}
              </Link>
            </div>
          </div>
          <nav aria-label="Footer" className="footer-nav">
            {columns.map((col) => (
              <div key={col.heading}>
                <h2 className="label">{col.heading}</h2>
                <ul>
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <address className="colophon not-italic">
          {site.name} ({site.legalName}), {site.address.street}, {site.address.city}, {site.address.region}{" "}
          {site.address.postal}. Phone <a href={site.phoneHref}>{site.phone}</a>. Fax {site.fax}. Help desk{" "}
          <a href={`mailto:${site.helpdesk}`}>{site.helpdesk}</a>. Sales <a href={`mailto:${site.sales}`}>{site.sales}</a>. Help
          desk hours {site.hours}; monitoring runs 24/7. Serving {site.serviceArea} since {site.founded}. The 4EOS family includes{" "}
          <Link href="/voip">Midwest VoIP</Link> and <Link href="/data-center">SafeHouse DataCenter</Link>. Partners:{" "}
          {site.partners.join(", ")}. Rated {site.rating.value} on{" "}
          <a href={site.rating.reviewUrl} target="_blank" rel="noopener noreferrer">
            Google
          </a>{" "}
          from {site.rating.count} reviews.
        </address>

        <div className="footer-base">
          <p>
            © {new Date().getFullYear()} {site.name}. Fort Wayne, Indiana.
          </p>
          <nav aria-label="Legal">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/accessibility">Accessibility</Link>
            <Link href="/sitemap.xml" prefetch={false}>
              Sitemap
            </Link>
          </nav>
          <SocialMarks className="social" />
        </div>
      </div>
    </footer>
  );
}
