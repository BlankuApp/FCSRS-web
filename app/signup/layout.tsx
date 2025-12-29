import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up Free",
  description:
    "Create your free account and start making AI-generated flashcards instantly. Join TCSRS to study smarter with our free AI flashcard generator and spaced repetition system.",
  openGraph: {
    title: "Sign Up Free | TCSRS - AI Flashcard Generator",
    description:
      "Create your free account and start making AI-generated flashcards instantly. Study smarter with spaced repetition.",
  },
  alternates: {
    canonical: "https://fcsrs-web.vercel.app/signup",
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
