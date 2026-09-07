/* eslint-disable */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const URL = "http://localhost:4000/";
const DOWNLOAD_DIR = "./downloads";
fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

const browser = await chromium.launch({
  executablePath:
    process.env.HOME + "/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome",
});

const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  locale: "tr-TR",
  acceptDownloads: true,
});

const page = await context.newPage();
page.on("pageerror", (e) => console.error("PAGE ERROR:", e.message));
page.on("console", (msg) => {
  if (msg.type() === "error") {
    console.error("CONSOLE ERROR:", msg.text());
  }
});

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(500);

// Initial render
const initialMonthly = await page.locator('text=Aylık Taksit').locator('xpath=following::*[1]').textContent();
console.log(`Initial aylık taksit: ${initialMonthly}`);

// Click Hesapla
await page.locator('button:has-text("Hesapla")').click();
await page.waitForTimeout(500);

const monthlyAfterCalc = await page.locator('text=Aylık Taksit').locator('xpath=following::*[1]').textContent();
console.log(`After Hesapla: ${monthlyAfterCalc}`);

// Change principal to a larger value
const principalInput = page.locator('#principal');
await principalInput.click({ clickCount: 3 });
await principalInput.fill("");
await principalInput.type("125.000.000", { delay: 30 });
await principalInput.blur();
await page.waitForTimeout(300);

await page.locator('button:has-text("Hesapla")').click();
await page.waitForTimeout(500);

const monthlyAfterLarge = await page.locator('text=Aylık Taksit').locator('xpath=following::*[1]').textContent();
console.log(`After 125M principal: ${monthlyAfterLarge}`);

// Test that the page doesn't overflow even with large values
const overflowCheck = await page.evaluate(() => {
  return {
    scrollWidth: document.body.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  };
});
console.log(`Overflow check: scroll=${overflowCheck.x} client=${overflowCheck.clientWidth} delta=${overflowCheck.scrollWidth - overflowCheck.clientWidth}`);

// Reset to small value
await principalInput.click({ clickCount: 3 });
await principalInput.fill("");
await principalInput.type("100000", { delay: 30 });
await principalInput.blur();
await page.waitForTimeout(300);
await page.locator('button:has-text("Hesapla")').click();
await page.waitForTimeout(500);

// Test PDF download
console.log("Testing PDF export...");
const [pdfDownload] = await Promise.all([
  page.waitForEvent("download", { timeout: 15000 }),
  page.locator('button:has-text("PDF İndir")').click(),
]);
const pdfPath = path.join(DOWNLOAD_DIR, pdfDownload.suggestedFilename());
await pdfDownload.saveAs(pdfPath);
const pdfSize = fs.statSync(pdfPath).size;
const pdfBuffer = fs.readFileSync(pdfPath);
const pdfHeader = pdfBuffer.slice(0, 4).toString("ascii");
console.log(`PDF saved: ${pdfPath} (${pdfSize} bytes, header: ${pdfHeader})`);
if (!pdfHeader.startsWith("%PDF")) {
  console.error("❌ PDF is not a valid PDF file!");
  process.exit(1);
}

// Test Excel download
console.log("Testing Excel export...");
const [excelDownload] = await Promise.all([
  page.waitForEvent("download", { timeout: 15000 }),
  page.locator('button:has-text("Excel İndir")').click(),
]);
const excelPath = path.join(DOWNLOAD_DIR, excelDownload.suggestedFilename());
await excelDownload.saveAs(excelPath);
const excelSize = fs.statSync(excelPath).size;
const excelBuffer = fs.readFileSync(excelPath);
const excelHeader = excelBuffer.slice(0, 4);
console.log(`Excel saved: ${excelPath} (${excelSize} bytes, header: ${excelHeader[0].toString(16)} ${excelHeader[1].toString(16)} ${excelHeader[2].toString(16)} ${excelHeader[3].toString(16)})`);
if (excelHeader[0] !== 0x50 || excelHeader[1] !== 0x4b) {
  console.error("❌ Excel is not a valid xlsx file!");
  process.exit(1);
}

// Test URL state
console.log("Testing URL state...");
const urlAfter = page.url();
console.log(`URL after calc: ${urlAfter}`);
if (!urlAfter.includes("amount=") || !urlAfter.includes("term=")) {
  console.error("❌ URL state not written!");
  process.exit(1);
}

// Navigate via URL
console.log("Testing URL load...");
const params = new URLSearchParams();
params.set("type", "vehicle");
params.set("amount", "200000");
params.set("term", "48");
params.set("rate", "3.5");
params.set("kkdf", "10");
params.set("bsmv", "10");
params.set("start", "2027-01-15");
await page.goto(`${URL}?${params.toString()}`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);

const creditType = await page.locator('#credit-type').inputValue();
const principalValue = await page.locator('#principal').inputValue();
const termValue = await page.locator('#term').inputValue();
const rateValue = await page.locator('#interest-rate').inputValue();
console.log(`URL load -> type=${creditType}, principal=${principalValue}, term=${termValue}, rate=${rateValue}`);

if (creditType !== "vehicle" || principalValue !== "200.000,00" || termValue !== "48") {
  console.error("❌ URL state not properly restored!");
  process.exit(1);
}

console.log("\n✓ All e2e checks passed!");
await browser.close();