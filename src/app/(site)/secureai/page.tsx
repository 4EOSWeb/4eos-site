import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/site/Button";
import { CtaBand } from "@/components/site/CtaBand";
import { PageHero } from "@/components/site/PageHero";
import { Section, SectionHead } from "@/components/site/Section";
import { pageMetadata } from "@/lib/metadata";
import { webPageSchema } from "@/lib/schema";
import { site } from "@/lib/site";

const description =
  "SecureAI from 4EOS gives your whole team access to more than sixty AI models on one managed platform, with company-wide credits instead of per-user subscriptions.";

export const metadata = pageMetadata({
  title: "SecureAI: Managed AI Access for Business Teams",
  description,
  path: "/secureai",
});

const plans = [
  { name: "Starter", price: "$500", credits: "100,000 credits each month" },
  { name: "Small Business", price: "$1,000", credits: "250,000 credits each month" },
  { name: "Business", price: "$2,250", credits: "750,000 credits each month" },
];

const points = [
  {
    title: "Many models, one place",
    body: "GPT-4, Claude, and dozens of other leading models behind a single sign-in, so people can pick the right tool for each task.",
  },
  {
    title: "Company data stays company data",
    body: "Business-grade access controls, no training on your data, and usage policies leadership can set and enforce.",
  },
  {
    title: "Built for everyone, not a few",
    body: "Simple onboarding and a shared pool of credits that refreshes monthly, instead of a stack of individual subscriptions.",
  },
];

export default function SecureAIPage() {
  return (
    <>
      <JsonLd data={webPageSchema({ title: "SecureAI", description, path: "/secureai" })} />
      <PageHero
        crumbs={[
          { name: "Services", path: "/services" },
          { name: "SecureAI", path: "/secureai" },
        ]}
        kicker={<p className="label">From the 4EOS cybersecurity practice</p>}
        title="SecureAI"
        lede={
          <>
            <span className="t-title block text-[var(--fg)]">AI for the whole team, without the exposure.</span>
            <span className="mt-4 block">
              More than sixty models on one managed platform, with monthly company credits instead of per-user fees
              that climb as you grow.
            </span>
          </>
        }
        actions={
          <>
            <ButtonLink href="/contact?topic=secureai" size="lg">
              Ask about SecureAI
            </ButtonLink>
            <ButtonLink href="/cybersecurity" variant="secondary" size="lg">
              Explore Cybersecurity
            </ButtonLink>
          </>
        }
      />

      <Section labelledBy="why-title">
        <SectionHead id="why-title" title="Why teams use it" />
        <ul className="capability-grid">
          {points.map((p) => (
            <li key={p.title}>
              <h3 className="t-title-sm">{p.title}</h3>
              <p className="body-sm mt-2">{p.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="bone" labelledBy="plans-title">
        <SectionHead
          id="plans-title"
          title="Plans"
          lede="Every plan is billed monthly for the whole company. Credits reset each month."
        />
        <ol className="price-rows">
          {plans.map((plan) => (
            <li key={plan.name}>
              <h3 className="t-title">{plan.name}</h3>
              <p className="t-title">
                {plan.price}
                <span className="body-sm"> per month</span>
              </p>
              <p className="body-sm">{plan.credits}</p>
            </li>
          ))}
        </ol>
        <p className="body-sm mt-6">
          Need more than 1,500,000 credits a month? Enterprise pricing is sized to the organization. Call {site.phone}{" "}
          or send a note.
        </p>
      </Section>

      <CtaBand title="Talk to 4EOS about SecureAI." topic="secureai" />
    </>
  );
}
