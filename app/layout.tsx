import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import Navigation from "@/components/navigation";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fcsrs-web.vercel.app"),
  title: {
    default: "Free AI Flashcard Generator | TCSRS - Smart Spaced Repetition",
    template: "%s | TCSRS",
  },
  description:
    "Create free AI-generated flashcards instantly. TCSRS is a smart spaced repetition app that helps you study flashcards online with AI-powered questions. The best AI study tool for effective learning.",
  keywords: [
    "free AI flashcards",
    "AI flashcard generator",
    "free AI generated flashcards",
    "AI flashcard maker",
    "study flashcards online",
    "spaced repetition app",
    "AI study tool",
    "flashcard app",
    "online flashcards",
    "smart flashcards",
    "learning app",
    "study tool",
  ],
  authors: [{ name: "TCSRS" }],
  creator: "TCSRS",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fcsrs-web.vercel.app",
    siteName: "TCSRS - Free AI Flashcard Generator",
    title: "Free AI Flashcard Generator | TCSRS - Smart Spaced Repetition",
    description:
      "Create free AI-generated flashcards instantly. Smart spaced repetition app that helps you study online with AI-powered questions.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Flashcard Generator | TCSRS",
    description:
      "Create free AI-generated flashcards instantly. Smart spaced repetition for effective learning.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://fcsrs-web.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Navigation />
          <main className="min-h-[calc(100vh-4rem-1px)]">{children}</main>
        </AuthProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
