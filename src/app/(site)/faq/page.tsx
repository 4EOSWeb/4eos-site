import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { CtaBand } from "@/components/site/CtaBand";
import { FaqList } from "@/components/site/FaqList";
import { PageHero } from "@/components/site/PageHero";
import { Section, SplitSection } from "@/components/site/Section";
import { generalFaqs, services } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { faqSchema } from "@/lib/schema";

export const metadata = pageMetadata({
  title: "Managed IT and Cybersecurity FAQ",
  description:
    "Answers to common questions about 4EOS managed IT, pricing, assessments, cybersecurity, backup, cloud, VoIP, and switching providers in Fort Wayne.",
  path: "/faq",
});

export default function FAQPage() {
  const groups = [
    { id: "general", title: "Working with 4EOS", href: null, items: generalFaqs },
    ...services.map((s) => ({ id: s.slug, title: s.short, href: s.href, items: s.faqs })),
  ];
  const all = groups.flatMap((g) => g.items);

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", ...faqSchema(all) }} />
      <PageHero
        crumbs={[
          { name: "Resources", path: "/resources" },
          { name: "FAQ", path: "/faq" },
        ]}
        title="Frequently asked questions"
        lede="Straight answers about how 4EOS works, what it costs, and what each service includes. If yours is not here, call or send a note."
      />
      {groups.map((g, i) => (
        <Section key={g.id} tone={i % 2 ? "bone" : "paper"} labelledBy={`faq-${g.id}`}>
          <SplitSection
            aside={
              <div className="section-head">
                <h2 id={`faq-${g.id}`} className="display t-section">
                  {g.title}
                </h2>
                {g.href ? (
                  <Link href={g.href} className="link-arrow">
                    About {g.title.replace(" / vCIO", " and vCIO")}
                    <span aria-hidden="true" className="btn-arrow">
                      →
                    </span>
                  </Link>
                ) : null}
              </div>
            }
          >
            <FaqList items={g.items} schema={false} />
          </SplitSection>
        </Section>
      ))}
      <CtaBand title="Still have a question? Ask a person." topic="other" />
    </>
  );
}
