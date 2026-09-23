import sharp from "sharp";

const img = sharp("scripts/out/inline-0.webp");
const meta = await img.metadata();
console.log("meta:", meta.width, "x", meta.height, meta.format, "alpha:", meta.hasAlpha);

const { data, info } = await img
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const counts = new Map();
for (let i = 0; i < data.length; i += info.channels) {
  const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
  // Quantize so near-identical antialiased pixels group together
  const key = a < 128 ? "transparent" : `${r >> 4},${g >> 4},${b >> 4}`;
  counts.set(key, (counts.get(key) ?? 0) + 1);
}

const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
console.log("\ntop quantized colors (r,g,b in 16-steps) : count");
for (const [k, v] of top) {
  if (k === "transparent") {
    console.log(`  transparent : ${v}`);
    continue;
  }
  const [r, g, b] = k.split(",").map((n) => (Number(n) << 4) + 8);
  const hex = `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
  console.log(`  ${hex} : ${v}`);
}

// Where does the wordmark end and the tagline begin?
const rowInk = [];
for (let y = 0; y < info.height; y++) {
  let n = 0;
  for (let x = 0; x < info.width; x++) {
    const i = (y * info.width + x) * info.channels;
    if (data[i + 3] > 128) n++;
  }
  rowInk.push(n);
}
const gaps = [];
let runStart = -1;
rowInk.forEach((n, y) => {
  if (n === 0 && runStart === -1) runStart = y;
  if (n !== 0 && runStart !== -1) {
    gaps.push([runStart, y - 1]);
    runStart = -1;
  }
});
if (runStart !== -1) gaps.push([runStart, info.height - 1]);
console.log("\nempty row bands (y0..y1):", JSON.stringify(gaps));
