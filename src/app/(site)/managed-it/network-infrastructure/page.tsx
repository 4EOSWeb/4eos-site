import { ServiceTemplate, serviceMetadata } from "@/components/site/ServiceTemplate";

export const metadata = serviceMetadata("network-infrastructure");

export default function NetworkInfrastructurePage() {
  return <ServiceTemplate slug="network-infrastructure" />;
}
