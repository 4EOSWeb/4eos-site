import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3210/", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.15));
await page.waitForTimeout(800);
await page.screenshot({ path: "scripts/out/sheet.png" });
await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2.4));
await page.waitForTimeout(800);
await page.screenshot({ path: "scripts/out/accordion.png" });
await browser.close();
console.log("wrote sheet shots");
