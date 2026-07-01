import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { NewsletterPreview } from "@/components/newsletter-preview";
import { PrintButton } from "@/components/print-button";
import { readDatabase } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function PreviewPage() {
  const database = await readDatabase();
  const issue = database.issues[0];

  return (
    <main className="min-h-screen bg-mypal-cloud">
      <div className="no-print sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-mypal-deep">Newsletter Preview</h1>
            <p className="text-sm text-slate-500">Approved and visible sections are included.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 rounded border border-slate-200 px-4 py-2 text-sm font-bold text-mypal-deep">
              <LayoutDashboard size={16} /> Dashboard
            </Link>
            <PrintButton />
          </div>
        </div>
      </div>
      <div className="py-8 print:p-0">
        <NewsletterPreview settings={database.settings} issue={issue} submissions={database.submissions} />
      </div>
    </main>
  );
}
