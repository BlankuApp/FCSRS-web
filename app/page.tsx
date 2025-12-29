import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, BookOpen, Brain, Zap, ArrowRight } from 'lucide-react';
import HomeAuthRedirect from '@/components/home-auth-redirect';

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://fcsrs-web.vercel.app/#website",
      "url": "https://fcsrs-web.vercel.app",
      "name": "TCSRS - Free AI Flashcard Generator",
      "description": "Create free AI-generated flashcards with smart spaced repetition",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://fcsrs-web.vercel.app/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "SoftwareApplication",
      "name": "TCSRS - Free AI Flashcard Generator",
      "description": "Create free AI-generated flashcards instantly. Smart spaced repetition app that helps you study online with AI-powered questions.",
      "url": "https://fcsrs-web.vercel.app",
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "100"
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How do AI-generated flashcards work?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "TCSRS uses AI to automatically create flashcards based on your topics and custom prompts. Simply define what you want to learn, and AI generates targeted questions and answers tailored to your learning style."
          }
        },
        {
          "@type": "Question",
          "name": "Is the AI flashcard generator free?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! TCSRS offers free AI-generated flashcards. You can create custom decks, add topics, and generate flashcards using AI at no cost."
          }
        },
        {
          "@type": "Question",
          "name": "What is spaced repetition?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Spaced repetition is a learning technique that reviews information at optimal intervals. TCSRS uses a smart algorithm to show you flashcards at the right time for maximum retention and long-term memory."
          }
        },
        {
          "@type": "Question",
          "name": "Can I study flashcards online?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! TCSRS is a web-based flashcard app. You can create, organize, and study your flashcards online from any device with a browser."
          }
        }
      ]
    }
  ]
};

export default function Home() {
  return (
    <>
      {/* Client component for auth redirect */}
      <HomeAuthRedirect />
      
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24 max-w-6xl">
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                TC
              </div>
              <h1 className="text-3xl font-bold">TCSRS</h1>
            </div>

            {/* Headline */}
            <div className="space-y-4 max-w-3xl">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Free <span className="text-primary">AI-Generated</span> Flashcards for Smarter Learning
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Create AI flashcards instantly with our free flashcard generator. 
                Study online with smart spaced repetition and never face the same question twice.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/signup">
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 py-16 max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Powerful AI Study Tools</h3>
            <p className="text-muted-foreground text-lg">
              Everything you need for effective, engaging learning with AI flashcards
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Feature 1: AI-Generated Cards */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Free AI Flashcard Generator</CardTitle>
                <CardDescription>
                  Create flashcards instantly with AI. Our free AI flashcard maker generates 
                  custom questions tailored to your learning style. Let AI do the heavy lifting.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2: Topic Organization */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Topic-Based Organization</CardTitle>
                <CardDescription>
                  Organize your online flashcards into decks and topics. Each topic can have its own 
                  custom AI prompt to generate targeted, relevant study questions.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3: Spaced Repetition */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Smart Spaced Repetition App</CardTitle>
                <CardDescription>
                  Our spaced repetition algorithm adapts to your learning pace. Review flashcards 
                  at optimal intervals for maximum retention and long-term memory.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 4: Dynamic Questions */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Always Fresh AI Questions</CardTitle>
                <CardDescription>
                  Every study session presents different AI-generated questions for the same topic. 
                  Face new challenges each time and truly master your material.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 py-16 max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">How to Create Free AI Flashcards</h3>
            <p className="text-muted-foreground text-lg">
              Get started in four simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <h4 className="text-xl font-semibold">Create a Deck</h4>
              <p className="text-muted-foreground">
                Start by creating a new deck for your subject or course
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <h4 className="text-xl font-semibold">Add Topics</h4>
              <p className="text-muted-foreground">
                Define topics with custom AI prompts that match your learning goals
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <h4 className="text-xl font-semibold">Generate AI Flashcards</h4>
              <p className="text-muted-foreground">
                Let AI automatically create flashcards based on your topics for free
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                4
              </div>
              <h4 className="text-xl font-semibold">Study Online</h4>
              <p className="text-muted-foreground">
                Review with spaced repetition and adaptive questions that change every session
              </p>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center mt-16">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/signup">
                Start Learning Free Today <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* FAQ Section for SEO */}
        <section className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Frequently Asked Questions</h3>
            <p className="text-muted-foreground text-lg">
              Learn more about our free AI flashcard generator
            </p>
          </div>

          <div className="space-y-6">
            <div className="border rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-2">How do AI-generated flashcards work?</h4>
              <p className="text-muted-foreground">
                TCSRS uses AI to automatically create flashcards based on your topics and custom prompts. 
                Simply define what you want to learn, and AI generates targeted questions and answers 
                tailored to your learning style.
              </p>
            </div>

            <div className="border rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-2">Is the AI flashcard generator free?</h4>
              <p className="text-muted-foreground">
                Yes! TCSRS offers free AI-generated flashcards. You can create custom decks, add topics, 
                and generate flashcards using AI at no cost.
              </p>
            </div>

            <div className="border rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-2">What is spaced repetition?</h4>
              <p className="text-muted-foreground">
                Spaced repetition is a learning technique that reviews information at optimal intervals. 
                TCSRS uses a smart algorithm to show you flashcards at the right time for maximum 
                retention and long-term memory.
              </p>
            </div>

            <div className="border rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-2">Can I study flashcards online?</h4>
              <p className="text-muted-foreground">
                Yes! TCSRS is a web-based flashcard app. You can create, organize, and study your 
                flashcards online from any device with a browser.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
