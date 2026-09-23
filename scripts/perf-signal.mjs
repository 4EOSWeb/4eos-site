import { chromium } from "playwright";

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=default", "--enable-gpu"],
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(process.env.LAB_URL ?? "http://localhost:3210/signal-lab", {
  waitUntil: "networkidle",
});
await page.waitForTimeout(3000);

for (const phase of [0, 1, 3, 5]) {
  await page.evaluate((v) => window.__setSignalPhase(v), phase);
  await page.waitForTimeout(800);

  const fps = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const times = [];
        let last = performance.now();
        function frame(now) {
          times.push(now - last);
          last = now;
          if (times.length < 120) requestAnimationFrame(frame);
          else {
            times.sort((a, b) => a - b);
            resolve({
              median: +times[60].toFixed(2),
              p95: +times[113].toFixed(2),
              worst: +times[119].toFixed(2),
            });
          }
        }
        requestAnimationFrame(frame);
      }),
  );
  console.log(
    `phase ${phase}: median ${fps.median}ms (${(1000 / fps.median).toFixed(0)} fps)  p95 ${fps.p95}ms  worst ${fps.worst}ms`,
  );
}

await browser.close();
