import type { Metadata } from "next";
import { Page } from "@/components/layout/Page";
import { Sheet } from "@/components/layout/Sheet";
import { NinjaConnect } from "@/components/support/NinjaConnect";
import { BackLink } from "@/components/ui/BackLink";
import { withCanonical } from "@/lib/metadata";

export const metadata: Metadata = withCanonical("/support/remote/ninja", {
  title: "NinjaOne remote support",
  description: "Enter the support code from your 4EOS technician to start a NinjaOne session.",
});

export default function NinjaSupportPage() {
  return (
    <Page phase="unmanaged">
      <Sheet tone="ink">
        <div className="sheet-pad sheet-y">
          <BackLink href="/support/remote" label="Remote support" />
          <p className="micro mt-6 text-fg-faint">NinjaOne</p>
          <h1 className="display page-display mt-5 max-w-[16ch]">
            Start a Remote Support Session
          </h1>
          <p className="lede mt-6 max-w-[40ch]">
            Enter the support code your 4EOS technician gave you, then press Connect.
          </p>
          <NinjaConnect />
        </div>
      </Sheet>
    </Page>
  );
}
