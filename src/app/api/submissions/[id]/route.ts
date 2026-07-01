import { NextResponse } from "next/server";
import { addNotification, readDatabase, upsertSubmission, writeDatabase } from "@/lib/store";
import { sendMail } from "@/lib/mailer";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const patch = await request.json();
  const database = await readDatabase();
  const current = database.submissions.find((item) => item.id === id);

  if (!current) {
    return NextResponse.json({ message: "Submission not found" }, { status: 404 });
  }

  const submission = await upsertSubmission({ ...current, ...patch, id });

  if (patch.status && patch.status !== current.status && ["approved", "rejected"].includes(patch.status)) {
    const latest = await readDatabase();
    const contributor = latest.users.find((user) => user.id === submission.userId);
    if (contributor) {
      const title = patch.status === "approved" ? "Submission approved" : "Changes requested";
      const body =
        patch.status === "approved"
          ? `${submission.sectionTitle} has been approved for the newsletter.`
          : `${submission.sectionTitle} was sent back with reviewer notes.`;
      await addNotification({
        userId: contributor.id,
        title,
        body,
        type: "review"
      });
      await sendMail({
        to: contributor.email,
        subject: `myPAL newsletter update ${patch.status}: ${submission.sectionTitle}`,
        body: `Hi ${contributor.name},\n\n${body}\n\n${submission.reviewerNote ? `Reviewer note: ${submission.reviewerNote}\n\n` : ""}Open your dashboard to view the current status.\n\n- myPAL Newsletter Team`
      });
    }
  }

  return NextResponse.json({ submission });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const database = await readDatabase();
  database.submissions = database.submissions.filter((item) => item.id !== id);
  await writeDatabase(database);
  return NextResponse.json({ ok: true });
}
