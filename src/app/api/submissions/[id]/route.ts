import { NextResponse } from "next/server";
import { readDatabase, upsertSubmission, writeDatabase } from "@/lib/store";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const patch = await request.json();
  const database = await readDatabase();
  const current = database.submissions.find((item) => item.id === id);

  if (!current) {
    return NextResponse.json({ message: "Submission not found" }, { status: 404 });
  }

  const submission = await upsertSubmission({ ...current, ...patch, id });
  return NextResponse.json({ submission });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const database = await readDatabase();
  database.submissions = database.submissions.filter((item) => item.id !== id);
  await writeDatabase(database);
  return NextResponse.json({ ok: true });
}
