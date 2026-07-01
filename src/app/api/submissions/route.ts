import { NextResponse } from "next/server";
import { addNotification, readDatabase, upsertSubmission } from "@/lib/store";
import { submissionSchema } from "@/lib/schemas";
import { sendMail } from "@/lib/mailer";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const role = searchParams.get("role");
  const database = await readDatabase();
  const submissions =
    role === "admin" ? database.submissions : database.submissions.filter((item) => item.userId === userId);

  return NextResponse.json({
    submissions: submissions.sort((a, b) => a.sortOrder - b.sortOrder),
    departments: database.departments,
    issues: database.issues
  });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = submissionSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  }

  const submission = await upsertSubmission(parsed.data);
  if (parsed.data.status === "submitted") {
    const database = await readDatabase();
    const contributor = database.users.find((user) => user.id === parsed.data.userId);
    const department = database.departments.find((item) => item.id === parsed.data.departmentId);
    const admins = database.users.filter((user) => user.role === "admin" && user.active !== false);
    const departmentName = department?.name ?? parsed.data.sectionTitle;

    if (contributor) {
      await addNotification({
        userId: contributor.id,
        title: "Submission received",
        body: `Your ${departmentName} update is now with the admin team for review.`,
        type: "submission"
      });
      await sendMail({
        to: contributor.email,
        subject: `myPAL newsletter submission received: ${departmentName}`,
        body: `Hi ${contributor.name},\n\nWe received your ${departmentName} monthly update for ${database.issues[0]?.month ?? "this"} issue.\n\nStatus: Submitted for review\nHeadline: ${parsed.data.headline}\n\nYou will see reviewer notes in your dashboard if changes are needed.\n\n- myPAL Newsletter Team`
      });
    }

    await Promise.all(admins.map(async (admin) => {
      await addNotification({
        userId: admin.id,
        title: `${departmentName} submitted`,
        body: `${contributor?.name ?? "A contributor"} submitted "${parsed.data.headline}" for review.`,
        type: "review"
      });
      await sendMail({
        to: admin.email,
        subject: `Review needed: ${departmentName} newsletter update`,
        body: `Hi ${admin.name},\n\n${contributor?.name ?? "A contributor"} submitted the ${departmentName} update.\n\nHeadline: ${parsed.data.headline}\n\nOpen the admin dashboard to approve, reject, edit, reorder, or preview it.\n\n- myPAL Newsletter Studio`
      });
    }));
  }
  return NextResponse.json({ submission });
}
