import type { ReactNode } from "react";

export type Tone = "ink" | "paper" | "bone";

export function Section({
  id,
  tone = "paper",
  labelledBy,
  className,
  children,
}: {
  id?: string;
  tone?: Tone;
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`section surface-${tone} ${className ?? ""}`}
    >
      <div className="wrap">{children}</div>
    </section>
  );
}

export function SectionHead({
  id,
  title,
  lede,
  as: Tag = "h2",
  size = "section",
  children,
}: {
  id?: string;
  title: ReactNode;
  lede?: ReactNode;
  as?: "h1" | "h2";
  size?: "section" | "title";
  children?: ReactNode;
}) {
  return (
    <div className="section-head">
      <Tag id={id} className={size === "section" ? "display t-section" : "t-title"}>
        {title}
      </Tag>
      {lede ? <p className="lede">{lede}</p> : null}
      {children}
    </div>
  );
}

export function SplitSection({
  aside,
  children,
  reverse = false,
  sticky = false,
}: {
  aside: ReactNode;
  children: ReactNode;
  reverse?: boolean;
  sticky?: boolean;
}) {
  return (
    <div className={`split ${reverse ? "split-reverse" : ""} ${sticky ? "split-sticky" : ""}`}>
      <div>{aside}</div>
      <div>{children}</div>
    </div>
  );
}
