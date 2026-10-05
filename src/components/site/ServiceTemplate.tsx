import Link from "next/link";
import { MidwestLogo } from "@/components/brand/MidwestLogo";
import { JsonLd } from "@/components/seo/JsonLd";
import { getService, tiers, type ServiceSlug } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { serviceSchema } from "@/lib/schema";
import { site } from "@/lib/site";
import { ButtonLink } from "./Button";
import { CtaBand } from "./CtaBand";
import { Diagram } from "./Diagram";
import { FaqList } from "./FaqList";
import { Glyph } from "./Glyph";
import { PageHero } from "./PageHero";
import { Section, SectionHead, SplitSection } from "./Section";
import { ServiceCard } from "./ServiceCard";

export function serviceMetadata(slug: ServiceSlug) {
  const s = getService(slug);
  const name = s.title.length > 40 ? s.short : s.title;
  return pageMetadata({
    title: s.family ? `${name} in Fort Wayne` : `${name} for Fort Wayne Businesses`,
    description: s.meta ?? s.summary,
    path: s.href,
    hasImageFile: true,
  });
}

export function ServiceTemplate({ slug }: { slug: ServiceSlug }) {
  const s = getService(slug);
  const parent = s.parent ? getService(s.parent) : null;
  const crumbs = [
    { name: "Services", path: "/services" },
    ...(parent ? [{ name: parent.short, path: parent.href }] : []),
    { name: s.short, path: s.href },
  ];
  const topicHref = `/contact?topic=${s.cta.topic}`;
  const children = slug === "managed-it" ? [getService("backup-disaster-recovery"), getService("network-infrastructure")] : [];

  return (
    <>
      <JsonLd data={serviceSchema(s)} />
      <PageHero
        crumbs={crumbs}
        kicker={
          s.family === "Midwest VoIP" ? (
            <MidwestLogo height={40} title="Midwest VoIP, part of the 4EOS family" />
          ) : s.family === "SafeHouse DataCenter" ? (
            <p className="label">Part of the 4EOS family</p>
          ) : null
        }
        title={s.title}
        lede={
          <>
            <span className="t-title block text-[var(--fg)]">{s.headline}.</span>
            <span className="mt-4 block">{s.summary}</span>
          </>
        }
        actions={
          <>
            <ButtonLink href={topicHref} size="lg">
              {s.cta.label}
            </ButtonLink>
            <ButtonLink href={site.phoneHref} variant="secondary" size="lg">
              Call {site.phone}
            </ButtonLink>
          </>
        }
        figure={<Diagram slug={slug} />}
      />

      <Section labelledBy="why-title">
        <SplitSection
          aside={
            <div className="section-head">
              <h2 id="why-title" className="display t-section">
                Signs it is time
              </h2>
              <ul className="rule-list mt-6">
                {s.problems.map((p) => (
                  <li key={p} className="body-sm flex gap-3 !py-4">
                    <Glyph name="alert" size={18} className="accent mt-0.5 shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          }
        >
          <div className="prose text-[length:var(--text-lg)]">
            {s.body.map((para) => (
              <p key={para.slice(0, 32)}>{para}</p>
            ))}
          </div>
        </SplitSection>
      </Section>

      <Section tone="bone" labelledBy="included-title">
        <SectionHead id="included-title" title="What is included" />
        <ul className="capability-grid">
          {s.included.map((item) => (
            <li key={item.title}>
              <h3 className="t-title-sm">{item.title}</h3>
              <p className="body-sm mt-2">{item.body}</p>
            </li>
          ))}
        </ul>
        {slug === "cybersecurity" ? (
          <div className="actions mt-10">
            <ButtonLink href="/secureai" variant="secondary" arrow>
              See SecureAI plans
            </ButtonLink>
          </div>
        ) : null}
      </Section>

      {slug === "managed-it" ? <Tiers /> : null}

      {children.length ? (
        <Section labelledBy="more-title">
          <SectionHead
            id="more-title"
            title="Part of managed IT"
            lede="Two areas inside CompleteCare deserve their own explanation, because they decide whether the business can recover and grow."
          />
          <div className="svc-grid">
            {children.map((c) => (
              <ServiceCard key={c.slug} service={c} variant="feature" points={c.included.slice(0, 3).map((i) => i.title)} />
            ))}
          </div>
        </Section>
      ) : null}

      <Section labelledBy="delivery-title">
        <SplitSection
          reverse
          aside={
            <div className="section-head">
              <h2 id="delivery-title" className="display t-section">
                How 4EOS delivers it
              </h2>
              <p className="lede">
                Every engagement starts with an assessment and a plan you can read. Projects are quoted in advance, so
                you know the scope and the cost before work begins.
              </p>
              <div className="actions pt-2">
                <ButtonLink href={topicHref} variant="secondary" arrow>
                  {s.cta.label}
                </ButtonLink>
              </div>
            </div>
          }
        >
          <ol className="number-list rule-list">
            {s.delivery.map((d) => (
              <li key={d}>
                <p className="text-[length:var(--text-lg)] leading-snug">{d}</p>
              </li>
            ))}
          </ol>
        </SplitSection>
      </Section>

      <Section tone="bone" labelledBy="faq-title">
        <SplitSection
          aside={
            <SectionHead
              id="faq-title"
              title={`${s.short} questions`}
              lede={
                <>
                  Straight answers to what leaders ask us most. More in the{" "}
                  <Link href="/faq" className="text-link">
                    full FAQ
                  </Link>
                  .
                </>
              }
            />
          }
        >
          <FaqList items={s.faqs} />
        </SplitSection>
      </Section>

      <Section labelledBy="related-title">
        <SectionHead id="related-title" title="Related services" />
        <div className="svc-grid">
          {s.related.map((r) => (
            <ServiceCard key={r} service={getService(r)} />
          ))}
        </div>
      </Section>

      <CtaBand
        title={`Talk to 4EOS about ${s.short.replace(" / vCIO", " and vCIO")}.`}
        lede="Tell us where things stand. A senior engineer will follow up within one business day, and the first conversation carries no obligation."
        topic={s.cta.topic}
      />
    </>
  );
}

function Tiers() {
  return (
    <Section labelledBy="tiers-title">
      <SectionHead
        id="tiers-title"
        title="Three levels of CompleteCare"
        lede="Choose the coverage that fits today and move up as the business grows. Pricing is per user and set after the free assessment, so you pay for your environment, not a generic package."
      />
      <ol className="tile-grid tile-grid-3">
        {tiers.map((t, i) => (
          <li key={t.name} className={`tile ${i === 1 ? "svc-card-ink" : ""}`}>
            <h3 className="t-title">{t.name}</h3>
            <p className="body-sm">{t.fit}</p>
            <ul className="svc-card-points mt-2">
              {t.points.map((p) => (
                <li key={p}>
                  <Glyph name="check" size={14} />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <p className="body-sm mt-6">
        Typical managed IT pricing runs about $100 to $200 per user per month, depending on what is included. 4EOS
        quotes a fixed monthly price after the assessment.
      </p>
    </Section>
  );
}
