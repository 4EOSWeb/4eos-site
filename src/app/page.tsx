import { HomeView } from "@/components/home/HomeView";
import { JsonLd } from "@/components/seo/JsonLd";
import { websiteSchema } from "@/lib/schema";

export default function Home() {
  return (
    <>
      <JsonLd data={websiteSchema()} />
      <HomeView />
    </>
  );
}
