'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, BookOpen, Brain, Zap, ArrowRight, Check } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Show loading state during auth check
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!user) {
    return (
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
                Master Any Topic with{' '}
                <span className="text-primary">AI-Powered</span> Flashcards
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Your intelligent spaced repetition learning companion. Create custom flashcards with AI, 
                review with adaptive questions, and never face the same question twice.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/signup">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
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
            <h3 className="text-3xl font-bold mb-4">Powerful Features</h3>
            <p className="text-muted-foreground text-lg">
              Everything you need for effective, engaging learning
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Feature 1: AI-Generated Cards */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI-Generated Flashcards</CardTitle>
                <CardDescription>
                  Create flashcards instantly with custom AI prompts tailored to your learning style. 
                  Let AI do the heavy lifting while you focus on learning.
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
                  Organize your flashcards into decks and topics. Each topic can have its own 
                  custom prompt to generate targeted, relevant questions.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3: Spaced Repetition */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Smart Spaced Repetition</CardTitle>
                <CardDescription>
                  Built-in spaced repetition algorithm adapts to your learning pace. Review cards 
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
                <CardTitle>Always Fresh Questions</CardTitle>
                <CardDescription>
                  Every review session presents different questions for the same topic. 
                  Face new challenges each time and truly master your material.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 py-16 max-w-6xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">How It Works</h3>
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
              <h4 className="text-xl font-semibold">Generate Cards</h4>
              <p className="text-muted-foreground">
                Let AI automatically create flashcards based on your topics
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                4
              </div>
              <h4 className="text-xl font-semibold">Review & Learn</h4>
              <p className="text-muted-foreground">
                Study with adaptive questions that change every session
              </p>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center mt-16">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/signup">
                Start Learning Today <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    );
  }

  // Authenticated users will be redirected by useEffect
  return null;
}
