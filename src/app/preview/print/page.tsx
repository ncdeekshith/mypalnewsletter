import { NewsletterPreview } from "@/components/newsletter-preview";
import { readDatabase } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function PrintPreviewPage() {
  const database = await readDatabase();
  const issue = database.issues[0];

  return (
    <main className="bg-white">
      <NewsletterPreview settings={database.settings} issue={issue} submissions={database.submissions} />
    </main>
  );
}
