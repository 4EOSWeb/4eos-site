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
  visual,
  note,
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
  /** A centerpiece beside the hero copy. Stacks under it on a phone. */
  visual?: ReactNode;
  /** A short line under the lede, kept with the copy rather than the visual. */
  note?: string;
}) {
  const copy = (
    <>
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
      {note ? <p className="micro mt-6 text-fg-muted">{note}</p> : null}
    </>
  );
  return (
    <Page
      phase={phase}
      tone={tone}
      focus={focus}
      zoom={zoom}
      scene={scene}
      settleFromCube={settleFromCube}
    >
      <section className={`px-[var(--sheet-inset)] pt-[6vh] ${visual ? "relative pb-8" : "pb-10"}`}>
        <BackLink href={backHref ?? "/"} label={backLabel ?? "Home"} />
        {visual ? (
          <>
            <div className="max-w-[40rem]">{copy}</div>
            {/* Sits in the open field to the right. Out of flow, so the sheet stays up. */}
            <div className="mt-8 w-full max-w-[16rem] lg:absolute lg:inset-y-8 lg:right-[var(--sheet-inset)] lg:mt-0 lg:flex lg:w-auto lg:max-w-none lg:items-center">
              <div className="aspect-square w-full lg:h-[min(100%,24rem)] lg:w-auto">{visual}</div>
            </div>
          </>
        ) : (
          copy
        )}
      </section>
      {children ? (
        <>
          {visual ? null : <Breath size="md" />}
          <Sheet tone="ink">
            <div className="sheet-pad sheet-y">{children}</div>
          </Sheet>
        </>
      ) : null}
    </Page>
  );
}
