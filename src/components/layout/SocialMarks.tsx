import { site } from "@/lib/site";

/** Glyphs traced from the current Facebook, LinkedIn, and X marks. */
const GLYPH = {
  facebook:
    "M16.8 13.21L17.38 9.48L13.79 9.48L13.79 7.05C13.79 6.03 14.29 5.03 15.9 5.03L17.53 5.03L17.53 1.85C17.53 1.85 16.05 1.6 14.64 1.6C11.68 1.6 9.75 3.39 9.75 6.63L9.75 9.48L6.47 9.48L6.47 13.21L9.75 13.21L9.75 22.24C10.41 22.35 11.09 22.4 11.77 22.4C12.46 22.4 13.13 22.35 13.79 22.24L13.79 13.21L16.8 13.21Z",
  linkedin:
    "M3.05 2.15h3.35c.72 0 1.15.48 1.15 1.15v2.05c0 .67-.43 1.15-1.15 1.15H3.05c-.72 0-1.15-.48-1.15-1.15V3.3c0-.67.43-1.15 1.15-1.15zM1.9 8.35h4.5V21.8H1.9V8.35zM8.85 21.8V8.35h4.35v2.15c.85-1.35 2.15-2.15 3.85-2.15 3.15 0 4.85 2.05 4.85 5.55v8.1h-4.5v-7.15c0-1.85-.7-2.85-2.15-2.85-1.5 0-2.35 1.05-2.35 2.95V21.8H8.85z",
  x: "M18.03 2.61L21.22 2.61L14.22 10.58L22.4 21.39L15.98 21.39L10.96 14.82L5.2 21.39L2.02 21.39L9.43 12.87L1.6 2.61L8.18 2.61L12.72 8.61ZM16.92 19.52L18.68 19.52L7.25 4.41L5.35 4.41Z",
} as const;

const LINKS = [
  { name: "facebook", label: "Facebook", href: site.social.facebook },
  { name: "linkedin", label: "LinkedIn", href: site.social.linkedin },
  { name: "x", label: "X", href: site.social.x },
] as const;

export function SocialMarks({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex items-center gap-1.5 ${className}`}>
      {LINKS.map((item) => (
        <li key={item.name}>
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.label}
            className="social-mark inline-flex h-8 w-8 items-center justify-center rounded-full border text-inherit transition-colors hover:border-[rgba(245,183,0,0.7)] hover:text-gold"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-current">
              <path d={GLYPH[item.name]} />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
