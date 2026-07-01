import { NextResponse } from "next/server";
import { readDatabase } from "@/lib/store";

export async function GET() {
  const database = await readDatabase();
  return NextResponse.json({
    departments: database.departments,
    issues: database.issues,
    settings: database.settings,
    generatedPdfs: database.generatedPdfs,
    users: database.users.map(({ password: _password, ...user }) => user),
    notifications: database.notifications,
    emailOutbox: database.emailOutbox
  });
}
