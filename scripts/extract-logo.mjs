// One-off: pull the inlined base64 wordmark off 4eos.com so it can be traced.
import { writeFileSync, mkdirSync } from "node:fs";

const res = await fetch("https://www.4eos.com/", {
  headers: { "user-agent": "Mozilla/5.0" },
});
const html = await res.text();

const matches = [...html.matchAll(/data:image\/(webp|png|jpeg);base64,([A-Za-z0-9+/=]+)/g)];
console.log("inline images found:", matches.length);

mkdirSync("scripts/out", { recursive: true });

matches.slice(0, 4).forEach((m, i) => {
  const [, ext, b64] = m;
  const buf = Buffer.from(b64, "base64");
  const path = `scripts/out/inline-${i}.${ext}`;
  writeFileSync(path, buf);
  console.log(path, buf.length, "bytes");
});
