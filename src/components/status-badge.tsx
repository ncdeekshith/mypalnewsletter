import type { SubmissionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const styles: Record<SubmissionStatus, string> = {
  draft: "bg-slate-100 text-slate-700 ring-slate-200",
  submitted: "bg-amber-100 text-amber-800 ring-amber-200",
  approved: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  rejected: "bg-rose-100 text-rose-800 ring-rose-200",
  published: "bg-mypal-orange text-white ring-orange-200"
};

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1", styles[status])}>
      {status}
    </span>
  );
}
