/* eslint-disable */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const URL = "http://localhost:4000/";
const PDF = "./exports-test/kredi-odeme-plani-2026-09-07.pdf";
const OUT_DIR = "./exports-test";

const browser = await chromium.launch({
  executablePath:
    process.env.HOME + "/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome",
});
const context = await browser.newContext({
  viewport: { width: 1400, height: 1800 },
});
const page = await context.newPage();

// Open PDF and jump to page 2 with the hash fragment
const pdfUrl = "file://" + path.resolve(PDF) + "#page=2";
await page.goto(pdfUrl, { waitUntil: "networkidle" });
await page.waitForTimeout(2500);

await page.screenshot({
  path: path.join(OUT_DIR, "pdf-page2.png"),
  fullPage: false,
});
console.log("Saved page 2 preview.");

await browser.close();