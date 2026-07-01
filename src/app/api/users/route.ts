import { NextResponse } from "next/server";
import { userSchema } from "@/lib/schemas";
import { createUser, readDatabase } from "@/lib/store";

export async function GET() {
  const database = await readDatabase();
  return NextResponse.json({
    users: database.users.map(({ password: _password, ...user }) => user)
  });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = userSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const user = await createUser(parsed.data);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not create user" },
      { status: 409 }
    );
  }
}
