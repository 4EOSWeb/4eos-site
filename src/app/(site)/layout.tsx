import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { SignalClient } from "@/components/signal/SignalClient";
import { SiteShell } from "@/components/site/SiteShell";
import { graphSchema, organizationSchema, websiteSchema } from "@/lib/schema";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={graphSchema([organizationSchema(), websiteSchema()])} />
      <SignalClient />
      <div className="site-frame">
        <SiteShell>{children}</SiteShell>
      </div>
    </>
  );
}
