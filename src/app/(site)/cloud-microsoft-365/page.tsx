import { ServiceTemplate, serviceMetadata } from "@/components/site/ServiceTemplate";

export const metadata = serviceMetadata("cloud-microsoft-365");

export default function CloudMicrosoft365Page() {
  return <ServiceTemplate slug="cloud-microsoft-365" />;
}
