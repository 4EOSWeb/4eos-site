import Link from "next/link";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/site/Button";
import { SiteShell } from "@/components/site/SiteShell";
import { consultHref, consultLabel, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

const paths = [
  { href: "/services", label: "All services" },
  { href: "/managed-it", label: "Managed IT Services" },
  { href: "/cybersecurity", label: "Cybersecurity" },
  { href: "/industries", label: "Industries we support" },
  { href: "/support", label: "Client support" },
  { href: "/contact", label: "Contact 4EOS" },
];

export default function NotFound() {
  return (
    <SiteShell>
      <section className="section surface-ink" aria-labelledby="nf-title">
        <div className="wrap">
          <div className="section-head">
            <p className="label">Error 404</p>
            <h1 id="nf-title" className="display t-page">
              We could not find that page
            </h1>
            <p className="lede">
              The link may be out of date, or the page may have moved during our site update. These are the places most
              people are looking for.
            </p>
          </div>
          <ul className="mt-10 grid max-w-2xl gap-1 sm:grid-cols-2">
            {paths.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="link-arrow">
                  {p.label}
                  <span aria-hidden="true" className="btn-arrow">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="actions mt-10">
            <ButtonLink href={consultHref}>{consultLabel}</ButtonLink>
            <ButtonLink href={site.phoneHref} variant="secondary">
              Call {site.phone}
            </ButtonLink>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
