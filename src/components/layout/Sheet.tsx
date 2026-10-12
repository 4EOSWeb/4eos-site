import type { ReactNode } from "react";

/**
 * The only element on the site permitted a border radius. Sheets are inset
 * from the viewport by a constant margin so the Signal is always visible in
 * the gutters. They are a glass pane — no column rules.
 */

type SheetProps = {
  children: ReactNode;
  /** "bone" inverts the palette, used by the intake field. */
  tone?: "navy" | "bone" | "ink";
  /** Draws the vertical column rules at the content edges. */
  ruled?: boolean;
  className?: string;
  id?: string;
  as?: "section" | "div" | "article" | "footer" | "header";
};

const TONE = {
  navy: "sheet-glass text-fg",
  ink: "sheet-ink-glass text-fg",
  bone: "bg-bone text-bone-fg",
} as const;

export function Sheet({
  children,
  tone = "navy",
  ruled = false,
  className = "",
  id,
  as: Tag = "section",
}: SheetProps) {
  return (
    <Tag
      id={id}
      className={`sheet ${TONE[tone]} ${ruled ? "ruled" : ""} ${
        tone === "bone" ? "sheet-bone" : ""
      } ${className}`}
    >
      {children}
    </Tag>
  );
}

/**
 * A full-bleed gap between sheets. The field is uncovered here, which is the
 * only reason the Signal reads as continuous rather than as decoration in
 * the margins.
 */
export function Breath({
  size = "md",
  children,
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  children?: ReactNode;
  className?: string;
}) {
  const height = {
    sm: "h-[12vh] min-h-20",
    md: "h-[26vh] min-h-36",
    lg: "h-[46vh] min-h-56",
  }[size];

  return (
    <div
      className={`breath relative flex items-center justify-center ${height} ${className}`}
    >
      {children}
    </div>
  );
}

/** Horizontal hairline that runs the full content width of a sheet. */
export function Rule({ className = "" }: { className?: string }) {
  return <hr className={`border-0 h-px bg-hairline ${className}`} />;
}
