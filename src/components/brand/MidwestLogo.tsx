import type { CSSProperties } from "react";

/** Midwest VoIP wordmark, traced from the supplied lockup. */
const RATIO = 1998 / 912;
const SRC = "/brand/midwest-voip.svg";

export function MidwestLogo({
  height,
  className = "",
  title = "Midwest VoIP",
}: {
  /** Rendered height in pixels. Omit it to use the fluid --logo-h token. */
  height?: number;
  className?: string;
  title?: string;
}) {
  const width = height != null ? Math.round(height * RATIO * 100) / 100 : undefined;
  const box: CSSProperties =
    height != null
      ? { height, width }
      : { height: "var(--logo-h)", width: "auto", aspectRatio: `${RATIO}` };

  const style: CSSProperties = {
    display: "inline-block",
    backgroundColor: "#fff",
    WebkitMaskImage: `url(${SRC})`,
    maskImage: `url(${SRC})`,
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
