import path from "path";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import { chromium } from "playwright";
import { addGeneratedPdf, readDatabase } from "@/lib/store";
import { fileSafeNewsletterName } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  const { issueId } = (await request.json()) as { issueId?: string };
  const database = await readDatabase();
  const issue = database.issues.find((item) => item.id === issueId) ?? database.issues[0];

  if (!issue) {
    return NextResponse.json({ message: "No newsletter issue found" }, { status: 404 });
  }

  const requestOrigin = new URL(request.url).origin;
  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? requestOrigin;
  const fileName = fileSafeNewsletterName(issue.month, issue.year, issue.issueNumber);
  const outputDir = path.join(process.cwd(), "public", "generated");
  const outputPath = path.join(outputDir, fileName);
  const serverless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) && process.platform === "linux";

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = serverless
      ? await createPdfWithPuppeteer(`${origin}/preview/print?issueId=${issue.id}`)
      : await createPdfWithPlaywright(`${origin}/preview/print?issueId=${issue.id}`);
  } catch (error) {
    return NextResponse.json(
      {
        message: "PDF generation failed. Chromium could not render this newsletter.",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }

  if (serverless) {
    return NextResponse.json({
      pdf: {
        issueId: issue.id,
        fileName,
        fileUrl: "",
        base64: pdfBuffer.toString("base64"),
        createdAt: new Date().toISOString()
      }
    });
  }

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, pdfBuffer);

  const pdf = await addGeneratedPdf({ issueId: issue.id, fileName, fileUrl: `/generated/${fileName}` });

  return NextResponse.json({ pdf });
}

async function createPdfWithPlaywright(url: string) {
  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage({ viewport: { width: 1240, height: 1754 }, deviceScaleFactor: 2 });
    await page.goto(url, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    return await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" }
    });
  } finally {
    if (browser) await browser.close().catch(() => undefined);
  }
}

async function createPdfWithPuppeteer(url: string) {
  const [{ default: serverlessChromium }, puppeteer] = await Promise.all([
    import("@sparticuz/chromium-min"),
    import("puppeteer-core")
  ]);
  const chromiumPackUrl =
    process.env.CHROMIUM_PACK_URL ??
    "https://github.com/Sparticuz/chromium/releases/download/v149.0.0/chromium-v149.0.0-pack.tar";
  const executablePath = await serverlessChromium.executablePath(chromiumPackUrl);
  if (!executablePath) throw new Error("Serverless Chromium executable path was not found.");

  const browser = await puppeteer.launch({
    args: await puppeteer.defaultArgs({
      args: [...serverlessChromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
      headless: "shell"
    }),
    defaultViewport: { width: 1240, height: 1754, deviceScaleFactor: 2 },
    executablePath,
    headless: "shell"
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
    await page.emulateMediaType("print");
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" }
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close().catch(() => undefined);
  }
}
