import { chromium } from "playwright";

const BASE = process.env.QA_URL ?? "http://localhost:3210";

const browser = await chromium.launch();

async function vitals(url) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const paints = Object.fromEntries(
      performance.getEntriesByType("paint").map((p) => [p.name, +p.startTime.toFixed(0)]),
    );
    const lcp = performance
      .getEntriesByType("largest-contentful-paint")
      .at(-1);
    return {
      ttfb: nav ? +nav.responseStart.toFixed(0) : null,
      fcp: paints["first-contentful-paint"] ?? null,
      lcp: lcp ? +lcp.startTime.toFixed(0) : null,
      cls: performance
        .getEntriesByType("layout-shift")
        .filter((e) => !e.hadRecentInput)
        .reduce((s, e) => s + e.value, 0)
        .toFixed(3),
    };
  });
  await page.close();
  return metrics;
}

async function reducedMotion() {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const live = await page.evaluate(() =>
    document.documentElement.classList.contains("signal-live"),
  );
  const canvas = await page.locator("canvas").count();
  await page.close();
  return { live, canvas };
}

async function mobileFallback() {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const live = await page.evaluate(() =>
    document.documentElement.classList.contains("signal-live"),
  );
  const poster = await page.locator(".signal-poster svg").count();
  const canvas = await page.locator("canvas").count();
  await page.close();
  return { live, poster, canvas };
}

async function keyboard() {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  const skip = await page.evaluate(() => document.activeElement?.textContent);
  await page.keyboard.press("Enter");
  const after = await page.evaluate(() => document.activeElement?.id || document.activeElement?.tagName);
  await page.close();
  return { skip, after };
}

console.log("home   ", await vitals(BASE));
console.log("contact", await vitals(`${BASE}/contact`));
console.log("motion ", await reducedMotion());
console.log("mobile ", await mobileFallback());
console.log("keys   ", await keyboard());

await browser.close();
