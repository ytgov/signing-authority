import puppeteer, { PaperFormat } from "puppeteer";

export async function generatePDF(
  content: string,
  format: PaperFormat = "letter",
  landscape: boolean = true
): Promise<Buffer> {
  console.log("PDF1")
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  console.log("PDF2")
  const page = await browser.newPage();
  console.log("PDF3")
  await page.setContent(content);
  console.log("PDF4")
  const pdf = await page.pdf({ format, landscape, preferCSSPageSize: true });
  
  console.log("PDF5")

  await browser.close();
  
  console.log("PDF6")
  return Promise.resolve(pdf);
}
