import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fileSafeNewsletterName(month: string, year: number, issueNumber: string) {
  return `myPAL_Newsletter_${month}_${year}_Issue_${issueNumber}.pdf`;
}
