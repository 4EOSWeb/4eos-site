import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";

const icon = readFileSync("public/brand/4eos-icon.svg");

mkdirSync("src/app", { recursive: true });

// Next's app-router file conventions pick these up automatically.
await sharp(icon, { density: 900 }).resize(512, 512).png().toFile("src/app/icon.png");
await sharp(icon, { density: 900 }).resize(180, 180).png().toFile("src/app/apple-icon.png");

// Small-size legibility check.
await sharp(icon, { density: 900 }).resize(32, 32).png().toFile("scripts/out/icon-32.png");
await sharp(icon, { density: 900 }).resize(64, 64).png().toFile("scripts/out/icon-64.png");

// Open Graph card.
const og = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#05070A"/>
  <rect x="48" y="48" width="1104" height="534" rx="32" fill="#0A1F33"/>
  <g transform="translate(120 250) scale(1.6)">${readFileSync("public/brand/4eos-lockup-dark.svg", "utf8").replace(/^[\s\S]*?>/, "").replace(/<\/svg>\s*$/, "")}</g>
</svg>`;
await sharp(Buffer.from(og), { density: 200 }).png().toFile("scripts/out/og-preview.png");

console.log("wrote src/app/icon.png, src/app/apple-icon.png, scripts/out/icon-*.png");
