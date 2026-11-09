import type { Metadata } from "next";
import { FormSection, PageIntro, SubpageShell } from "@/components/layout/Subpage";
import { NinjaConnect } from "@/components/support/NinjaConnect";
import { withCanonical } from "@/lib/metadata";

export const metadata: Metadata = withCanonical("/support/remote/ninja", {
  title: "NinjaOne remote support",
  description: "Enter the support code from your 4EOS technician to start a NinjaOne session.",
});

export default function NinjaSupportPage() {
  return (
    <SubpageShell phase="unmanaged" width="form" compose>
      <PageIntro
        backHref="/support/remote"
        backLabel="Remote support"
        eyebrow="NinjaOne"
        title="Start a Remote Support Session"
        titleClassName="max-w-[16ch]"
        description="Enter the support code your 4EOS technician gave you, then press Connect."
      />
      <FormSection>
        <NinjaConnect />
      </FormSection>
    </SubpageShell>
  );
}
