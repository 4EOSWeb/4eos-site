import type { CSSProperties } from "react";

/**
 * The wordmark was redrawn as vector from the only asset that existed — a
 * 480x246 raster. The single-colour variant is applied as a CSS mask so it
 * inherits currentColor instead of needing a separate file per tone.
 */

const RATIO = {
  mark: 464.17 / 169.5,
  lockup: 464.17 / 230.67,
} as const;

const MASK = {
  mark: "/brand/4eos-mark-mono.svg",
  lockup: "/brand/4eos-lockup-dark.svg",
} as const;

const BRAND_SRC = {
  mark: "/brand/4eos-mark.svg",
  lockup: "/brand/4eos-lockup.svg",
} as const;

type Variant = keyof typeof RATIO;

type LogoProps = {
  variant?: Variant;
  /** "mono" inherits currentColor; "brand" keeps navy and gold. */
  tone?: "mono" | "brand";
  /** Rendered height in pixels; width follows the aspect ratio. */
  height?: number;
  className?: string;
  title?: string;
};

export function Logo({
  variant = "mark",
  tone = "mono",
  height = 28,
  className = "",
  title = "4EOS",
}: LogoProps) {
  const width = Math.round(height * RATIO[variant] * 100) / 100;

  if (tone === "brand") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={BRAND_SRC[variant]}
        alt={title}
        width={width}
        height={height}
        className={className}
        style={{ height, width }}
      />
    );
  }

  const style: CSSProperties = {
    display: "inline-block",
    height,
    width,
    backgroundColor: "currentColor",
    WebkitMaskImage: `url(${MASK[variant]})`,
    maskImage: `url(${MASK[variant]})`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  };

  return <span role="img" aria-label={title} className={className} style={style} />;
}
