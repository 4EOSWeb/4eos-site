import { ServiceTemplate, serviceMetadata } from "@/components/site/ServiceTemplate";

export const metadata = serviceMetadata("backup-disaster-recovery");

export default function BackupDisasterRecoveryPage() {
  return <ServiceTemplate slug="backup-disaster-recovery" />;
}
