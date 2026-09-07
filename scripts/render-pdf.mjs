/* eslint-disable */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const URL = "http://localhost:4000/";
const PDF = "./exports-test/kredi-odeme-plani-2026-09-07.pdf";
const OUT_DIR = "./exports-test";
fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({
  executablePath:
    process.env.HOME + "/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome",
});
const context = await browser.newContext({
  viewport: { width: 1400, height: 900 },
});
const page = await context.newPage();

const pdfUrl = "file://" + path.resolve(PDF);
await page.goto(pdfUrl, { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

await page.screenshot({
  path: path.join(OUT_DIR, "pdf-preview.png"),
  fullPage: true,
});
console.log("Saved preview.");

await browser.close();