import Link from "next/link";
import { ButtonLink } from "@/components/site/Button";
import { CtaBand } from "@/components/site/CtaBand";
import { Glyph } from "@/components/site/Glyph";
import { PageHero } from "@/components/site/PageHero";
import { Section, SectionHead } from "@/components/site/Section";
import { getService, industries } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { consultHref, consultLabel } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Industries We Support in Northeast Indiana",
  description:
    "Managed IT and cybersecurity for healthcare, manufacturing, legal, insurance, construction, and private equity firms across Fort Wayne and Northeast Indiana.",
  path: "/industries",
});

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Industries", path: "/industries" }]}
        kicker={<p className="label">Who we help</p>}
        title="IT built around how your industry works"
        lede="Each industry carries its own rules, software, and pressure points. 4EOS fits the same managed IT, security, and strategy practice to the way your firm actually operates."
        actions={
          <>
            <ButtonLink href={consultHref} size="lg">
              {consultLabel}
            </ButtonLink>
            <ButtonLink href="/services" variant="secondary" size="lg">
              Explore Services
            </ButtonLink>
          </>
        }
      />

      <Section labelledBy="industries-title">
        <SectionHead
          id="industries-title"
          title="Six industries, one accountable team"
          lede="Pick your industry to see the pressures we plan for and the services that matter most."
        />
        <ul className="tile-grid tile-grid-3">
          {industries.map((ind) => (
            <li key={ind.slug} className="tile">
              <h3 className="t-title">{ind.title}</h3>
              <p className="body-sm">{ind.offer}</p>
              <ul className="svc-card-points mt-2">
                {ind.pressures.map((p) => (
                  <li key={p}>
                    <Glyph name="check" size={14} />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <p className="tile-meta pt-2">
                {ind.services.map((s) => getService(s).short).join(" · ")}
              </p>
              <Link href={`/industries/${ind.slug}`} className="svc-card-cta">
                IT for {ind.title}
                <span aria-hidden="true" className="btn-arrow">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand
        title="Not on the list? We probably still fit."
        lede="Most of what 4EOS does applies to any growing business with people, data, and systems to protect. Tell us about yours."
        topic="assessment"
      />
    </>
  );
}
