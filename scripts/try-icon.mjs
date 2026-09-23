import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";

const markSvg = readFileSync("public/brand/4eos-mark.svg", "utf8");
const inner = markSvg.replace(/^[\s\S]*?>/, "").replace(/<\/svg>\s*$/, "");

// Recolour the traced silhouette to a single gold fill.
const solid = inner.replace(/fill="#093F5D"/g, 'fill="#F5B700"').replace(
  /<path fill="#DAAA00"[^>]*\/>/g,
  "",
);

const MARK = { x: 8, y: 7.17, h: 169.5 };

for (const right of [96, 106, 112, 120, 130]) {
  const pad = 16;
  const x = MARK.x - pad;
  const y = MARK.y - pad;
  const w = right - MARK.x + pad * 2;
  const h = MARK.h + pad * 2;
  const side = Math.max(w, h);
  const vx = x - (side - w) / 2;
  const vy = y - (side - h) / 2;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${side} ${side}"><rect x="${vx}" y="${vy}" width="${side}" height="${side}" fill="#05070A"/>${solid}</svg>`;
  writeFileSync(`scripts/out/try-${right}.svg`, svg);
  await sharp(Buffer.from(svg), { density: 900 })
    .resize(128, 128)
    .png()
    .toFile(`scripts/out/try-${right}.png`);
}

// Contact sheet so all candidates can be compared at once.
const tiles = [96, 106, 112, 120, 130];
const composites = await Promise.all(
  tiles.map(async (r, i) => ({
    input: await sharp(`scripts/out/try-${r}.png`).toBuffer(),
    left: i * 140 + 8,
    top: 8,
  })),
);
await sharp({
  create: { width: 140 * tiles.length + 8, height: 144, channels: 3, background: "#444" },
})
  .composite(composites)
  .png()
  .toFile("scripts/out/try-sheet.png");

console.log("candidates:", tiles.join(", "));
