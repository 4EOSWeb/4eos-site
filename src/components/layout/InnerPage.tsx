import type { ReactNode } from "react";
import { BackLink } from "@/components/ui/BackLink";
import { ServiceTitle } from "@/components/ui/ServiceTitle";
import { Page } from "./Page";
import { Sheet } from "./Sheet";
import { subpageColumn } from "./Subpage";
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
    <div className="text-left">
      {brand ? (
        <div className="text-fg">{brand}</div>
      ) : kicker ? (
        <p className="micro">
          <span className="field-copy">{kicker}</span>
        </p>
      ) : null}
      <h1 className={`display page-display max-w-[18ch] text-left ${brand || kicker ? "mt-4" : ""}`}>
        <ServiceTitle title={title} />
      </h1>
      {lede ? (
        <p className="lede mt-5 max-w-[46ch]">
          <span className="field-copy">{lede}</span>
        </p>
      ) : null}
      {note ? <p className="micro mt-5 text-fg-muted">{note}</p> : null}
    </div>
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
        <div className={subpageColumn("wide")}>
          <BackLink href={backHref ?? "/"} label={backLabel ?? "Home"} />
          <div className="mt-7">
            {visual ? (
              <div className="lg:grid lg:grid-cols-[minmax(0,max-content)_minmax(0,1fr)] lg:items-center">
                <div className="max-w-[40rem]">{copy}</div>
                {/* Centered in the open field beside the copy. */}
                <div className="mt-8 flex w-full max-w-[16rem] lg:mt-0 lg:max-w-none lg:justify-center">
                  <div className="aspect-square w-full lg:w-[min(24rem,80%)]">{visual}</div>
                </div>
              </div>
            ) : (
              copy
            )}
          </div>
        </div>
      </section>
      {children ? (
        <Sheet tone="ink">
          <div className={`${subpageColumn("wide")} py-[clamp(2rem,5vh,3.5rem)]`}>{children}</div>
        </Sheet>
      ) : null}
    </Page>
  );
}
