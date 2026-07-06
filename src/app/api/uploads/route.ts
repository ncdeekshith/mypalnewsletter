import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { firebaseEnabled } from "@/lib/firebase";
import { saveFirebaseUpload, uploadFirebaseDataUrl } from "@/lib/firebase-store";

const firestoreUploadLimit = 850_000;

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
    console.warn("Firebase Storage upload failed; using Firestore upload record.", error);
    if (dataUrl.length > firestoreUploadLimit) {
      return NextResponse.json(
        { message: "Photo is too large for the current Firebase setup. Please upload a smaller or compressed image." },
        { status: 413 }
      );
    }

    const id = nanoid();
    try {
      await saveFirebaseUpload(id, dataUrl);
      return NextResponse.json({
        url: new URL(`/api/uploads/${id}`, request.url).toString(),
        storagePath: `newsletter_uploads/${id}`,
        mode: "firestore"
      });
    } catch (uploadError) {
      console.error("Firestore upload record failed", uploadError);
      return NextResponse.json(
        { message: "Photo could not be saved. Check Firestore rules for the newsletter_uploads collection." },
        { status: 500 }
      );
    }
  }
}
