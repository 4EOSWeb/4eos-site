import { ServiceTemplate, serviceMetadata } from "@/components/site/ServiceTemplate";

export const metadata = serviceMetadata("data-center");

export default function DataCenterPage() {
  return <ServiceTemplate slug="data-center" />;
}
