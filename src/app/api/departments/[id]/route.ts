import { NextResponse } from "next/server";
import { deleteDepartment, updateDepartment } from "@/lib/store";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const payload = await request.json();

  try {
    const department = await updateDepartment(id, payload);
    return NextResponse.json({ department });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not update department." },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    await deleteDepartment(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not delete department." },
      { status: 400 }
    );
  }
}
