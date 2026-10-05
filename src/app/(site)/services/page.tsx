import Link from "next/link";
import { ButtonLink } from "@/components/site/Button";
import { CtaBand } from "@/components/site/CtaBand";
import { Glyph } from "@/components/site/Glyph";
import { PageHero } from "@/components/site/PageHero";
import { ProcessSteps } from "@/components/site/ProcessSteps";
import { Section, SectionHead } from "@/components/site/Section";
import { ServiceCard } from "@/components/site/ServiceCard";
import { getService, type ServiceSlug } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { consultHref, consultLabel } from "@/lib/site";

export const metadata = pageMetadata({
  title: "IT Services for Growing Businesses",
  description:
    "Every 4EOS service in one place: managed IT, backup and disaster recovery, network infrastructure, cybersecurity, SecureAI, cloud and Microsoft 365, IT strategy and vCIO, hardware, Midwest VoIP, and SafeHouse DataCenter.",
  path: "/services",
});

const groups: { id: string; title: string; lede: string; slugs: ServiceSlug[]; secureai?: boolean }[] = [
  {
    id: "run",
    title: "Run and protect the business",
    lede: "Day-to-day IT handled for you, with recovery you have tested and a network built for growth.",
    slugs: ["managed-it", "backup-disaster-recovery", "network-infrastructure"],
  },
  {
    id: "secure",
    title: "Secure and modernize",
    lede: "Security you can explain to an auditor, cloud decisions that make financial sense, and hardware sized to the work.",
    slugs: ["cybersecurity", "cloud-microsoft-365", "hardware"],
    secureai: true,
  },
  {
    id: "lead",
    title: "Lead and plan",
    lede: "Executive IT guidance and a roadmap, without hiring a full-time CIO.",
    slugs: ["it-strategy"],
  },
  {
    id: "family",
    title: "The 4EOS family",
    lede: "Business phones and a Fort Wayne data center, supported by the same team that runs your IT.",
    slugs: ["voip", "data-center"],
  },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Services", path: "/services" }]}
        title="IT services for growing businesses"
        lede="Choose one service or hand 4EOS the whole environment. Either way, one accountable team in Fort Wayne runs it, secures it, and plans what comes next."
        actions={
          <>
            <ButtonLink href={consultHref} size="lg">
              {consultLabel}
            </ButtonLink>
            <ButtonLink href="/contact?topic=assessment" variant="secondary" size="lg">
              Get an IT Assessment
            </ButtonLink>
          </>
        }
      />
      {groups.map((g, gi) => (
        <Section key={g.id} id={g.id} tone={gi % 2 ? "bone" : "paper"} labelledBy={`${g.id}-title`}>
          <SectionHead id={`${g.id}-title`} title={g.title} lede={g.lede} />
          <div className="svc-grid">
            {g.slugs.map((slug) => {
              const s = getService(slug);
              return (
                <ServiceCard
                  key={slug}
                  service={s}
                  variant={g.slugs.length === 3 && !g.secureai ? "standard" : "feature"}
                  points={s.included.slice(0, 3).map((x) => x.title)}
                />
              );
            })}
            {g.secureai ? (
              <article className="svc-card svc-feature">
                <Glyph name="ai" size={28} className="accent" />
                <h3 className="t-title-sm">SecureAI</h3>
                <p className="body-sm">60+ AI models, including GPT-4 and Claude, on one secure, managed platform.</p>
                <Link href="/secureai" className="svc-card-cta">
                  Explore SecureAI
                  <span aria-hidden="true" className="btn-arrow">
                    →
                  </span>
                </Link>
              </article>
            ) : null}
            {g.id === "lead" ? (
              <article className="svc-card svc-feature surface-bone">
                <Glyph name="check" size={28} className="accent" />
                <h3 className="t-title-sm">Not sure where to start?</h3>
                <p className="body-sm">
                  A free assessment by a senior engineer shows where the risk is and what to fix first. No obligation.
                </p>
                <Link href="/contact?topic=assessment" className="svc-card-cta">
                  Get an IT Assessment
                  <span aria-hidden="true" className="btn-arrow">
                    →
                  </span>
                </Link>
              </article>
            ) : null}
          </div>
        </Section>
      ))}
      <Section labelledBy="process-title">
        <SectionHead
          id="process-title"
          title="How we start"
          lede="Whatever you need first, the engagement follows the same four steps."
        />
        <ProcessSteps />
      </Section>
      <CtaBand />
    </>
  );
}
