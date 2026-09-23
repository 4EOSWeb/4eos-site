import sharp from "sharp";

const SCALE = 2;
const W = 480;
const H = 246;

const { data, info } = await sharp("scripts/out/inline-0.webp")
  .resize(W * SCALE, H * SCALE, { kernel: "lanczos3" })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width: uw, channels } = info;
const bandTop = 0;
const bandBottom = 190 * SCALE;

const profile = [];
for (let x = 0; x < uw; x++) {
  let n = 0;
  for (let y = bandTop; y < bandBottom; y++) {
    const i = (y * uw + x) * channels;
    if (data[i + 3] > 128) n++;
  }
  profile.push(n);
}

// Print a coarse histogram in source units.
console.log("ink height per column (source x : px)");
for (let x = 0; x < W; x += 4) {
  const v = profile[x * SCALE] ?? 0;
  console.log(String(x).padStart(3), "|", "#".repeat(Math.round(v / (SCALE * 4))), v);
}
