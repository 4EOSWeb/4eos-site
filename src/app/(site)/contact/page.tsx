import Link from "next/link";
import { IntakeForm } from "@/components/forms/IntakeForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Glyph } from "@/components/site/Glyph";
import { Section, SectionHead } from "@/components/site/Section";
import { isTopic } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { webPageSchema } from "@/lib/schema";
import { addressLine, consultLabel, site } from "@/lib/site";

const description = `Schedule a consultation or a free IT assessment with 4EOS in Fort Wayne. Call ${site.phone}, email ${site.sales}, or send the form.`;

export const metadata = pageMetadata({
  title: "Contact 4EOS and Schedule a Consultation",
  description,
  path: "/contact",
});

const steps = [
  "A senior engineer reads your note and replies within one business day.",
  "A short call to understand the business, the team, and what is not working.",
  "If it helps, a free IT assessment with a plain-English summary of risks.",
];

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const raw = (await searchParams).topic;
  const topic = typeof raw === "string" && isTopic(raw) ? raw : "assessment";
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.name} ${addressLine}`)}`;

  return (
    <>
      <JsonLd data={webPageSchema({ title: "Contact 4EOS", description, path: "/contact", type: "ContactPage" })} />
      <section className="surface-ink" aria-labelledby="contact-title">
        <div className="wrap pb-[var(--section-y)] pt-8">
          <Breadcrumbs items={[{ name: "Contact", path: "/contact" }]} />
          <div className="split mt-10">
            <div className="section-head">
              <h1 id="contact-title" className="display t-page">
                {consultLabel}
              </h1>
              <p className="lede">
                Tell us where things stand. You will hear from an engineer, not a sales queue, and the first conversation
                carries no obligation.
              </p>
              <ol className="number-list rule-list mt-4">
                {steps.map((s) => (
                  <li key={s}>
                    <p className="body-sm">{s}</p>
                  </li>
                ))}
              </ol>
              <p className="body-sm">
                Already a client with an issue?{" "}
                <Link href="/support" className="text-link">
                  Go to client support
                </Link>
                .
              </p>
            </div>
            <div>
              <IntakeForm endpoint="/api/contact" intent="assessment" submitLabel={consultLabel} defaultTopic={topic} />
            </div>
          </div>
        </div>
      </section>

      <Section labelledBy="reach-title">
        <SectionHead id="reach-title" title="Other ways to reach us" />
        <ul className="tile-grid tile-grid-3">
          <li className="tile">
            <Glyph name="call" size={24} className="accent" />
            <h3 className="t-title-sm">Call</h3>
            <p className="body-sm">{site.hours}</p>
            <a href={site.phoneHref} className="svc-card-cta">
              {site.phone}
            </a>
          </li>
          <li className="tile">
            <Glyph name="mail" size={24} className="accent" />
            <h3 className="t-title-sm">Email</h3>
            <p className="body-sm">
              New business goes to sales. Clients with an issue can email{" "}
              <a href={`mailto:${site.helpdesk}`} className="text-link relative z-10">
                {site.helpdesk}
              </a>
              .
            </p>
            <a href={`mailto:${site.sales}`} className="svc-card-cta">
              {site.sales}
            </a>
          </li>
          <li className="tile">
            <Glyph name="pin" size={24} className="accent" />
            <h3 className="t-title-sm">Visit</h3>
            <address className="body-sm not-italic">
              {addressLine}
              <br />
              Fax {site.fax}
            </address>
            <a href={mapHref} className="svc-card-cta" target="_blank" rel="noopener noreferrer">
              Get directions
              <Glyph name="external" size={14} />
              <span className="sr-only"> (opens Google Maps in a new tab)</span>
            </a>
          </li>
        </ul>
      </Section>
    </>
  );
}
