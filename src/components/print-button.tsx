"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="flex items-center gap-2 rounded border border-slate-200 px-4 py-2 text-sm font-bold text-mypal-deep">
      <Printer size={16} /> Print
    </button>
  );
}
