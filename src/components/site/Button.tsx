import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "quiet";

function classes(variant: Variant, size: "md" | "lg", className?: string) {
  return ["btn", `btn-${variant}`, size === "lg" ? "btn-lg" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  arrow = false,
  className,
  external = false,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: "md" | "lg";
  arrow?: boolean;
  className?: string;
  external?: boolean;
}) {
  const inner = (
    <>
      {children}
      {arrow ? (
        <span aria-hidden="true" className="btn-arrow">
          →
        </span>
      ) : null}
    </>
  );
  const cls = classes(variant, size, className);
  if (external || href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("http")) {
    return (
      <a
        href={href}
        className={cls}
        {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: "md" | "lg";
  loading?: boolean;
}) {
  return (
    <button
      {...rest}
      className={classes(variant, size, className)}
      data-loading={loading ? "true" : undefined}
      aria-busy={loading || undefined}
    >
      {loading ? <span className="spinner" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
