import Link from "next/link";
import { MidwestLogo } from "@/components/brand/MidwestLogo";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/site/Button";
import { CtaBand } from "@/components/site/CtaBand";
import { Glyph } from "@/components/site/Glyph";
import { PageHero } from "@/components/site/PageHero";
import { ProofSlot } from "@/components/site/ProofSlot";
import { Section, SectionHead, SplitSection } from "@/components/site/Section";
import { differentiators, getService } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { webPageSchema } from "@/lib/schema";
import { consultHref, consultLabel, leadership, site } from "@/lib/site";

const description =
  "4EOS has provided managed IT, cybersecurity, and IT strategy to Fort Wayne and Northeast Indiana businesses since 2002. Meet the team and see how we work.";

export const metadata = pageMetadata({
  title: "About 4EOS, a Fort Wayne IT Partner Since 2002",
  description,
  path: "/about",
});

const values = [
  {
    title: "Technical excellence",
    body: "Certified engineers, proven tools, and documented processes that hold up when something goes wrong.",
  },
  {
    title: "Business integrity",
    body: "Clear pricing, and recommendations sized to what the business needs rather than what earns the most.",
  },
  {
    title: "Client success",
    body: "We measure the work by how well your business runs, not by tickets closed. The goal is to help you lead with technology.",
  },
];

export default function AboutPage() {
  const voip = getService("voip");
  const dc = getService("data-center");

  return (
    <>
      <JsonLd data={webPageSchema({ title: "About 4EOS", description, path: "/about", type: "AboutPage" })} />
      <PageHero
        crumbs={[{ name: "About 4EOS", path: "/about" }]}
        kicker={<p className="label">Fort Wayne, Indiana · Since {site.founded}</p>}
        title="A partner that owns your IT, not a vendor that rents it"
        lede={`${site.name} (${site.legalName}) has supported businesses across ${site.serviceArea} for more than two decades. We take responsibility for the technology so leadership can focus on the business.`}
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

      <Section labelledBy="story-title">
        <SplitSection
          aside={
            <div className="section-head">
              <h2 id="story-title" className="display t-section">
                Who we are
              </h2>
              <dl className="fact-list mt-6">
                <div>
                  <dt>Founded</dt>
                  <dd>{site.founded}, in Fort Wayne</dd>
                </div>
                <div>
                  <dt>Service area</dt>
                  <dd>{site.serviceArea}</dd>
                </div>
                <div>
                  <dt>Partners</dt>
                  <dd>{site.partners.join(", ")}</dd>
                </div>
                <div>
                  <dt>Framework</dt>
                  <dd>NIST Cybersecurity Framework</dd>
                </div>
              </dl>
            </div>
          }
        >
          <div className="prose text-[length:var(--text-lg)]">
            <p>
              4EOS started in Fort Wayne in {site.founded} and has grown into a full managed IT practice: day-to-day
              support, cybersecurity, cloud and Microsoft 365, networks, hardware, and executive IT strategy.
            </p>
            <p>
              The idea has stayed the same. Growing businesses deserve the kind of technology leadership large companies
              take for granted, delivered by people who know their office, their staff, and their goals.
            </p>
            <p>
              Through partnerships with Dell, Microsoft, and Cisco, we source business-grade hardware and software at
              fair prices. 4EOS is the largest Dell reseller in Northeast Indiana, and every recommendation is sized to
              the job in front of us.
            </p>
          </div>
        </SplitSection>
      </Section>

      <Section tone="ink" labelledBy="why-title">
        <SplitSection
          sticky
          aside={
            <div className="section-head">
              <h2 id="why-title" className="display t-section">
                Why businesses choose 4EOS
              </h2>
              <p className="lede">
                Eyes On Site is how we describe it: technology went remote, and our engineers still show up.
              </p>
              <ProofSlot kind="photo" note="Real photo of the 4EOS office or team. No stock photography." />
            </div>
          }
        >
          <ol className="number-list rule-list">
            {differentiators.map((d) => (
              <li key={d.title}>
                <div>
                  <h3 className="t-title-sm">{d.title}</h3>
                  <p className="body-sm mt-2">{d.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </SplitSection>
      </Section>

      <Section labelledBy="values-title">
        <SectionHead id="values-title" title="What we hold ourselves to" />
        <ul className="capability-grid">
          {values.map((v) => (
            <li key={v.title}>
              <h3 className="t-title-sm">{v.title}</h3>
              <p className="body-sm mt-2">{v.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="bone" labelledBy="team-title">
        <SectionHead
          id="team-title"
          title="Leadership"
          lede="The people accountable for your environment, from strategy to the engineering bench."
        />
        <ul className="tile-grid tile-grid-3">
          {leadership.map((p) => (
            <li key={p.name} className="tile">
              <h3 className="t-title-sm">{p.name}</h3>
              <p className="label">{p.role}</p>
              <p className="body-sm">{p.focus}</p>
              <a href={p.linkedin} className="svc-card-cta" rel="noopener noreferrer" target="_blank">
                {p.name.split(" ")[0]} on LinkedIn
                <Glyph name="external" size={14} />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <Section labelledBy="family-title">
        <SectionHead
          id="family-title"
          title="The 4EOS family"
          lede="Two companies in the family extend what we can take off your plate, with one team accountable for all of it."
        />
        <div className="tile-grid">
          <article className="tile">
            <div className="family-mark">
              <MidwestLogo height={32} />
            </div>
            <h3 className="sr-only">{voip.title}</h3>
            <p className="body-sm">{voip.summary}</p>
            <Link href={voip.href} className="svc-card-cta">
              Explore Midwest VoIP
              <span aria-hidden="true" className="btn-arrow">
                →
              </span>
            </Link>
          </article>
          <article className="tile">
            <div className="family-mark">
              <Glyph name="rack" size={28} className="accent" />
              <span className="t-title-sm">SafeHouse DataCenter</span>
            </div>
            <h3 className="sr-only">{dc.title}</h3>
            <p className="body-sm">{dc.summary}</p>
            <Link href={dc.href} className="svc-card-cta">
              Explore SafeHouse DataCenter
              <span aria-hidden="true" className="btn-arrow">
                →
              </span>
            </Link>
          </article>
        </div>
      </Section>

      <CtaBand title="Meet the team behind your IT." topic="assessment" />
    </>
  );
}
