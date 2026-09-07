/* eslint-disable */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const PDF = "./exports-test/kredi-odeme-plani-2026-09-07.pdf";
const OUT_DIR = "./exports-test";

const browser = await chromium.launch({
  executablePath:
    process.env.HOME + "/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome",
});

// Render both pages with proper A4 sizing and zoomed-out viewport to see
// the full page including margins.
for (let p = 1; p <= 2; p++) {
  const context = await browser.newContext({
    viewport: { width: 900, height: 1300 }, // A4 at ~110 DPI
  });
  const page = await context.newPage();
  const pdfUrl = "file://" + path.resolve(PDF) + "#page=" + p;
  await page.goto(pdfUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: path.join(OUT_DIR, `pdf-p${p}.png`),
    fullPage: false,
  });
  await context.close();
  console.log(`Saved page ${p}.`);
}

await browser.close();