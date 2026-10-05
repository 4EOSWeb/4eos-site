import type { Qa } from "@/lib/content";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSchema } from "@/lib/schema";

/**
 * Native details/summary: readable without JavaScript, crawlable, and
 * keyboard operable. FAQPage schema is emitted only where the answers
 * are on the page.
 */
export function FaqList({
  items,
  schema = true,
  headingLevel = 3,
}: {
  items: readonly Qa[];
  schema?: boolean;
  headingLevel?: 3 | 2;
}) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <>
      <div className="faq">
        {items.map((item, i) => (
          <details key={item.q} className="faq-item" open={i === 0}>
            <summary>
              <H className="faq-q">{item.q}</H>
              <span className="faq-icon" aria-hidden="true" />
            </summary>
            <p className="faq-answer">{item.a}</p>
          </details>
        ))}
      </div>
      {schema ? <JsonLd data={{ "@context": "https://schema.org", ...faqSchema(items) }} /> : null}
    </>
  );
}
