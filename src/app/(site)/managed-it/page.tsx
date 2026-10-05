import { ServiceTemplate, serviceMetadata } from "@/components/site/ServiceTemplate";

export const metadata = serviceMetadata("managed-it");

export default function ManagedItPage() {
  return <ServiceTemplate slug="managed-it" />;
}
