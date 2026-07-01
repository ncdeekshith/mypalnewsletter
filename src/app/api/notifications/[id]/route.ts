import { NextResponse } from "next/server";
import { markNotificationRead } from "@/lib/store";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { userId } = await request.json();

  try {
    const notification = await markNotificationRead(id, userId);
    return NextResponse.json({ notification });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not update notification." },
      { status: 400 }
    );
  }
}
