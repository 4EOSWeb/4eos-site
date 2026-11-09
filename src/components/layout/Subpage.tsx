import type { ReactNode } from "react";
import type { Phase } from "@/components/signal/formations";
import { BackLink } from "@/components/ui/BackLink";
import { Page } from "./Page";
import { Sheet } from "./Sheet";

export type SubpageWidth = "form" | "read" | "wide";

const WIDTH: Record<SubpageWidth, string> = {
  // Padding sits inside the max width, so the content box stays 34rem (544px).
  form: "max-w-[calc(34rem+2*clamp(20px,4vw,40px))]",
  read: "max-w-[42rem]",
  wide: "max-w-[1200px]",
};

/** Centers one left-aligned column. Field heroes and sheet bodies share it. */
export function subpageColumn(width: SubpageWidth = "wide") {
  return `mx-auto w-full px-[clamp(20px,4vw,40px)] text-left ${WIDTH[width]}`;
}

const PAD = "py-[clamp(2rem,5vh,3.5rem)]";
const COMPOSE_PAD = "pt-[clamp(2.75rem,9vh,5.5rem)] pb-[clamp(3rem,8vh,5rem)]";

export function SubpageShell({
  phase,
  width = "wide",
  compose = false,
  children,
  tone = "light",
}: {
  phase: Phase;
  width?: SubpageWidth;
  /** Short screens: the sheet fills the first view and the column sits lower. */
  compose?: boolean;
  children: ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <Page phase={phase} tone={tone}>
      <Sheet
        tone="ink"
        className={compose ? "min-h-[calc(100svh-var(--nav-h)-var(--sheet-inset))]" : undefined}
      >
        <div className={`${subpageColumn(width)} ${compose ? COMPOSE_PAD : PAD}`}>{children}</div>
      </Sheet>
    </Page>
  );
}

export function PageEyebrow({
  children,
  field = false,
}: {
  children: ReactNode;
  /** On the signal field, the eyebrow uses the field type. */
  field?: boolean;
}) {
  return (
    <p className={`micro ${field ? "" : "text-fg-faint"}`}>
      {field ? <span className="field-copy">{children}</span> : children}
    </p>
  );
}

export function PageHeader({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <h1 className={`display page-display text-left ${className}`}>{children}</h1>;
}

export function PageDescription({
  children,
  className = "",
  field = false,
}: {
  children: ReactNode;
  className?: string;
  field?: boolean;
}) {
  return (
    <p className={`lede max-w-[42ch] text-left ${className}`}>
      {field ? <span className="field-copy">{children}</span> : children}
    </p>
  );
}

/** Back control, eyebrow, heading, and description, sharing one left edge. */
export function PageIntro({
  backHref,
  backLabel,
  eyebrow,
  title,
  description,
  field = false,
  titleClassName = "",
}: {
  backHref: string;
  backLabel: string;
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  field?: boolean;
  titleClassName?: string;
}) {
  return (
    <header className="text-left">
      <BackLink href={backHref} label={backLabel} />
      <div className="mt-7">
        {eyebrow ? <PageEyebrow field={field}>{eyebrow}</PageEyebrow> : null}
        <PageHeader className={`${eyebrow ? "mt-4" : ""} ${titleClassName}`}>{title}</PageHeader>
        {description ? (
          <PageDescription field={field} className="mt-5">
            {description}
          </PageDescription>
        ) : null}
      </div>
    </header>
  );
}

/** Space between a page intro and the controls that follow it. */
export function FormSection({ children }: { children: ReactNode }) {
  return <div className="mt-8 w-full min-w-0">{children}</div>;
}
