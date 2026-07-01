import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { firebaseEnabled } from "@/lib/firebase";
import { uploadFirebaseDataUrl } from "@/lib/firebase-store";

export async function POST(request: Request) {
  const { dataUrl, folder = "uploads" } = (await request.json()) as { dataUrl?: string; folder?: string };

  if (!dataUrl?.startsWith("data:image/")) {
    return NextResponse.json({ message: "Upload must be an image data URL." }, { status: 400 });
  }

  if (!firebaseEnabled()) {
    return NextResponse.json({ url: dataUrl, storagePath: null, mode: "local" });
  }

  try {
    const storagePath = `${folder}/${nanoid()}.png`;
    const url = await uploadFirebaseDataUrl(dataUrl, storagePath);
    return NextResponse.json({ url, storagePath, mode: "firebase" });
  } catch (error) {
    console.warn("Firebase upload failed; using local data URL fallback.", error);
    return NextResponse.json({
      url: dataUrl,
      storagePath: null,
      mode: "local-fallback",
      warning: "Firebase upload failed. Check Firebase Storage rules or credentials."
    });
  }
}
