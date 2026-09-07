/* eslint-disable */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const URL = "http://localhost:4000/";
const OUT = "./exports-test";
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath:
    process.env.HOME + "/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome",
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: "tr-TR",
  acceptDownloads: true,
});
const page = await context.newPage();
page.on("pageerror", (e) => console.error("PAGE ERROR:", e.message));
page.on("console", (msg) => {
  if (msg.type() === "error") console.error("CONSOLE ERROR:", msg.text());
});

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(500);

console.log("Testing PDF export...");
const [pdf] = await Promise.all([
  page.waitForEvent("download", { timeout: 30000 }),
  page.locator('button:has-text("PDF İndir")').click(),
]);
const pdfPath = path.join(OUT, pdf.suggestedFilename());
await pdf.saveAs(pdfPath);
console.log(`PDF: ${pdfPath} (${fs.statSync(pdfPath).size} bytes)`);

console.log("Testing Excel export...");
const [xlsx] = await Promise.all([
  page.waitForEvent("download", { timeout: 30000 }),
  page.locator('button:has-text("Excel İndir")').click(),
]);
const xlsxPath = path.join(OUT, xlsx.suggestedFilename());
await xlsx.saveAs(xlsxPath);
console.log(`Excel: ${xlsxPath} (${fs.statSync(xlsxPath).size} bytes)`);

await browser.close();
console.log("Done.");