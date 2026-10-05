import { ServiceTemplate, serviceMetadata } from "@/components/site/ServiceTemplate";

export const metadata = serviceMetadata("cybersecurity");

export default function CybersecurityPage() {
  return <ServiceTemplate slug="cybersecurity" />;
}
