/* eslint-disable */
import { chromium } from "playwright";
import fs from "node:fs";

const VIEWPORTS = [
  { name: "mobile-320", width: 320, height: 568 },
  { name: "mobile-375", width: 375, height: 667 },
  { name: "mobile-390", width: 390, height: 844 },
  { name: "mobile-430", width: 430, height: 932 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "tablet-1024", width: 1024, height: 768 },
  { name: "desktop-1280", width: 1280, height: 720 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "desktop-1920", width: 1920, height: 1080 },
];

const URL = "http://localhost:4000/";
const OUT_DIR = "./screenshots";
fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({
  executablePath:
    process.env.HOME + "/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome",
});

const summary = [];

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    locale: "tr-TR",
  });
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  const file = `${OUT_DIR}/${vp.name}.png`;
  await page.screenshot({ path: file, fullPage: true });

  // Audit horizontal overflow
  const overflow = await page.evaluate(() => {
    const body = document.body;
    return {
      scrollWidth: body.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      innerWidth: window.innerWidth,
    };
  });

  summary.push({
    name: vp.name,
    width: vp.width,
    overflowScrollWidth: overflow.scrollWidth,
    overflowDelta: overflow.scrollWidth - overflow.clientWidth,
  });

  await context.close();
  console.log(`✓ ${vp.name}: ${vp.width}px (overflow: ${overflow.scrollWidth - overflow.clientWidth}px)`);
}

await browser.close();

// Print summary
console.log("\n=== Overflow audit ===");
for (const s of summary) {
  const status = s.overflowDelta > 1 ? "❌ OVERFLOW" : "✓ OK";
  console.log(`${status} ${s.name} (${s.width}px) — scrollWidth: ${s.overflowScrollWidth}px, delta: ${s.overflowDelta}px`);
}

const overflows = summary.filter((s) => s.overflowDelta > 1);
if (overflows.length) {
  console.log(`\n${overflows.length} viewports have horizontal overflow!`);
  process.exit(1);
} else {
  console.log("\n✓ No horizontal overflow at any viewport.");
}