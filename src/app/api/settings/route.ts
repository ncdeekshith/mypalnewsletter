import { NextResponse } from "next/server";
import { settingsSchema } from "@/lib/schemas";
import { readDatabase, updateSettings } from "@/lib/store";

export async function GET() {
  const database = await readDatabase();
  return NextResponse.json({ settings: database.settings });
}

export async function PUT(request: Request) {
  const payload = await request.json();
  const parsed = settingsSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  }

  const settings = await updateSettings(parsed.data);
  return NextResponse.json({ settings });
}
