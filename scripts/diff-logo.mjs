import sharp from "sharp";

const W = 960;

async function gray(path) {
  return sharp(path)
    .resize({ width: W })
    .flatten({ background: "#ffffff" })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
}

const a = await gray("scripts/out/check-original.png");
const b = await gray("scripts/out/check-lockup.png");

const n = Math.min(a.data.length, b.data.length);
let diff = 0;
let sum = 0;
const heat = Buffer.alloc(n * 3, 255);

for (let i = 0; i < n; i++) {
  const d = Math.abs(a.data[i] - b.data[i]);
  sum += d;
  if (d > 60) {
    diff++;
    heat[i * 3] = 255;
    heat[i * 3 + 1] = 0;
    heat[i * 3 + 2] = 0;
  } else {
    const v = 255 - a.data[i] / 4;
    heat[i * 3] = v;
    heat[i * 3 + 1] = v;
    heat[i * 3 + 2] = v;
  }
}

console.log("compared pixels :", n);
console.log("mean abs diff   :", (sum / n).toFixed(2), "/ 255");
console.log("pixels off > 60 :", diff, `(${((diff / n) * 100).toFixed(2)}%)`);

await sharp(heat, { raw: { width: a.info.width, height: a.info.height, channels: 3 } })
  .png()
  .toFile("scripts/out/check-diff.png");
console.log("wrote scripts/out/check-diff.png (red = mismatch)");
