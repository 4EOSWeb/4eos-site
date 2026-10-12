import type { Metadata } from "next";
import { InnerPage } from "@/components/layout/InnerPage";
import { faqs } from "@/lib/content";
import { faqPageSchema } from "@/lib/discovery";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Straight answers on choosing a provider, VoIP, outsourcing, and cybersecurity.",
};

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema()) }}
      />
      <InnerPage
        phase="discovery"
        kicker="Questions"
        title="Straight answers."
        lede="From choosing a provider to what VoIP should include."
      >
      <dl>
        {faqs.map((f, i) => (
          <div key={f.q} className="border-t border-hairline py-8 last:border-b">
            <dt className="flex gap-[3vw]">
              <span className="micro text-fg-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="display text-[clamp(1.4rem,2.6vw,2.2rem)]">
                {f.q}
              </span>
            </dt>
            <dd className="lede mt-4 pl-[calc(2rem+3vw)]">{f.a}</dd>
          </div>
        ))}
      </dl>
      </InnerPage>
    </>
  );
}
