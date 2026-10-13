import type { Metadata } from "next";
import { InnerPage } from "@/components/layout/InnerPage";
import { FaqList } from "@/components/seo/FaqList";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqs } from "@/lib/content";
import { faqSchema, graphSchema } from "@/lib/schema";
import { withCanonical } from "@/lib/metadata";

export const metadata: Metadata = withCanonical("/faq", {
  title: "FAQ",
  description:
    "Answers on CompleteCare, Eyes On Site, SecureAI, cybersecurity, VoIP, and how 4EOS works with Indiana businesses.",
});

export default function FAQPage() {
  return (
    <InnerPage
      phase="discovery"
      kicker="Questions"
      title="Straight answers."
      lede="CompleteCare, Eyes On Site, SecureAI, cybersecurity, VoIP, and how the work is done."
    >
      <JsonLd data={graphSchema([faqSchema(faqs)])} />
      <FaqList items={faqs} />
    </InnerPage>
  );
}
