import type { ReactNode } from "react";
import { BackLink } from "@/components/ui/BackLink";
import { Page } from "./Page";
import { Breath, Sheet } from "./Sheet";
import type { Phase } from "@/components/signal/formations";

export function InnerPage({
  phase,
  kicker,
  title,
  lede,
  children,
  tone = "light",
  focus,
  zoom = false,
  scene,
  backHref,
  backLabel,
}: {
  phase: Phase;
  kicker?: string;
  title: string;
  lede?: string;
  children?: ReactNode;
  tone?: "light" | "dark";
  focus?: number;
  zoom?: boolean;
  scene?: number | null;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <Page phase={phase} tone={tone} focus={focus} zoom={zoom} scene={scene}>
      <section className="px-[var(--sheet-inset)] pb-10 pt-[6vh]">
        <BackLink href={backHref ?? "/"} label={backLabel ?? "Home"} />
        {kicker ? <p className="micro field-copy mt-6">{kicker}</p> : null}
        <h1 className="display page-display mt-5 max-w-[18ch]">{title}</h1>
        {lede ? <p className="lede field-copy mt-6 max-w-[46ch]">{lede}</p> : null}
      </section>
      {children ? (
        <>
          <Breath size="md" />
          <Sheet tone="ink">
            <div className="sheet-pad sheet-y">{children}</div>
          </Sheet>
        </>
      ) : null}
    </Page>
  );
}
