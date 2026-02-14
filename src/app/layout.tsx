import type { Metadata } from "next";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import { reviewQueue, rescheduleAllReviews } from "@/lib/reviewQueue";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Review4Mastering — Spaced Repetition for Deep Knowledge",
  description:
    "Master any subject with scientifically-proven spaced repetition. Review notes on an escalating schedule from 10 minutes to 5 years.",
};
if (typeof window === "undefined") {
  reviewQueue.resume().then(async () => {
    console.log("✅ Review queue started");
    await rescheduleAllReviews();
  });
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
