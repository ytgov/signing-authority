import puppeteer, { PaperFormat } from "puppeteer";

export async function generatePDF(content: string, format: PaperFormat = "letter", landscape: boolean = true) {
  const browser = await puppeteer.launch({
    headless: "shell",
    args: ["--enable-gpu", "--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(content);
  const pdf = await page.pdf({
    format,
    landscape,
    preferCSSPageSize: true,
  });
  await browser.close();
  return Promise.resolve(pdf);
}
