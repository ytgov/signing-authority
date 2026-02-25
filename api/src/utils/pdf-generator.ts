import puppeteer, { PaperFormat } from "puppeteer";

export async function generatePDF(content: string, format: PaperFormat = "letter", landscape: boolean = true) {
  const browser = await puppeteer.launch({
    headless: "shell",
    protocolTimeout: 360_000,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-extensions",
      "--js-flags=--max-old-space-size=4096",
    ],
  });
  const page = await browser.newPage();
  await page.setContent(content, { waitUntil: "networkidle0", timeout: 360_000 });
  const pdf = await page.pdf({
    format,
    landscape,
    preferCSSPageSize: true,
    timeout: 360_000,
  });
  await browser.close();
  return pdf;
}
