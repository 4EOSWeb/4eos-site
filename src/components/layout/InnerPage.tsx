import type { ReactNode } from "react";
import { BackLink } from "@/components/ui/BackLink";
import { Page } from "./Page";
import { Breath, Sheet } from "./Sheet";
import type { Phase } from "@/components/signal/formations";

export function InnerPage({
  phase,
  kicker,
  brand,
  title,
  lede,
  children,
  tone = "light",
  focus,
  zoom = false,
  scene,
  settleFromCube = false,
  backHref,
  backLabel,
}: {
  phase: Phase;
  kicker?: string;
  /** A brand mark in place of the kicker line. */
  brand?: ReactNode;
  title: string;
  lede?: string;
  children?: ReactNode;
  tone?: "light" | "dark";
  focus?: number;
  zoom?: boolean;
  scene?: number | null;
  settleFromCube?: boolean;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <Page
      phase={phase}
      tone={tone}
      focus={focus}
      zoom={zoom}
      scene={scene}
      settleFromCube={settleFromCube}
    >
      <section className="px-[var(--sheet-inset)] pb-10 pt-[6vh]">
        <BackLink href={backHref ?? "/"} label={backLabel ?? "Home"} />
        {brand ? (
          <div className="mt-6 text-fg">{brand}</div>
        ) : kicker ? (
          <p className="micro mt-6">
            <span className="field-copy">{kicker}</span>
          </p>
        ) : null}
        <h1 className="display page-display mt-5 max-w-[18ch]">{title}</h1>
        {lede ? (
          <p className="lede mt-6 max-w-[46ch]">
            <span className="field-copy">{lede}</span>
          </p>
        ) : null}
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
