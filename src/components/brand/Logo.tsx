import type { CSSProperties } from "react";

/**
 * Wordmarks are the supplied drawings, used as masks so they take the
 * text color. The solid mark is the bar. The line mark is the footer.
 */

const RATIO = {
  solid: 1476 / 553,
  line: 1478 / 548,
  lockup: 464.17 / 230.67,
} as const;

const WORDMARK = {
  solid: "/brand/4eos-wordmark.png",
  line: "/brand/4eos-wordmark-line.png",
} as const;

const MASK = {
  mark: "/brand/4eos-mark-mono.svg",
  lockup: "/brand/4eos-lockup-dark.svg",
} as const;

const BRAND_SRC = {
  mark: "/brand/4eos-mark.svg",
  lockup: "/brand/4eos-lockup.svg",
} as const;

type LogoProps = {
  /** Solid wordmark, or the double-line wordmark. */
  mark?: keyof typeof WORDMARK;
  variant?: "mark" | "lockup";
  /** "brand" keeps the navy and gold lockup. */
  tone?: "mono" | "brand";
  /** Rendered height in pixels. Omit it to use the fluid --logo-h token. */
  height?: number;
  className?: string;
  title?: string;
};

export function Logo({
  mark = "solid",
  variant = "mark",
  tone = "mono",
  height,
  className = "",
  title = "4EOS",
}: LogoProps) {
  const ratio = variant === "lockup" ? RATIO.lockup : RATIO[mark];
  const width = height != null ? Math.round(height * ratio * 100) / 100 : undefined;
  const box: CSSProperties =
    height != null
      ? { height, width }
      : { height: "var(--logo-h)", width: "auto", aspectRatio: `${ratio}` };

  if (tone === "brand") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={BRAND_SRC[variant]}
        alt={title}
        width={width}
        height={height}
        className={className}
        style={box}
      />
    );
  }

  const src = variant === "mark" ? WORDMARK[mark] : MASK[variant];
  const style: CSSProperties = {
    display: "inline-block",
    backgroundColor: "currentColor",
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    ...box,
  };

  return <span role="img" aria-label={title} className={className} style={style} />;
}
