import sharp from "sharp";
import { readFileSync } from "node:fs";

// Render the traced vector on a light card so the navy outline is readable.
async function render(svgPath, outPath, w) {
  const svg = readFileSync(svgPath);
  const buf = await sharp(svg, { density: 600 })
    .resize({ width: w })
    .flatten({ background: "#ffffff" })
    .png()
    .toBuffer();
  await sharp(buf).toFile(outPath);
  console.log("wrote", outPath);
}

await render("scripts/out/compare.svg", "scripts/out/check-lockup.png", 960);
await render("public/brand/4eos-mark.svg", "scripts/out/check-mark.png", 960);
await render("public/brand/4eos-lockup.svg", "scripts/out/check-lockup-tight.png", 960);

// Original upscaled to the same width for a like-for-like comparison.
await sharp("scripts/out/inline-0.webp")
  .resize({ width: 960 })
  .flatten({ background: "#ffffff" })
  .png()
  .toFile("scripts/out/check-original.png");
console.log("wrote scripts/out/check-original.png");
