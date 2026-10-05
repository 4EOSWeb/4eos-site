import Link from "next/link";
import { MidwestLogo } from "@/components/brand/MidwestLogo";
import { ButtonLink } from "@/components/site/Button";
import { CtaBand } from "@/components/site/CtaBand";
import { Glyph } from "@/components/site/Glyph";
import { ProcessSteps } from "@/components/site/ProcessSteps";
import { ProofSlot } from "@/components/site/ProofSlot";
import { Section, SectionHead, SplitSection } from "@/components/site/Section";
import { ServiceCard } from "@/components/site/ServiceCard";
import {
  challenges,
  deliverables,
  differentiators,
  getService,
  proofFacts,
  reviews,
} from "@/lib/content";
import { consultHref, consultLabel, site } from "@/lib/site";
import { HeroAtmosphere } from "./HeroAtmosphere";
import { StaticNetwork } from "./StaticNetwork";

export function HomeView() {
  return (
    <>
      <Hero />
      <Challenges />
      <Delivers />
      <Services />
      <WhyUs />
      <Engagement />
      <Credibility />
      <CtaBand />
    </>
  );
}

function Hero() {
  const lead = reviews[1];
  return (
    <section aria-labelledby="hero-title" className="hero surface-ink">
      <HeroAtmosphere>
        <StaticNetwork />
      </HeroAtmosphere>
      <div className="wrap">
        <div className="hero-grid">
          <div className="hero-copy">
            <h1 id="hero-title" className="display t-hero max-w-[14ch]">
              Modern IT leadership for growing businesses
            </h1>
            <p className="lede">
              4EOS helps organizations reduce technology risk, strengthen security, modernize operations, and make
              confident IT decisions through proactive managed services, cybersecurity, cloud expertise, and practical
              strategic guidance.
            </p>
            <div className="actions">
              <ButtonLink href={consultHref} size="lg">
                {consultLabel}
              </ButtonLink>
              <ButtonLink href="/services" variant="secondary" size="lg" arrow>
                Explore Services
              </ButtonLink>
            </div>
            <p className="body-sm">
              Prefer to talk first? Talk to an IT expert:{" "}
              <a href={site.phoneHref} className="text-link whitespace-nowrap">
                {site.phone}
              </a>
            </p>
          </div>
          <figure className="quote max-w-md lg:justify-self-end">
            <p className="label">
              {site.rating.value} out of 5 on Google · {site.rating.count} reviews
            </p>
            <blockquote>
              <p>“I can concentrate on running my business and let 4EOS keep my business running.”</p>
            </blockquote>
            <figcaption>{lead.author}, Google review</figcaption>
          </figure>
        </div>
        <dl className="proof-strip" aria-label="4EOS at a glance">
          {proofFacts.map((f) => (
            <div key={f.title}>
              <dt>{f.title}</dt>
              <dd>{f.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Challenges() {
  return (
    <Section id="challenges" labelledBy="challenges-title">
      <SplitSection
        sticky
        aside={
          <SectionHead
            id="challenges-title"
            title="Where growing businesses get stuck"
            lede="These are the problems leaders bring to us most often. Each one has a business cost, and each one has a practical fix."
          >
            <div className="actions pt-2">
              <ButtonLink href="/contact?topic=assessment" variant="secondary" arrow>
                Get an IT Assessment
              </ButtonLink>
            </div>
          </SectionHead>
        }
      >
        <ul className="rule-list">
          {challenges.map((c) => (
            <li key={c.title} className="challenge">
              <div>
                <h3 className="t-title-sm">{c.title}</h3>
                <p className="challenge-cost body-sm mt-2">{c.cost}</p>
              </div>
              <div className="grid gap-2">
                <p className="challenge-answer body-sm">
                  <Glyph name="check" size={16} />
                  <span>{c.answer}</span>
                </p>
                <Link href={c.href} className="link-arrow">
                  {c.link}
                  <span aria-hidden="true" className="btn-arrow">
                    →
                  </span>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </SplitSection>
    </Section>
  );
}

function Delivers() {
  return (
    <Section id="delivers" tone="bone" labelledBy="delivers-title">
      <SplitSection
        reverse
        aside={
          <div className="section-head">
            <h2 id="delivers-title" className="display t-section">
              What 4EOS delivers
            </h2>
            <p className="lede">
              4EOS works as your IT department and your technology leadership at the same time. We run the day-to-day,
              protect the business, and plan what comes next, with one accountable team in Fort Wayne.
            </p>
            <p className="body">
              That means you stop managing IT vendors and start making decisions with someone who knows your
              environment, your people, and your goals.
            </p>
            <div className="actions pt-2">
              <ButtonLink href="/about" variant="secondary" arrow>
                See How We Help
              </ButtonLink>
            </div>
          </div>
        }
      >
        <ul className="capability-grid">
          {deliverables.map((d) => (
            <li key={d.title}>
              <h3 className="t-title-sm">{d.title}</h3>
              <p className="body-sm mt-2">{d.body}</p>
            </li>
          ))}
        </ul>
      </SplitSection>
    </Section>
  );
}

function Services() {
  const managed = getService("managed-it");
  const cyber = getService("cybersecurity");
  const bcdr = getService("backup-disaster-recovery");
  const strategy = getService("it-strategy");
  const cloud = getService("cloud-microsoft-365");
  const network = getService("network-infrastructure");
  const voip = getService("voip");
  const dc = getService("data-center");
  return (
    <Section id="services" labelledBy="services-title">
      <SectionHead
        id="services-title"
        title="Services built around how your business runs"
        lede="Start with one service or bring the whole environment to 4EOS. Every service is delivered by the same team, so nothing falls between vendors."
      />
      <div className="svc-grid">
        <ServiceCard
          service={managed}
          variant="feature"
          className="svc-card-ink"
          points={managed.included.slice(0, 4).map((i) => i.title)}
        />
        <ServiceCard service={cyber} variant="feature" points={cyber.included.slice(0, 4).map((i) => i.title)} />
        <ServiceCard service={bcdr} variant="wide" points={bcdr.included.slice(0, 3).map((i) => i.title)} />
        <ServiceCard service={strategy} />
        <ServiceCard service={cloud} />
        <ServiceCard service={network} />
        <article className="svc-card surface-bone">
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
      </div>
      <div className="family-band">
        <div className="family-band-head">
          <h3 className="t-title">The 4EOS family</h3>
          <p className="body-sm">
            Business phones and a Fort Wayne data center from companies in the 4EOS family, supported by the same team
            that runs your IT.
          </p>
        </div>
        <article className="family-item">
          <div className="family-mark">
            <MidwestLogo height={32} />
          </div>
          <h4 className="sr-only">{voip.short}</h4>
          <p className="body-sm">{voip.summary.split(":")[0]}.</p>
          <Link href={voip.href} className="svc-card-cta">
            Explore Midwest VoIP
            <span aria-hidden="true" className="btn-arrow">
              →
            </span>
          </Link>
        </article>
        <article className="family-item">
          <div className="family-mark">
            <Glyph name="rack" size={28} className="accent" />
            <span className="t-title-sm">SafeHouse DataCenter</span>
          </div>
          <h4 className="sr-only">{dc.short}</h4>
          <p className="body-sm">Co-location, hosted systems, and offsite recovery in a secure Fort Wayne facility.</p>
          <Link href={dc.href} className="svc-card-cta">
            Explore SafeHouse DataCenter
            <span aria-hidden="true" className="btn-arrow">
              →
            </span>
          </Link>
        </article>
      </div>
    </Section>
  );
}

function WhyUs() {
  return (
    <Section id="why-4eos" tone="ink" labelledBy="why-title">
      <SplitSection
        sticky
        aside={
          <div className="section-head">
            <h2 id="why-title" className="display t-section">
              Why 4EOS
            </h2>
            <p className="lede">
              Big enough to cover the whole environment. Local enough that the people responsible for it know your
              name.
            </p>
            <ProofSlot kind="photo" note="Real photo of the 4EOS team or an Eyes On Site visit. No stock photography." />
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
  );
}

function Engagement() {
  return (
    <Section id="how-it-works" labelledBy="process-title">
      <SectionHead
        id="process-title"
        title="How an engagement works"
        lede="Four steps, from the first conversation to day-to-day support. You know what happens at each one before it starts."
      />
      <ProcessSteps />
      <div className="actions mt-12">
        <ButtonLink href="/contact?topic=assessment" size="lg">
          Get an IT Assessment
        </ButtonLink>
        <ButtonLink href="/faq" variant="quiet" arrow>
          Read the FAQ
        </ButtonLink>
      </div>
    </Section>
  );
}

function Credibility() {
  const [lead, ...rest] = reviews;
  return (
    <Section id="credibility" tone="bone" labelledBy="credibility-title">
      <SplitSection
        aside={
          <div className="section-head">
            <h2 id="credibility-title" className="display t-section">
              Rooted in Northeast Indiana
            </h2>
            <p className="lede">
              4EOS has worked from Fort Wayne since {site.founded}. These are the facts we publish, and what clients
              have written about us.
            </p>
            <div className="rating pt-2">
              <span className="rating-score">{site.rating.value}</span>
              <span className="body-sm">
                out of 5 on Google
                <br />
                from {site.rating.count} reviews
              </span>
            </div>
            <dl className="fact-list mt-8">
              <div>
                <dt>Founded</dt>
                <dd>{site.founded}, in Fort Wayne, Indiana</dd>
              </div>
              <div>
                <dt>Service area</dt>
                <dd>{site.serviceArea}, with remote support wherever your team works</dd>
              </div>
              <div>
                <dt>Partners</dt>
                <dd>Dell, Microsoft, and Cisco. Largest Dell reseller in Northeast Indiana</dd>
              </div>
              <div>
                <dt>Security framework</dt>
                <dd>NIST Cybersecurity Framework</dd>
              </div>
              <div>
                <dt>Compliance support</dt>
                <dd>HIPAA, PCI, and SEC</dd>
              </div>
              <div>
                <dt>Office</dt>
                <dd>
                  {site.address.street}, {site.address.city}, {site.address.region} {site.address.postal}
                </dd>
              </div>
            </dl>
          </div>
        }
      >
        <div className="quotes">
          <figure className="quote quote-lead">
            <blockquote>
              <p>“{lead.body}”</p>
            </blockquote>
            <figcaption>{lead.author}, Google review</figcaption>
          </figure>
          {rest.map((r) => (
            <figure key={r.author} className="quote">
              <blockquote>
                <p>“{r.body}”</p>
              </blockquote>
              <figcaption>{r.author}, Google review</figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-6 grid gap-4">
          <ProofSlot kind="case-study" note="Published, client-approved case study with real outcomes." />
          <ProofSlot kind="partner-badges" note="Official Dell, Microsoft, and Cisco partner marks, once approved for use." />
        </div>
      </SplitSection>
    </Section>
  );
}
