import { NextResponse } from "next/server";
import { readDatabase } from "@/lib/store";

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as { email?: string; password?: string };
  const database = await readDatabase();
  const user = database.users.find(
    (item) => item.email.toLowerCase() === email?.toLowerCase() && item.password === password && item.active !== false
  );

  if (!user) {
    return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
  }

  const { password: _password, ...safeUser } = user;
  return NextResponse.json({ user: safeUser });
}
