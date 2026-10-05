import Link from "next/link";
import { CtaBand } from "@/components/site/CtaBand";
import { Glyph } from "@/components/site/Glyph";
import { PageHero } from "@/components/site/PageHero";
import { Section, SectionHead } from "@/components/site/Section";
import { formatDate } from "@/lib/date";
import { pageMetadata } from "@/lib/metadata";
import { getPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "IT Resources for Business Leaders",
  description:
    "Articles, answers to common questions, and client support from 4EOS, the Fort Wayne managed IT and cybersecurity provider.",
  path: "/resources",
});

const hubs = [
  {
    glyph: "roadmap" as const,
    title: "Insights",
    body: "Practical articles on choosing a provider, planning technology spend, and protecting the business.",
    href: "/blog",
    link: "Read the insights",
  },
  {
    glyph: "check" as const,
    title: "Frequently asked questions",
    body: "Pricing, assessments, switching providers, and what each service includes, answered plainly.",
    href: "/faq",
    link: "Browse the FAQ",
  },
  {
    glyph: "call" as const,
    title: "Client support",
    body: `Existing clients can call ${site.phone}, email the help desk, or start a remote session.`,
    href: "/support",
    link: "Get client support",
  },
];

export default function ResourcesPage() {
  const posts = getPosts().slice(0, 3);

  return (
    <>
      <PageHero
        crumbs={[{ name: "Resources", path: "/resources" }]}
        title="Resources"
        lede="Useful reading for leaders making technology decisions, and a direct line to the help desk for existing clients."
      />
      <Section labelledBy="hubs-title">
        <h2 id="hubs-title" className="sr-only">
          Resource areas
        </h2>
        <ul className="tile-grid tile-grid-3">
          {hubs.map((h) => (
            <li key={h.href} className="tile">
              <Glyph name={h.glyph} size={28} className="accent" />
              <h3 className="t-title">{h.title}</h3>
              <p className="body-sm">{h.body}</p>
              <Link href={h.href} className="svc-card-cta">
                {h.link}
                <span aria-hidden="true" className="btn-arrow">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
      {posts.length ? (
        <Section tone="bone" labelledBy="latest-title">
          <SectionHead id="latest-title" title="Latest insights" />
          <ul className="tile-grid tile-grid-3">
            {posts.map((p) => (
              <li key={p.slug} className="tile">
                <p className="label">
                  <time dateTime={p.date}>{formatDate(p.date)}</time>
                </p>
                <h3 className="t-title-sm">{p.title}</h3>
                <Link href={`/blog/${p.slug}`} className="svc-card-cta">
                  Read the article
                  <span aria-hidden="true" className="btn-arrow">
                    →
                  </span>
                  <span className="sr-only">: {p.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
      <CtaBand topic="assessment" />
    </>
  );
}
