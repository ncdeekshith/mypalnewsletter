import { NextResponse } from "next/server";
import { addNotification, readDatabase } from "@/lib/store";
import { sendMail } from "@/lib/mailer";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const database = await readDatabase();
  const issue = database.issues[0];
  const departments = database.departments.filter((department) => ["academic", "tech", "sales", "marketing"].includes(department.id));
  const pendingDepartments = departments.filter((department) => {
    const submission = database.submissions.find((item) => item.issueId === issue.id && item.departmentId === department.id);
    return !submission || submission.status === "draft" || submission.status === "rejected";
  });

  const recipients = database.users.filter(
    (user) => user.active !== false && user.role === "contributor" && pendingDepartments.some((department) => department.id === user.departmentId)
  );

  await Promise.all(recipients.map(async (user) => {
    const department = database.departments.find((item) => item.id === user.departmentId);
    await addNotification({
      userId: user.id,
      title: payload.title ?? "Monthly newsletter update due",
      body: `Please submit your ${department?.name ?? "team"} update for ${issue.month} ${issue.year}${issue.dueDate ? ` by ${issue.dueDate}` : ""}.`,
      type: "reminder"
    });
    await sendMail({
      to: user.email,
      subject: payload.subject ?? `Reminder: Submit ${issue.month} myPAL newsletter update`,
      body: `Hi ${user.name},\n\nPlease submit your ${department?.name ?? "team"} monthly update for ${issue.title}.\n\nDue date: ${issue.dueDate ?? "Not set"}\nRequired: intro, 3 bullet achievements, metrics, and 4 photos with captions.\n\n- myPAL Newsletter Team`
    });
  }));

  return NextResponse.json({ sent: recipients.length, pendingDepartments: pendingDepartments.map((item) => item.name) });
}
