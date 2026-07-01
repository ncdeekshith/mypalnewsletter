import { NextResponse } from "next/server";
import { deleteUser, updateUser } from "@/lib/store";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const payload = await request.json();

  try {
    const user = await updateUser(id, payload);
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not update user." },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    await deleteUser(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not delete user." },
      { status: 400 }
    );
  }
}
