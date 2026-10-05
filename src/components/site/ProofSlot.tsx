import type { ReactNode } from "react";

/**
 * A reserved place for proof 4EOS has not published yet: case studies,
 * partner badges, certifications, team photography. In production it
 * renders nothing until real content is passed as children, so nothing
 * placeholder-shaped ever reaches a visitor or a crawler.
 */
export function ProofSlot({
  kind,
  note,
  children,
}: {
  kind: "case-study" | "partner-badges" | "certifications" | "photo";
  note: string;
  children?: ReactNode;
}) {
  if (children) return <>{children}</>;
  if (process.env.NODE_ENV === "production") return null;
  return (
    <div className="slot" data-proof-slot={kind}>
      <p className="label">
        Implementation placeholder · {kind}
        <br />
        {note}
      </p>
    </div>
  );
}
