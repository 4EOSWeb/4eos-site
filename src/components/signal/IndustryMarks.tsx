"use client";

import type { ReactNode } from "react";

/**
 * The six industry marks, drawn as SVG and pinned to the die faces.
 * Legal, insurance, healthcare, construction, manufacturing, private equity.
 */

export const markEls: (HTMLDivElement | null)[] = [null, null, null, null, null, null];

const FILL = "#d7f0ff";

function MarkSvg({ children, label }: { children: ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 100 100" width="200" height="200" role="img" aria-label={label}>
      <g fill={FILL} stroke={FILL} strokeLinejoin="round" strokeLinecap="round" filter="url(#industry-mark-glow)">
        {children}
      </g>
    </svg>
  );
}

function Scales() {
  return (
    <MarkSvg label="Legal">
      <ellipse cx="50" cy="88" rx="28" ry="6" />
      <path d="M40 84c1-6 4-8 10-8s9 2 10 8c-2 2-6 3-10 3s-8-1-10-3z" />
      <path d="M46.5 76c-1.2-16-1-34 2-50h3c3 16 3.2 34 2 50z" />
      <circle cx="50" cy="24" r="3.2" />
      <path d="M50 11l-3.4 8h6.8z" />
      <path d="M12 34c10-12 28-16 38-16 10 0 28 4 38 16-12-6-26-8-38-8S24 28 12 34z" />
      <path d="M12 30c2 1 5 4 4 7-2-1-4-4-4-7zm76 0c-2 1-5 4-4 7 2-1 4-4 4-7z" />
      <path d="M20 33l-6 22M32 29l6 26M68 29l-6 26M80 33l6 22" fill="none" strokeWidth="1.7" />
      <path d="M8 56c6-2 12-2 18 0 2 6-2 12-9 12S6 62 8 56z" />
      <path d="M74 56c6-2 12-2 18 0 2 6-2 12-9 12s-11-6-9-12z" />
    </MarkSvg>
  );
}

function Umbrella() {
  return (
    <MarkSvg label="Insurance">
      <path d="M48 12h4v8h-4z" />
      <path d="M14 50C14 26 30 14 50 14s36 12 36 36c-6-8-12 0-18 0s-12-8-18 0-12-8-18 0-12-8-18 0z" />
      <path d="M47 50h6v28c0 2-1 4-1 6 0 6-8 8-10 2-1-3 1-6 3-8V50z" />
    </MarkSvg>
  );
}

function Cross() {
  return (
    <MarkSvg label="Healthcare">
      <path d="M36 8h28a8 8 0 0 1 8 8v12h12a8 8 0 0 1 8 8v28a8 8 0 0 1-8 8H72v12a8 8 0 0 1-8 8H36a8 8 0 0 1-8-8V72H16a8 8 0 0 1-8-8V36a8 8 0 0 1 8-8h12V16a8 8 0 0 1 8-8z" />
    </MarkSvg>
  );
}

function Hammer() {
  return (
    <MarkSvg label="Construction">
      <g transform="translate(50 54) rotate(48)">
        <path d="M-7.5-16c-1 16-1 34 1 46 1 8 12 9 14 1 1-12 1-30-1-46z" />
        <path d="M-32-30l40-6 5 16-40 6z" />
        <path d="M4-28c10-2 20-12 28-10 2 6-6 12-14 14-6 2-12-1-14-4z" />
      </g>
    </MarkSvg>
  );
}

function gearPath() {
  const cx = 50;
  const cy = 50;
  const teeth = 8;
  const inner = 30;
  const outer = 43;
  const hole = 12;
  const p = (ang: number, r: number) =>
    `${(cx + Math.cos(ang) * r).toFixed(2)} ${(cy + Math.sin(ang) * r).toFixed(2)}`;
  let d = "";
  const pitch = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * pitch - Math.PI / 2;
    const a0 = a + pitch * 0.12;
    const a1 = a + pitch * 0.38;
    const a2 = a + pitch * 0.62;
    const a3 = a + pitch * 0.88;
    d += i === 0 ? `M ${p(a0, inner)}` : `L ${p(a0, inner)}`;
    d += ` L ${p(a1, inner)} L ${p(a1, outer)} L ${p(a2, outer)} L ${p(a2, inner)} L ${p(a3, inner)}`;
  }
  d += " Z";
  d += ` M ${cx + hole} ${cy}`;
  d += ` A ${hole} ${hole} 0 1 0 ${cx - hole} ${cy}`;
  d += ` A ${hole} ${hole} 0 1 0 ${cx + hole} ${cy} Z`;
  return d;
}

const GEAR = gearPath();

function Gear() {
  return (
    <MarkSvg label="Manufacturing">
      <path d={GEAR} fillRule="evenodd" />
    </MarkSvg>
  );
}

function Houses() {
  return (
    <MarkSvg label="Private equity">
      <path d="M8 72V46L30 28l22 18v26z" />
      <path d="M48 72V46l22-18 22 18v26z" />
      <path
        fillRule="evenodd"
        d="M20 82V50L50 24l30 26v32z M43 82V62a7 7 0 0 1 14 0v20z"
      />
    </MarkSvg>
  );
}

const MARKS = [Scales, Umbrella, Cross, Hammer, Gear, Houses];

export function IndustryMarks() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <filter id="industry-mark-glow" x="-70%" y="-70%" width="240%" height="240%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="wide" />
            <feFlood floodColor="#4f86b4" floodOpacity="0.95" result="wideColor" />
            <feComposite in="wideColor" in2="wide" operator="in" result="wideGlow" />
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="tight" />
            <feFlood floodColor="#9fd4f5" floodOpacity="0.9" result="tightColor" />
            <feComposite in="tightColor" in2="tight" operator="in" result="tightGlow" />
            <feMerge>
              <feMergeNode in="wideGlow" />
              <feMergeNode in="wideGlow" />
              <feMergeNode in="tightGlow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
      {MARKS.map((Mark, i) => (
        <div
          key={i}
          ref={(el) => {
            markEls[i] = el;
          }}
          className="absolute top-0 left-0 h-[200px] w-[200px] origin-top-left opacity-0"
        >
          <Mark />
        </div>
      ))}
    </div>
  );
}
