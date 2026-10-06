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
      <section className={`px-[var(--sheet-inset)] pt-[6vh] ${visual ? "pb-8" : "pb-10"}`}>
        <BackLink href={backHref ?? "/"} label={backLabel ?? "Home"} />
        {visual ? (
          <>
            {brand ? (
              <div className="mt-6 text-fg">{brand}</div>
            ) : kicker ? (
              <p className="micro mt-6">
                <span className="field-copy">{kicker}</span>
              </p>
            ) : null}
            <div className="mt-5 grid items-stretch gap-8 lg:grid-cols-[minmax(0,18ch)_auto] lg:justify-start lg:gap-x-16">
              <h1 className="display page-display max-w-[18ch]">{title}</h1>
              {/* The row is the title. The cube takes that height and stays square. */}
              <div className="aspect-square w-full max-w-[14rem] lg:h-full lg:w-auto lg:max-w-none">{visual}</div>
            </div>
            {lede ? (
              <p className="lede mt-6 max-w-[46ch]">
                <span className="field-copy">{lede}</span>
              </p>
            ) : null}
            {note ? <p className="micro mt-6 text-fg-muted">{note}</p> : null}
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
