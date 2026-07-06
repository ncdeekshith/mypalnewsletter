import path from "path";
import { promises as fs } from "fs";
import { NextResponse } from "next/server";
import { chromium } from "playwright";
import { addGeneratedPdf, readDatabase } from "@/lib/store";
import { fileSafeNewsletterName } from "@/lib/utils";

export const runtime = "nodejs";

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

  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;
  try {
    await fs.mkdir(outputDir, { recursive: true });
    browser = await launchChromium();
    const page = await browser.newPage({ viewport: { width: 1240, height: 1754 }, deviceScaleFactor: 2 });
    await page.goto(`${origin}/preview/print?issueId=${issue.id}`, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    await page.pdf({
      path: outputPath,
      format: "A4",
      printBackground: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" }
    });
  } catch (error) {
    if (browser) await browser.close().catch(() => undefined);
    return NextResponse.json(
      {
        message: "PDF generation failed. Chromium could not start on this environment.",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  } finally {
    if (browser) await browser.close().catch(() => undefined);
  }

  const pdf = await addGeneratedPdf({
    issueId: issue.id,
    fileName,
    fileUrl: `/generated/${fileName}`
  });

  return NextResponse.json({ pdf });
}

async function launchChromium() {
  const localArgs = ["--no-sandbox", "--disable-setuid-sandbox"];

  try {
    return await chromium.launch({
      headless: true,
      args: localArgs
    });
  } catch (localError) {
    const serverlessChromium = await import("@sparticuz/chromium");
    const executablePath = await serverlessChromium.default.executablePath();
    if (!executablePath) throw localError;

    return chromium.launch({
      executablePath,
      headless: true,
      args: [...serverlessChromium.default.args, ...localArgs]
    });
  }
}
