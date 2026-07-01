import { NextResponse } from "next/server";
import { issueSchema } from "@/lib/schemas";
import { readDatabase, updateIssue } from "@/lib/store";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const database = await readDatabase();
  const current = database.issues.find((issue) => issue.id === id);

  if (!current) {
    return NextResponse.json({ message: "Issue not found" }, { status: 404 });
  }

  const payload = { ...current, ...(await request.json()), id };
  const parsed = issueSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  }

  const issue = await updateIssue(parsed.data);
  return NextResponse.json({ issue });
}
