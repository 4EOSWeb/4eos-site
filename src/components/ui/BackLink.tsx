import Link from "next/link";

/** Same back control on every inner page: large, labeled, top of the column. */
export function BackLink({
  href,
  label,
  tone = "dark",
}: {
  href: string;
  label: string;
  /** Bone pages use dark type on a light glass. */
  tone?: "dark" | "bone";
}) {
  return (
    <Link href={href} className={`back-link${tone === "bone" ? " back-link-bone" : ""}`}>
      <span aria-hidden>←</span>
      <span>Back to {label}</span>
    </Link>
  );
}
