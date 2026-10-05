import type { GlyphName } from "@/lib/content";

type IconName = GlyphName | "check" | "arrow" | "caret" | "call" | "mail" | "pin" | "clock" | "external" | "alert";

/* One hand-drawn set: 24 px grid, 1.5 px stroke, round joins. */
const PATHS: Record<IconName, string[]> = {
  managed: ["M4 5h16v10H4z", "M9 19h6", "M12 15v4", "M7.5 10.5l2.5 2 6-5"],
  shield: ["M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z", "M9 12l2 2 4-4"],
  cloud: ["M7 18h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7 9.5 4.25 4.25 0 0 0 7 18z"],
  network: ["M12 4v5", "M5 15v-3h14v3", "M12 9v3", "M10 2.5h4v3h-4z", "M3 15h4v4H3z", "M10 15h4v4h-4z", "M17 15h4v4h-4z"],
  roadmap: ["M4 19l5-5 4 3 7-9", "M15 8h5v5", "M4 4v15h16"],
  backup: ["M4 12a8 8 0 1 0 2.4-5.7", "M4 4v4h4", "M12 8v4l3 2"],
  phone: ["M6.5 3h3l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5l1.5-2 4 1.5v3A2 2 0 0 1 19 20 16 16 0 0 1 4 5a2 2 0 0 1 2.5-2z"],
  rack: ["M5 3h14v18H5z", "M5 9h14", "M5 15h14", "M8 6h3", "M8 12h3", "M8 18h3", "M16 6h.01", "M16 12h.01", "M16 18h.01"],
  hardware: ["M3 5h18v11H3z", "M8 20h8", "M12 16v4"],
  ai: ["M12 3v3", "M12 18v3", "M3 12h3", "M18 12h3", "M7 7h10v10H7z", "M10 10h4v4h-4z"],
  check: ["M5 12.5l4.5 4.5L19 7.5"],
  arrow: ["M5 12h14", "M13 6l6 6-6 6"],
  caret: ["M6 9l6 6 6-6"],
  call: ["M6.5 3h3l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5l1.5-2 4 1.5v3A2 2 0 0 1 19 20 16 16 0 0 1 4 5a2 2 0 0 1 2.5-2z"],
  mail: ["M3 6h18v12H3z", "M3 7l9 6 9-6"],
  pin: ["M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z", "M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"],
  clock: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 7v5l3 2"],
  external: ["M14 4h6v6", "M20 4l-9 9", "M18 14v6H4V6h6"],
  alert: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 7.5v5.5", "M12 16.5h.01"],
};

export function Glyph({
  name,
  size = 20,
  className,
  title,
}: {
  name: IconName;
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
