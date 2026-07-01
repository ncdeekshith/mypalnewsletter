import { NextResponse } from "next/server";
import { updateUser } from "@/lib/store";

export async function POST(request: Request) {
  const { userId, password } = (await request.json()) as { userId?: string; password?: string };

  if (!userId || !password || password.length < 6) {
    return NextResponse.json({ message: "Password must be at least 6 characters." }, { status: 400 });
  }

  try {
    await updateUser(userId, { password });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not reset password." },
      { status: 400 }
    );
  }
}
