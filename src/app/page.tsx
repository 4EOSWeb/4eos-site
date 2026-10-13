import type { Metadata } from "next";
import { HomeView } from "@/components/home/HomeView";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqs } from "@/lib/content";
import { withCanonical } from "@/lib/metadata";
import { faqSchema, graphSchema, homePageSchema } from "@/lib/schema";

export const metadata: Metadata = withCanonical("/");

export default function Home() {
  return (
    <>
      <JsonLd data={graphSchema([homePageSchema(), faqSchema(faqs)])} />
      <HomeView />
    </>
  );
}
