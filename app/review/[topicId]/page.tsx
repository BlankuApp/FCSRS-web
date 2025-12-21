'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api-client';
import { Topic, Card } from '@/lib/types';
import { Card as CardUI, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import MarkdownRenderer from '@/components/markdown-renderer';

export default function ReviewPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const topicId = params.topicId as string;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewComplete, setReviewComplete] = useState(false);
  const [nextReviewTime, setNextReviewTime] = useState('');
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && topicId) {
      loadReview();
    }
  }, [user, topicId]);

  const loadReview = async () => {
    try {
      setLoading(true);
      const [topicData, cardData] = await Promise.all([
        apiClient.getTopic(topicId),
        apiClient.getReviewCard(topicId),
      ]);
      setTopic(topicData);
      setCard(cardData);
      setShowHint(false);
      setShowAnswer(false);
      setSelectedChoice(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load review');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (baseScore: 0 | 1 | 2 | 3) => {
    setSubmitting(true);
    setError('');

    try {
      const response = await apiClient.submitReview(topicId, { base_score: baseScore });
      setNextReviewTime(response.next_review);
      setReviewComplete(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const formatReviewTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (authLoading || !user) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (reviewComplete) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <div className="mb-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">← Back to Dashboard</Link>
          </Button>
        </div>

        <CardUI className="mt-8">
          <CardHeader>
            <CardTitle>Review Complete!</CardTitle>
            <CardDescription>Your progress has been saved</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold mb-1">Topic:</p>
              <p>{topic?.name}</p>
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">Next Review:</p>
              <p>{formatReviewTime(nextReviewTime)}</p>
            </div>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/decks/${topic?.deck_id}`}>View Topics</Link>
              </Button>
            </div>
          </CardContent>
        </CardUI>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">← Back to Dashboard</Link>
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Review: {topic?.name}</h1>
        <p className="text-muted-foreground">
          Difficulty: {topic?.difficulty.toFixed(1)} | Stability: {Math.round(topic?.stability || 0)}h
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <p>Loading card...</p>
        </div>
      ) : !card ? (
        <Alert>
          <AlertDescription>No cards available for review in this topic.</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          <CardUI>
            <CardHeader>
              <CardTitle>Question</CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={card.question} />
            </CardContent>
          </CardUI>

          {card.card_type === 'qa_hint' && card.hint && !showAnswer && (
            <div>
              {!showHint ? (
                <Button variant="outline" onClick={() => setShowHint(true)}>
                  Show Hint
                </Button>
              ) : (
                <CardUI>
                  <CardHeader>
                    <CardTitle>Hint</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MarkdownRenderer content={card.hint} />
                  </CardContent>
                </CardUI>
              )}
            </div>
          )}

          {card.card_type === 'multiple_choice' && !showAnswer && (
            <CardUI>
              <CardHeader>
                <CardTitle>Choose your answer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {card.choices.map((choice, index) => (
                  <Button
                    key={index}
                    variant={selectedChoice === index ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setSelectedChoice(index)}
                  >
                    {index + 1}. <MarkdownRenderer content={choice} className="inline ml-2" />
                  </Button>
                ))}
              </CardContent>
            </CardUI>
          )}

          {!showAnswer && (
            <Button 
              onClick={() => setShowAnswer(true)} 
              className="w-full"
              disabled={card.card_type === 'multiple_choice' && selectedChoice === null}
            >
              Show Answer
            </Button>
          )}

          {showAnswer && (
            <>
              <CardUI>
                <CardHeader>
                  <CardTitle>Answer</CardTitle>
                </CardHeader>
                <CardContent>
                  {card.card_type === 'qa_hint' ? (
                    <MarkdownRenderer content={card.answer} />
                  ) : (
                    <div className="space-y-2">
                      {card.choices.map((choice, index) => (
                        <div 
                          key={index}
                          className={`p-3 rounded border ${
                            index === card.correct_index 
                              ? 'bg-green-50 border-green-500' 
                              : selectedChoice === index 
                              ? 'bg-red-50 border-red-500' 
                              : 'border-border'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="font-medium">{index + 1}.</span>
                            <MarkdownRenderer content={choice} className="flex-1" />
                            {index === card.correct_index && (
                              <span className="text-green-600 font-bold">✓</span>
                            )}
                            {selectedChoice === index && index !== card.correct_index && (
                              <span className="text-red-600 font-bold">✗</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </CardUI>

              <CardUI>
                <CardHeader>
                  <CardTitle>How well did you remember this?</CardTitle>
                  <CardDescription>Rate your recall to optimize future reviews</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <Button
                      variant="destructive"
                      onClick={() => handleSubmitReview(0)}
                      disabled={submitting}
                      className="h-20 flex flex-col"
                    >
                      <span className="font-bold">Again</span>
                      <span className="text-xs">Forgot</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleSubmitReview(1)}
                      disabled={submitting}
                      className="h-20 flex flex-col border-orange-500 hover:bg-orange-50"
                    >
                      <span className="font-bold">Hard</span>
                      <span className="text-xs">Difficult</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleSubmitReview(2)}
                      disabled={submitting}
                      className="h-20 flex flex-col border-blue-500 hover:bg-blue-50"
                    >
                      <span className="font-bold">Good</span>
                      <span className="text-xs">Normal</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleSubmitReview(3)}
                      disabled={submitting}
                      className="h-20 flex flex-col border-green-500 hover:bg-green-50"
                    >
                      <span className="font-bold">Easy</span>
                      <span className="text-xs">Effortless</span>
                    </Button>
                  </div>
                </CardContent>
              </CardUI>
            </>
          )}
        </div>
      )}
    </div>
  );
}
