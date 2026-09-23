import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";

const markSvg = readFileSync("public/brand/4eos-mark.svg", "utf8");
const inner = markSvg.replace(/^[\s\S]*?>/, "").replace(/<\/svg>\s*$/, "");
const solid = inner
  .replace(/fill="#093F5D"/g, 'fill="#F5B700"')
  .replace(/<path fill="#DAAA00"[^>]*\/>/g, "");

const MARK = { x: 8, y: 7.17, w: 464.17, h: 169.5 };

function square(vx, vy, side, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${side} ${side}"><rect x="${vx}" y="${vy}" width="${side}" height="${side}" fill="#05070A"/>${body}</svg>`;
}

// A: the 4 alone, cropped at the cleanest seam.
const pad = 16;
const aw = 96 - MARK.x + pad * 2;
const ah = MARK.h + pad * 2;
const aSide = Math.max(aw, ah);
const aSvg = square(
  MARK.x - pad - (aSide - aw) / 2,
  MARK.y - pad - (aSide - ah) / 2,
  aSide,
  solid,
);

// B: the whole mark, fitted to the square with breathing room.
const bPad = 40;
const bSide = MARK.w + bPad * 2;
const bSvg = square(
  MARK.x - bPad,
  MARK.y + MARK.h / 2 - bSide / 2,
  bSide,
  solid,
);

writeFileSync("scripts/out/opt-a.svg", aSvg);
writeFileSync("scripts/out/opt-b.svg", bSvg);

const tiles = [];
for (const [name, svg] of [
  ["a", aSvg],
  ["b", bSvg],
]) {
  for (const size of [32, 64, 128]) {
    const buf = await sharp(Buffer.from(svg), { density: 900 })
      .resize(size, size)
      .png()
      .toBuffer();
    // Upscale nearest-neighbour so small sizes are inspectable.
    const shown = await sharp(buf).resize(128, 128, { kernel: "nearest" }).toBuffer();
    tiles.push({ name: `${name}-${size}`, buf: shown });
  }
}

await sharp({
  create: { width: 140 * tiles.length + 8, height: 144, channels: 3, background: "#444" },
})
  .composite(tiles.map((t, i) => ({ input: t.buf, left: i * 140 + 8, top: 8 })))
  .png()
  .toFile("scripts/out/opt-sheet.png");

console.log("order:", tiles.map((t) => t.name).join("  "));
