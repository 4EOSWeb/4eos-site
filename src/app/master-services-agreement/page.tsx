import type { Metadata } from "next";
import { InnerPage } from "@/components/layout/InnerPage";
import { Agreement } from "@/components/legal/Agreement";
import msa from "@/lib/msa.json";
import { withCanonical } from "@/lib/metadata";

export const metadata: Metadata = withCanonical("/master-services-agreement", {
  title: "Master Services Agreement",
  description:
    "4EOS Managed Services Agreement, version 2026.04, effective April 30, 2026.",
});

type Run = {
  t: string;
  strong?: boolean;
  em?: boolean;
  href?: string;
};

const blocks = msa as Run[][];

export default function MasterServicesAgreementPage() {
  return (
    <InnerPage
      phase="discovery"
      kicker="MSA Version 2026.04"
      title="Master Service Agreement"
      lede="Effective April 30, 2026."
    >
      <Agreement blocks={blocks.slice(3)} />
    </InnerPage>
  );
}
