/**
 * Redraws the 4EOS wordmark as vector art.
 *
 * The source is a 480x246 raster, so it is upscaled, separated into its
 * three colour layers, and each layer is traced. The artwork is built the
 * way it was originally drawn: a navy silhouette with the gold shape sitting
 * on top of it, which keeps the outlines crisp and the paths simple.
 */
import sharp from "sharp";
import potrace from "potrace";
import { writeFileSync, mkdirSync } from "node:fs";

const SRC = "scripts/out/inline-0.webp";
const SCALE = 6;
const W = 480;
const H = 246;

// Brand values as used on the live site.
const NAVY = [9, 63, 93];
const GOLD = [218, 170, 0];
const BLACK = [10, 10, 10];
const WHITE = [248, 248, 248];
const PALETTE = [
  { name: "navy", rgb: NAVY },
  { name: "gold", rgb: GOLD },
  { name: "black", rgb: BLACK },
  { name: "white", rgb: WHITE },
];

// Bands measured from the empty-row analysis of the source.
const WORDMARK_BAND = [0, 190];
const TAGLINE_BAND = [190, 246];

const { data, info } = await sharp(SRC)
  .resize(W * SCALE, H * SCALE, { kernel: "lanczos3" })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width: uw, height: uh, channels } = info;

function classify(r, g, b) {
  let best = null;
  let bestD = Infinity;
  for (const p of PALETTE) {
    const d =
      (r - p.rgb[0]) ** 2 + (g - p.rgb[1]) ** 2 + (b - p.rgb[2]) ** 2;
    if (d < bestD) {
      bestD = d;
      best = p.name;
    }
  }
  return best;
}

/** Build an 8-bit mask: 0 where the predicate holds, 255 elsewhere. */
function mask(predicate, [y0, y1]) {
  const out = Buffer.alloc(uw * uh, 255);
  const top = y0 * SCALE;
  const bottom = y1 * SCALE;
  for (let y = top; y < Math.min(bottom, uh); y++) {
    for (let x = 0; x < uw; x++) {
      const i = (y * uw + x) * channels;
      if (data[i + 3] < 128) continue;
      const cls = classify(data[i], data[i + 1], data[i + 2]);
      if (predicate(cls)) out[y * uw + x] = 0;
    }
  }
  return out;
}

async function trace(maskBuf, { turdSize }) {
  const png = await sharp(maskBuf, {
    raw: { width: uw, height: uh, channels: 1 },
  })
    .png()
    .toBuffer();

  const svg = await new Promise((resolve, reject) => {
    potrace.trace(
      png,
      {
        threshold: 128,
        blackOnWhite: true,
        turdSize,
        alphaMax: 1,
        optCurve: true,
        optTolerance: 0.15,
      },
      (err, out) => (err ? reject(err) : resolve(out)),
    );
  });

  const d = [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]).join(" ");
  if (!d) throw new Error("trace produced no path data");
  // Integer precision at 6x is a sixth of a pixel in final units, which is
  // far finer than the source raster and roughly halves the file size.
  return d.replace(/-?\d*\.\d+/g, (n) => String(Math.round(Number(n))));
}

/** Tight ink bounds of a mask, in source (480x246) units. */
function bounds(maskBuf) {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (let y = 0; y < uh; y++) {
    for (let x = 0; x < uw; x++) {
      if (maskBuf[y * uw + x] !== 0) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  return {
    x: x0 / SCALE,
    y: y0 / SCALE,
    w: (x1 - x0 + 1) / SCALE,
    h: (y1 - y0 + 1) / SCALE,
  };
}

console.log("tracing layers...");

// The navy layer is the full silhouette (navy + gold), so the gold shape can
// sit on top of it without needing to align two separately traced outlines.
const silhouetteMask = mask(
  (c) => c === "navy" || c === "gold",
  WORDMARK_BAND,
);
const goldMask = mask((c) => c === "gold", WORDMARK_BAND);
const taglineMask = mask((c) => c === "black", TAGLINE_BAND);

// turdSize is in upscaled pixels. Antialiasing along the navy/gold boundary
// classifies a handful of interior pixels as neither, leaving pinholes in the
// fill; 300 at 6x clears them without touching real detail.
const silhouette = await trace(silhouetteMask, { turdSize: 300 });
const gold = await trace(goldMask, { turdSize: 300 });
const tagline = await trace(taglineMask, { turdSize: 60 });

const markBox = bounds(silhouetteMask);
const taglineBox = bounds(taglineMask);
console.log("  mark box   :", JSON.stringify(markBox));
console.log("  tagline box:", JSON.stringify(taglineBox));

console.log("  silhouette:", silhouette.length, "chars");
console.log("  gold      :", gold.length, "chars");
console.log("  tagline   :", tagline.length, "chars");

const inv = (1 / SCALE).toFixed(6);
const g = (body) => `<g transform="scale(${inv})">${body}</g>`;
// potrace encodes counters as reversed subpaths in the same path, which only
// read as holes under the even-odd rule.
const path = (d, fill) =>
  `<path fill="${fill}" fill-rule="evenodd" d="${d}"/>`;

mkdirSync("public/brand", { recursive: true });

function svgDoc({ viewBox, title, body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="${title}" fill="none">${body}</svg>\n`;
}

const round = (n) => Math.round(n * 100) / 100;
const markVB = `${round(markBox.x)} ${round(markBox.y)} ${round(markBox.w)} ${round(markBox.h)}`;

const lockX = Math.min(markBox.x, taglineBox.x);
const lockY = markBox.y;
const lockW = Math.max(markBox.x + markBox.w, taglineBox.x + taglineBox.w) - lockX;
const lockH = taglineBox.y + taglineBox.h - lockY;
const lockVB = `${round(lockX)} ${round(lockY)} ${round(lockW)} ${round(lockH)}`;

// Mark only, full colour.
writeFileSync(
  "public/brand/4eos-mark.svg",
  svgDoc({
    viewBox: markVB,
    title: "4EOS",
    body: g(path(silhouette, "#093F5D") + path(gold, "#DAAA00")),
  }),
);

// Mark only, single colour — takes its colour from the surrounding text.
writeFileSync(
  "public/brand/4eos-mark-mono.svg",
  svgDoc({
    viewBox: markVB,
    title: "4EOS",
    body: g(path(silhouette, "currentColor")),
  }),
);

// Full lockup with the tagline, full colour.
writeFileSync(
  "public/brand/4eos-lockup.svg",
  svgDoc({
    viewBox: lockVB,
    title: "4EOS — Computers / Networks / Security",
    body: g(
      path(silhouette, "#093F5D") +
        path(gold, "#DAAA00") +
        path(tagline, "#0A0A0A"),
    ),
  }),
);

// Full lockup for dark surfaces.
writeFileSync(
  "public/brand/4eos-lockup-dark.svg",
  svgDoc({
    viewBox: lockVB,
    title: "4EOS — Computers / Networks / Security",
    body: g(
      path(silhouette, "#E8E4D8") +
        path(gold, "#F5B700") +
        path(tagline, "#E8E4D8"),
    ),
  }),
);

// Favicon: the whole mark, square-fitted. Cropping to the 4 alone was tried
// and rejected — the 4's crossbar runs into the E so every crop keeps a stub
// of it, whereas the full mark stays readable all the way down to 32px.
const iconPad = 40;
const side = markBox.w + iconPad * 2;
const ix = markBox.x - iconPad;
const iy = markBox.y + markBox.h / 2 - side / 2;
const iconVB = `${round(ix)} ${round(iy)} ${round(side)} ${round(side)}`;

writeFileSync(
  "public/brand/4eos-icon.svg",
  svgDoc({
    viewBox: iconVB,
    title: "4EOS",
    body:
      `<rect x="${round(ix)}" y="${round(iy)}" width="${round(side)}" height="${round(side)}" fill="#05070A"/>` +
      // The solid silhouette, not the outline, so the glyph holds up small.
      g(path(silhouette, "#F5B700")),
  }),
);

// Verification render: same frame as the source raster so the two can be
// diffed pixel for pixel.
writeFileSync(
  "scripts/out/compare.svg",
  svgDoc({
    viewBox: `0 0 ${W} ${H}`,
    title: "compare",
    body: g(
      path(silhouette, "#093F5D") +
        path(gold, "#DAAA00") +
        path(tagline, "#0A0A0A"),
    ),
  }),
);

console.log("\nwrote public/brand/*.svg");
console.log("  mark viewBox  :", markVB);
console.log("  lockup viewBox:", lockVB);
console.log("  icon viewBox  :", iconVB);
