import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { defaultPrompts } from '@/lib/default-prompts';
import { BookOpen, Brain, CalendarClock, CircleCheck, Sparkles, Shuffle, Zap, ArrowRight, Repeat2 } from 'lucide-react';
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
  const promptExamples = ['english-vocabulary', 'programming', 'science-concepts'] as const;
  const promptById = new Map(defaultPrompts.map((p) => [p.id, p]));
  const promptExcerpt = (prompt: string, maxLines = 18) => {
    const lines = prompt.trim().split('\n');
    const excerpt = lines.slice(0, maxLines).join('\n');
    return lines.length > maxLines ? `${excerpt}\n…` : excerpt;
  };

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
            <h3 className="text-3xl font-bold mb-4">How it works</h3>
            <p className="text-muted-foreground text-lg">
              Create a deck, add topics, then review with spaced repetition
            </p>
          </div>

          <div className="space-y-8">
            {/* Step 1 */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                    1
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-xl">Create a deck (and set the deck AI prompt)</CardTitle>
                    <CardDescription>
                      Your deck prompt is the “instruction manual” for the AI: what to generate, formatting rules, and the card types you want (Q/A, multiple choice, cloze, etc.).
                      We also provide a wide variety of ready-made templates across different subjects—pick one that matches your goal, then customize it to your preferences (tone, difficulty, format, and question types).
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Pick a strong starting prompt and tweak it for your learner profile. Here are a few examples:
                </div>

                <Tabs defaultValue={promptExamples[0]} className="w-full">
                  <TabsList className="w-full flex-wrap">
                    {promptExamples.map((id) => (
                      <TabsTrigger key={id} value={id}>
                        {promptById.get(id)?.name ?? id}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {promptExamples.map((id) => {
                    const prompt = promptById.get(id);
                    if (!prompt) return null;
                    return (
                      <TabsContent key={id} value={id} className="mt-3">
                        <div className="space-y-2">
                          <div className="text-sm">
                            <div className="text-muted-foreground">{prompt.description}</div>
                          </div>
                          <div className="rounded-lg border bg-muted/40 p-4">
                            <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed max-h-72 overflow-auto">
                              {promptExcerpt(prompt.content)}
                            </pre>
                          </div>
                        </div>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                    2
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-xl">Add topics (AI generates cards per topic)</CardTitle>
                    <CardDescription>
                      Each topic you add is appended to your deck prompt. Then AI generates a batch of cards under that topic automatically (Q/A and multiple choice).
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <BookOpen className="h-4 w-4 text-primary" />
                      Topic examples (what you type)
                    </div>
                    <Tabs defaultValue={promptExamples[0]} className="w-full">
                      <TabsList className="w-full flex-wrap">
                        {promptExamples.map((id) => (
                          <TabsTrigger key={id} value={id}>
                            {promptById.get(id)?.name ?? id}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      <TabsContent value="english-vocabulary" className="mt-3">
                        <div className="rounded-lg border bg-muted/40 p-4">
                          <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">
                            {`"mitigate" (formal verb)`}
                          </pre>
                        </div>
                      </TabsContent>
                      <TabsContent value="programming" className="mt-3">
                        <div className="rounded-lg border bg-muted/40 p-4">
                          <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">
                            {`Big‑O complexity (common patterns)`}
                          </pre>
                        </div>
                      </TabsContent>
                      <TabsContent value="science-concepts" className="mt-3">
                        <div className="rounded-lg border bg-muted/40 p-4">
                          <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">
                            {`Newton’s 2nd law (F = m·a)`}
                          </pre>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Example cards generated by AI
                    </div>
                    <Tabs defaultValue={promptExamples[0]} className="w-full">
                      <TabsList className="w-full flex-wrap">
                        {promptExamples.map((id) => (
                          <TabsTrigger key={id} value={id}>
                            {promptById.get(id)?.name ?? id}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      <TabsContent value="english-vocabulary" className="mt-3 space-y-3">
                        <div className="rounded-lg border p-4">
                          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Q/A</div>
                          <div className="font-medium">Question</div>
                          <div className="text-muted-foreground text-sm">What does “mitigate” mean, and when would you use it?</div>
                          <Separator className="my-3" />
                          <div className="font-medium">Answer</div>
                          <div className="text-muted-foreground text-sm">
                            “Mitigate” means to make something less severe or harmful. You’d use it in formal contexts like reducing risk, damage, or impact (e.g., “We mitigated the outage by adding retries.”).
                          </div>
                        </div>
                        <div className="rounded-lg border p-4">
                          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Multiple Choice</div>
                          <div className="font-medium">Question</div>
                          <div className="text-muted-foreground text-sm">Which sentence uses “mitigate” correctly?</div>
                          <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc pl-5">
                            <li>We added a cache to mitigate the impact of slow database queries.</li>
                            <li>We mitigated to the office after lunch.</li>
                            <li>The meeting mitigated for two hours.</li>
                            <li>I mitigated my coffee with sugar.</li>
                          </ul>
                          <Separator className="my-3" />
                          <div className="font-medium">Correct answer</div>
                          <div className="text-muted-foreground text-sm">We added a cache to mitigate the impact of slow database queries.</div>
                        </div>
                      </TabsContent>

                      <TabsContent value="programming" className="mt-3 space-y-3">
                        <div className="rounded-lg border p-4">
                          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Q/A</div>
                          <div className="font-medium">Question</div>
                          <div className="text-muted-foreground text-sm">What does <span className="font-mono">O(n)</span> mean in Big‑O notation?</div>
                          <Separator className="my-3" />
                          <div className="font-medium">Answer</div>
                          <div className="text-muted-foreground text-sm">
                            It means the runtime grows linearly with input size: if the input doubles, the work roughly doubles (e.g., scanning an array once).
                          </div>
                        </div>
                        <div className="rounded-lg border p-4">
                          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Multiple Choice</div>
                          <div className="font-medium">Question</div>
                          <div className="text-muted-foreground text-sm">Which operation is typically <span className="font-mono">O(log n)</span>?</div>
                          <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc pl-5">
                            <li>Linear search in an unsorted array</li>
                            <li>Binary search in a sorted array</li>
                            <li>Sorting an array (comparison sort)</li>
                            <li>Appending to the end of an array</li>
                          </ul>
                          <Separator className="my-3" />
                          <div className="font-medium">Correct answer</div>
                          <div className="text-muted-foreground text-sm">Binary search in a sorted array</div>
                        </div>
                      </TabsContent>

                      <TabsContent value="science-concepts" className="mt-3 space-y-3">
                        <div className="rounded-lg border p-4">
                          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Q/A</div>
                          <div className="font-medium">Question</div>
                          <div className="text-muted-foreground text-sm">What does Newton’s 2nd law (<span className="font-mono">F = m·a</span>) tell us?</div>
                          <Separator className="my-3" />
                          <div className="font-medium">Answer</div>
                          <div className="text-muted-foreground text-sm">Acceleration increases when force increases and decreases when mass increases. It connects how pushes/pulls change motion.</div>
                        </div>
                        <div className="rounded-lg border p-4">
                          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Multiple Choice</div>
                          <div className="font-medium">Question</div>
                          <div className="text-muted-foreground text-sm">According to Newton’s 2nd law (<span className="font-mono">F = m·a</span>), what happens to acceleration if force doubles and mass stays the same?</div>
                          <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc pl-5">
                            <li>Acceleration doubles</li>
                            <li>Acceleration halves</li>
                            <li>Acceleration stays the same</li>
                            <li>Acceleration becomes zero</li>
                          </ul>
                          <Separator className="my-3" />
                          <div className="font-medium">Correct answer</div>
                          <div className="text-muted-foreground text-sm">Acceleration doubles</div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                    3
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-xl">Review with spaced repetition (fresh questions every time)</CardTitle>
                    <CardDescription>
                      TCSRS schedules topics for review. When a topic is due, you’ll get a random card from that topic—so you practice the same knowledge in different ways across sessions.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-stretch">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 font-medium">
                      <CalendarClock className="h-4 w-4 text-primary" />
                      Pick a due topic
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">Only topics scheduled for today enter your review queue.</div>
                  </div>
                  <div className="hidden md:flex items-center justify-center text-muted-foreground">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 font-medium">
                      <Shuffle className="h-4 w-4 text-primary" />
                      Ask a random card
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">Within the topic, a random Q/A or multiple-choice card is selected.</div>
                  </div>
                  <div className="hidden md:flex items-center justify-center text-muted-foreground">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 font-medium">
                      <CircleCheck className="h-4 w-4 text-primary" />
                      Answer & grade
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">Your result updates that card/topic’s difficulty signal.</div>
                  </div>
                  <div className="hidden md:flex items-center justify-center text-muted-foreground">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 font-medium">
                      <Repeat2 className="h-4 w-4 text-primary" />
                      Schedule next review
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">Easier items reappear later; harder ones come back sooner.</div>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/40 p-4">
                  <div className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    Example spaced repetition timeline
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    {[
                      { label: 'Today', sub: 'Learn' },
                      { label: 'Tomorrow', sub: 'Quick review' },
                      { label: 'In 3 days', sub: 'Reinforce' },
                      { label: 'In 7 days', sub: 'Lock in' },
                    ].map((item) => (
                      <div key={item.label} className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-primary" />
                          <div className="text-sm font-medium">{item.label}</div>
                        </div>
                        <div className="text-xs text-muted-foreground ml-5">{item.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
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
