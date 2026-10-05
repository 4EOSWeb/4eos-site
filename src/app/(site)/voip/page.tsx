import { ServiceTemplate, serviceMetadata } from "@/components/site/ServiceTemplate";

export const metadata = serviceMetadata("voip");

export default function VoipPage() {
  return <ServiceTemplate slug="voip" />;
}
