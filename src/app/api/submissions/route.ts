import { NextResponse } from "next/server";
import { readDatabase, upsertSubmission } from "@/lib/store";
import { submissionSchema } from "@/lib/schemas";

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
  return NextResponse.json({ submission });
}
