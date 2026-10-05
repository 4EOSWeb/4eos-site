import { ServiceTemplate, serviceMetadata } from "@/components/site/ServiceTemplate";

export const metadata = serviceMetadata("hardware");

export default function HardwarePage() {
  return <ServiceTemplate slug="hardware" />;
}
