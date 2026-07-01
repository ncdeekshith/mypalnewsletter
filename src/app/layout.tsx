import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "myPAL Newsletter Generator",
  description: "Internal monthly newsletter submission, review, preview, and PDF export tool."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
