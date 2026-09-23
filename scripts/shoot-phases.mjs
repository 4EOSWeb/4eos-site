/**
 * Screenshots every formation from the tuning harness and tiles them into one
 * contact sheet, so the whole narrative can be judged at a glance.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const URL = process.env.LAB_URL ?? "http://localhost:3210/_signal-lab";
const W = 1280;
const H = 720;

mkdirSync("scripts/out/phases", { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);

const shots = [];
for (let i = 0; i <= 6; i++) {
  await page.evaluate((v) => window.__setSignalPhase(v), i);
  await page.waitForTimeout(1400);
  const path = `scripts/out/phases/phase-${i}.png`;
  await page.screenshot({ path, clip: { x: 0, y: 0, width: W, height: H - 120 } });
  shots.push(path);
  console.log("shot", path);
}

await browser.close();

const tileW = 440;
const tiles = await Promise.all(
  shots.map((p) => sharp(p).resize({ width: tileW }).toBuffer()),
);
const meta = await sharp(tiles[0]).metadata();
const cols = 4;
const rows = Math.ceil(tiles.length / cols);

await sharp({
  create: {
    width: cols * (tileW + 8) + 8,
    height: rows * (meta.height + 8) + 8,
    channels: 3,
    background: "#222",
  },
})
  .composite(
    tiles.map((input, i) => ({
      input,
      left: (i % cols) * (tileW + 8) + 8,
      top: Math.floor(i / cols) * (meta.height + 8) + 8,
    })),
  )
  .png()
  .toFile("scripts/out/phase-sheet.png");

console.log("wrote scripts/out/phase-sheet.png");
