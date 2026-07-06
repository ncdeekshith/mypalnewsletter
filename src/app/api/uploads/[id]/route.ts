import { NextResponse } from "next/server";
import { readFirebaseUpload } from "@/lib/firebase-store";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dataUrl = await readFirebaseUpload(id);

  if (!dataUrl) {
    return NextResponse.json({ message: "Upload not found." }, { status: 404 });
  }

  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    return NextResponse.json({ message: "Upload is not a valid image." }, { status: 422 });
  }

  const [, contentType, base64] = match;
  return new NextResponse(Buffer.from(base64, "base64"), {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": contentType
    }
  });
}
