import { NextResponse } from "next/server";
import { readDatabase } from "@/lib/store";

export async function POST(request: Request) {
  const { email } = (await request.json()) as { email?: string };
  const database = await readDatabase();
  const user = database.users.find((item) => item.email.toLowerCase() === email?.toLowerCase() && item.active !== false);

  if (!user) {
    return NextResponse.json({ message: "This Google account is not registered in myPAL Newsletter Studio." }, { status: 401 });
  }

  const { password: _password, ...safeUser } = user;
  return NextResponse.json({ user: safeUser });
}
