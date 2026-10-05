import { HomeView } from "@/components/home/HomeView";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Managed IT, Cybersecurity and IT Strategy in Fort Wayne | 4EOS",
  absoluteTitle: true,
  description:
    "Proactive managed IT, cybersecurity, cloud and Microsoft 365, backup, and vCIO strategy for growing businesses in Fort Wayne and Northeast Indiana since 2002.",
  path: "/",
});

export default function HomePage() {
  return <HomeView />;
}
