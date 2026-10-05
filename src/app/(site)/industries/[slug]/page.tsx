import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/site/Button";
import { CtaBand } from "@/components/site/CtaBand";
import { FaqList } from "@/components/site/FaqList";
import { Glyph } from "@/components/site/Glyph";
import { PageHero } from "@/components/site/PageHero";
import { Section, SectionHead, SplitSection } from "@/components/site/Section";
import { ServiceCard } from "@/components/site/ServiceCard";
import { getService, industries } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { webPageSchema } from "@/lib/schema";
import { consultHref, consultLabel, site } from "@/lib/site";

export function generateStaticParams() {
  return industries.map((i) => ({ slug: i.slug }));
}

function find(slug: string) {
  return industries.find((i) => i.slug === slug);
}

export async function generateMetadata({ params }: PageProps<"/industries/[slug]">): Promise<Metadata> {
  const industry = find((await params).slug);
  if (!industry) return {};
  return pageMetadata({
    title: `IT Services for ${industry.title} in Fort Wayne`,
    description: industry.summary,
    path: `/industries/${industry.slug}`,
  });
}

export default async function IndustryPage({ params }: PageProps<"/industries/[slug]">) {
  const industry = find((await params).slug);
  if (!industry) notFound();
  const path = `/industries/${industry.slug}`;
  const others = industries.filter((i) => i.slug !== industry.slug);

  return (
    <>
      <JsonLd
        data={webPageSchema({
          title: `IT Services for ${industry.title}`,
          description: industry.summary,
          path,
        })}
      />
      <PageHero
        crumbs={[
          { name: "Industries", path: "/industries" },
          { name: industry.title, path },
        ]}
        kicker={<p className="label">IT for {industry.title.toLowerCase()}</p>}
        title={industry.headline}
        lede={industry.summary}
        actions={
          <>
            <ButtonLink href={consultHref} size="lg">
              {consultLabel}
            </ButtonLink>
            <ButtonLink href={site.phoneHref} variant="secondary" size="lg">
              Call {site.phone}
            </ButtonLink>
          </>
        }
      />

      <Section labelledBy="pressures-title">
        <SplitSection
          aside={
            <div className="section-head">
              <h2 id="pressures-title" className="display t-section">
                What we plan for
              </h2>
              <ul className="rule-list mt-6">
                {industry.pressures.map((p) => (
                  <li key={p} className="body-sm flex gap-3 !py-4">
                    <Glyph name="alert" size={18} className="accent mt-0.5 shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          }
        >
          <h3 className="t-title">How 4EOS helps</h3>
          <p className="lede mt-3">{industry.offer}</p>
          <ol className="number-list rule-list mt-8">
            {industry.how.map((h) => (
              <li key={h}>
                <p className="text-[length:var(--text-lg)] leading-snug">{h}</p>
              </li>
            ))}
          </ol>
        </SplitSection>
      </Section>

      <Section tone="bone" labelledBy="services-title">
        <SectionHead
          id="services-title"
          title={`Services ${industry.title.toLowerCase()} clients lean on`}
          lede="Every engagement starts with an assessment, so the plan reflects your systems rather than a generic package."
        />
        <div className="svc-grid">
          {industry.services.map((s, i) => {
            const svc = getService(s);
            return (
              <ServiceCard
                key={s}
                service={svc}
                variant={i === 0 ? "feature" : "standard"}
                points={i === 0 ? svc.included.slice(0, 3).map((x) => x.title) : undefined}
              />
            );
          })}
        </div>
      </Section>

      <Section labelledBy="faq-title">
        <SplitSection
          aside={
            <SectionHead
              id="faq-title"
              title={`${industry.title} questions`}
              lede={
                <>
                  More answers in the{" "}
                  <Link href="/faq" className="text-link">
                    full FAQ
                  </Link>
                  .
                </>
              }
            />
          }
        >
          <FaqList items={industry.faqs} />
        </SplitSection>
      </Section>

      <Section tone="bone" labelledBy="other-title">
        <SectionHead id="other-title" title="Other industries we support" />
        <ul className="flex flex-wrap gap-3">
          {others.map((o) => (
            <li key={o.slug}>
              <ButtonLink href={`/industries/${o.slug}`} variant="secondary">
                {o.title}
              </ButtonLink>
            </li>
          ))}
        </ul>
      </Section>

      <CtaBand
        title={`Talk to 4EOS about IT for ${industry.title.toLowerCase()}.`}
        topic="assessment"
      />
    </>
  );
}
