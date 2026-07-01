import { NextResponse } from "next/server";
import { readDatabase, updateIssue, writeDatabase } from "@/lib/store";
import { sendMail } from "@/lib/mailer";

export async function POST(request: Request) {
  const { issueId } = (await request.json()) as { issueId?: string };
  const database = await readDatabase();
  const issue = database.issues.find((item) => item.id === issueId) ?? database.issues[0];

  if (!issue) {
    return NextResponse.json({ message: "No issue found." }, { status: 404 });
  }

  const pdf = database.generatedPdfs.find((item) => item.issueId === issue.id);
  if (!pdf) {
    return NextResponse.json({ message: "Generate the PDF before publishing." }, { status: 400 });
  }

  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
  const pdfUrl = pdf.fileUrl.startsWith("http") ? pdf.fileUrl : `${origin}${pdf.fileUrl}`;
  const recipients = database.settings.stakeholders ?? [];

  await Promise.all(recipients.map((recipient) =>
    sendMail({
      to: recipient.email,
      subject: `${issue.title} - ${issue.month} ${issue.year}`,
      body: `Hi ${recipient.name},\n\nThe ${issue.month} ${issue.year} myPAL newsletter has been published.\n\nOpen PDF: ${pdfUrl}\n\n${database.settings.footerText}\n\n- myPAL Newsletter Team`
    })
  ));

  await updateIssue({ ...issue, status: "published" });
  const next = await readDatabase();
  next.submissions = next.submissions.map((submission) =>
    submission.issueId === issue.id && submission.visible && ["approved", "published"].includes(submission.status)
      ? { ...submission, status: "published" }
      : submission
  );
  await writeDatabase(next);

  return NextResponse.json({ published: true, recipients: recipients.length, pdfUrl });
}
