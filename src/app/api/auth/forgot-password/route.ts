import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";
import { readDatabase } from "@/lib/store";

export async function POST(request: Request) {
  const { email } = (await request.json()) as { email?: string };
  const database = await readDatabase();
  const user = database.users.find((item) => item.email.toLowerCase() === email?.toLowerCase() && item.active !== false);
  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "";

  if (user) {
    await sendMail({
      to: user.email,
      subject: "myPAL Newsletter Studio login link",
      body: `Hi ${user.name},\n\nUse this link to open the myPAL Newsletter Studio:\n${origin}/login\n\nLogin email: ${user.email}\n\nIf you forgot your password, ask an admin to reset it from Team Access Console.\n\n- myPAL Newsletter Team`
    });
  }

  return NextResponse.json({ ok: true });
}
