import { HomeView } from "@/components/home/HomeView";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Managed IT, Cybersecurity and IT Strategy in Fort Wayne | 4EOS",
  absoluteTitle: true,
  description:
    "4EOS gives growing businesses in Fort Wayne and Northeast Indiana proactive managed IT, cybersecurity, cloud and Microsoft 365, backup and disaster recovery, and vCIO strategy. Since 2002.",
  path: "/",
});

export default function HomePage() {
  return <HomeView />;
}
