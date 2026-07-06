import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { getFirebaseDb, getFirebaseStorage } from "@/lib/firebase";
import { seedDatabase } from "@/lib/seed";
import type { NewsletterDatabase } from "@/lib/types";

const databaseDoc = ["newsletter_app", "default"] as const;

export async function readFirebaseDatabase(): Promise<NewsletterDatabase> {
  const snapshot = await getDoc(doc(getFirebaseDb(), ...databaseDoc));
  if (!snapshot.exists()) {
    await writeFirebaseDatabase(seedDatabase);
    return seedDatabase;
  }

  return snapshot.data() as NewsletterDatabase;
}

export async function writeFirebaseDatabase(database: NewsletterDatabase) {
  await setDoc(doc(getFirebaseDb(), ...databaseDoc), database);
}

export async function uploadFirebaseDataUrl(dataUrl: string, storagePath: string) {
  const uploadRef = ref(getFirebaseStorage(), storagePath);
  await uploadString(uploadRef, dataUrl, "data_url");
  return getDownloadURL(uploadRef);
}

export async function saveFirebaseUpload(id: string, dataUrl: string) {
  await setDoc(doc(getFirebaseDb(), "newsletter_uploads", id), {
    dataUrl,
    createdAt: new Date().toISOString()
  });
}

export async function readFirebaseUpload(id: string) {
  const snapshot = await getDoc(doc(getFirebaseDb(), "newsletter_uploads", id));
  if (!snapshot.exists()) return null;
  const data = snapshot.data() as { dataUrl?: string };
  return data.dataUrl ?? null;
}
