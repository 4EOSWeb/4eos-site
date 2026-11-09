import type { Metadata } from "next";
import Link from "next/link";
import { Page } from "@/components/layout/Page";
import { Sheet } from "@/components/layout/Sheet";
import { BackLink } from "@/components/ui/BackLink";
import { withCanonical } from "@/lib/metadata";

export const metadata: Metadata = withCanonical("/support/remote", {
  title: "Remote support",
  description: "Start a remote support session with ScreenConnect or NinjaOne.",
});

export default function RemoteSupportPage() {
  return (
    <Page phase="unmanaged">
      <Sheet tone="ink">
        <div className="sheet-pad sheet-y">
          <BackLink href="/support" label="Support" />
          <p className="micro mt-6 text-fg-faint">Help desk</p>
          <h1 className="display page-display mt-5 max-w-[16ch]">
            Start a Remote Support Session
          </h1>
          <p className="lede mt-6 max-w-[42ch]">
            Choose the tool your 4EOS technician asked you to use.
          </p>
          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            <li className="border border-hairline p-6">
              <h2 className="display text-[clamp(1.6rem,3vw,2.2rem)]">ScreenConnect</h2>
              <p className="lede mt-4">
                Opens the 4EOS ScreenConnect page. You do not need a code.
              </p>
              <a
                href="https://4eos.screenconnect.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bar-btn bar-btn-line bar-btn-glow mt-6 inline-flex h-auto min-h-10 px-4 py-3 text-center"
                style={{ whiteSpace: "normal" }}
              >
                Continue to ScreenConnect
              </a>
            </li>
            <li className="border border-hairline p-6">
              <h2 className="display text-[clamp(1.6rem,3vw,2.2rem)]">NinjaOne</h2>
              <p className="lede mt-4">
                Your technician will give you a code. Enter it on the next screen.
              </p>
              <Link
                href="/support/remote/ninja"
                className="bar-btn bar-btn-line mt-6 inline-flex h-auto min-h-10 px-4 py-3 text-center"
                style={{ whiteSpace: "normal" }}
              >
                Enter a support code
              </Link>
            </li>
          </ul>
        </div>
      </Sheet>
    </Page>
  );
}
