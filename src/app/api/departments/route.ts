import { NextResponse } from "next/server";
import { createDepartment, readDatabase } from "@/lib/store";

export async function GET() {
  const database = await readDatabase();
  return NextResponse.json({ departments: database.departments });
}

export async function POST(request: Request) {
  const payload = await request.json();

  try {
    const department = await createDepartment({
      name: payload.name,
      sectionTitle: payload.sectionTitle || payload.name,
      ownerTitle: payload.ownerTitle || "Team Owner"
    });
    return NextResponse.json({ department }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Could not create department." },
      { status: 400 }
    );
  }
}
