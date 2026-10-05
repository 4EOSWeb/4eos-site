import Link from "next/link";
import type { ReactNode } from "react";
import type { Service } from "@/lib/content";
import { Glyph } from "./Glyph";

/**
 * The whole card is the link target through the CTA's ::after overlay, so
 * there is one accessible link per card with descriptive text.
 */
export function ServiceCard({
  service,
  variant = "standard",
  points,
  figure,
  className,
  headingLevel = 3,
}: {
  service: Service;
  variant?: "feature" | "standard" | "wide";
  points?: string[];
  figure?: ReactNode;
  className?: string;
  headingLevel?: 2 | 3;
}) {
  const H = headingLevel === 2 ? "h2" : "h3";
  const span = variant === "feature" ? "svc-feature" : variant === "wide" ? "svc-wide svc-span-2" : "";
  return (
    <article className={`svc-card ${span} ${className ?? ""}`}>
      <Glyph name={service.glyph} size={28} className="accent" />
      <H className={variant === "feature" ? "t-title" : "t-title-sm"}>{service.short}</H>
      <p className="body-sm">{service.menuLine}.</p>
      {figure ? <div className="svc-card-figure">{figure}</div> : null}
      {points?.length ? (
        <ul className="svc-card-points">
          {points.map((p) => (
            <li key={p}>
              <Glyph name="check" size={14} />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <Link href={service.href} className="svc-card-cta">
        Explore<span className="svc-cta-name"> {service.short}</span>
        <span aria-hidden="true" className="btn-arrow">
          →
        </span>
      </Link>
    </article>
  );
}
