'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api-client';
import { Deck, ReviewCardItem, DeckReviewResponse, QAHintData, MultipleChoiceData } from '@/lib/types';
import { Card as CardUI, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import MarkdownRenderer from '@/components/markdown-renderer';

export default function DeckReviewPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const deckId = params.deckId as string;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<ReviewCardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalDue, setTotalDue] = useState(0);
  const [totalReviewed, setTotalReviewed] = useState(0);
  const [reviewedPairs, setReviewedPairs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [reviewComplete, setReviewComplete] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && deckId) {
      loadDeckAndCards();
    }
  }, [user, deckId]);

  const shuffleMultipleChoiceCards = (cards: ReviewCardItem[]): ReviewCardItem[] => {
    return cards.map(card => {
      if (card.card_type === 'multiple_choice') {
        const mcData = card.card_data as MultipleChoiceData;
        const correctAnswer = mcData.choices[mcData.correct_index];
        
        // Create array of indices and shuffle them
        const indices = mcData.choices.map((_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        
        // Reorder choices based on shuffled indices
        const shuffledChoices = indices.map(i => mcData.choices[i]);
        const newCorrectIndex = shuffledChoices.indexOf(correctAnswer);
        
        return {
          ...card,
          card_data: {
            ...mcData,
            choices: shuffledChoices,
            correct_index: newCorrectIndex
          }
        };
      }
      return card;
    });
  };

  const loadDeckAndCards = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [deckData, reviewData] = await Promise.all([
        apiClient.getDeck(deckId),
        apiClient.getDeckReviewCards(deckId),
      ]);
      
      setDeck(deckData);
      
      if (reviewData.cards.length === 0) {
        setReviewComplete(true);
      } else {
        setCards(shuffleMultipleChoiceCards(reviewData.cards));
        setTotalDue(reviewData.total_due);
        setCurrentIndex(0);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load review');
    } finally {
      setLoading(false);
    }
  };

  const fetchNextBatch = async () => {
    try {
      setFetching(true);
      const reviewData = await apiClient.getDeckReviewCards(deckId);
      
      if (reviewData.cards.length === 0) {
        setReviewComplete(true);
      } else {
        setCards(shuffleMultipleChoiceCards(reviewData.cards));
        setTotalDue(reviewData.total_due);
        setCurrentIndex(0);
        setShowHint(false);
        setShowAnswer(false);
        setSelectedChoice(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch next batch');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmitReview = async (baseScore: 0 | 1 | 2 | 3) => {
    if (!cards[currentIndex]) return;

    const currentCard = cards[currentIndex];
    const pairKey = `${currentCard.topic_id}:${currentCard.card_index}`;
    
    // Skip if already reviewed in this session
    if (reviewedPairs.has(pairKey)) {
      // Move to next card silently
      if (currentIndex + 1 < cards.length) {
        setCurrentIndex(prev => prev + 1);
        setShowHint(false);
        setShowAnswer(false);
        setSelectedChoice(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const remainingDue = totalDue - cards.length;
        if (remainingDue > 0) {
          fetchNextBatch();
        } else {
          setReviewComplete(true);
        }
      }
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await apiClient.submitCardReview(currentCard.topic_id, currentCard.card_index, { base_score: baseScore });
      
      // Mark this pair as reviewed
      setReviewedPairs(prev => new Set(prev).add(pairKey));
      setTotalReviewed(prev => prev + 1);
      
      // Move to next card
      if (currentIndex + 1 < cards.length) {
        setCurrentIndex(prev => prev + 1);
        setShowHint(false);
        setShowAnswer(false);
        setSelectedChoice(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Finished current batch
        const remainingDue = totalDue - cards.length;
        if (remainingDue > 0) {
          // Automatically fetch next batch
          await fetchNextBatch();
        } else {
          // All done
          setReviewComplete(true);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const currentCard = cards[currentIndex];

  if (authLoading || !user) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <p>Loading review...</p>
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

        <CardUI>
          <CardHeader>
            <CardTitle>Review Complete! 🎉</CardTitle>
            <CardDescription>
              {totalReviewed === 0
                ? 'No cards due for review in this deck.'
                : `You've reviewed ${totalReviewed} card${totalReviewed === 1 ? '' : 's'} from ${deck?.name || 'this deck'}.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/dashboard">Return to Dashboard</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/decks/${deckId}`}>View Deck</Link>
              </Button>
            </div>
          </CardContent>
        </CardUI>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Alert>
          <AlertDescription>No card available for review.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 md:p-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {fetching && (
        <Alert className="mb-4">
          <AlertDescription>Loading next batch of cards...</AlertDescription>
        </Alert>
      )}

      <div>
        <CardContent className="space-y-4">
          {/* Question */}
          <div className="p-3 bg-secondary rounded-lg">
            <h3 className="font-semibold mb-2">Question:</h3>
            <MarkdownRenderer content={currentCard.card_data.question} />
          </div>

          {/* Hint (for QA cards only) */}
          {currentCard.card_type === 'qa_hint' && (currentCard.card_data as QAHintData).hint && !showAnswer && (
            <div>
              {!showHint ? (
                <Button variant="outline" size="sm" onClick={() => setShowHint(true)}>
                  Show Hint
                </Button>
              ) : (
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="font-semibold mb-2">Hint:</h3>
                  <MarkdownRenderer content={(currentCard.card_data as QAHintData).hint} />
                </div>
              )}
            </div>
          )}

          {/* Multiple Choice Options */}
          {currentCard.card_type === 'multiple_choice' && !showAnswer && (
            <div className="space-y-2">
              <h3 className="font-semibold">Choices:</h3>
              {(currentCard.card_data as MultipleChoiceData).choices.map((choice, index) => (
                <Button
                  key={index}
                  variant={selectedChoice === index ? 'default' : 'outline'}
                  className="w-full justify-start text-left h-auto py-3 px-4 whitespace-normal"
                  onClick={() => setSelectedChoice(index)}
                >
                  <div className="flex items-start gap-2 w-full">
                    <span className="font-semibold flex-shrink-0">{String.fromCharCode(65 + index)}.</span>
                    <div className="flex-1 break-words overflow-wrap-anywhere">
                      <MarkdownRenderer content={choice} />
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}

          {/* Show Answer Button */}
          {!showAnswer && (
            <Button
              onClick={() => setShowAnswer(true)}
              className="w-full"
              disabled={currentCard.card_type === 'multiple_choice' && selectedChoice === null}
            >
              Show Answer
            </Button>
          )}

          {/* Answer Display */}
          {showAnswer && (
            <>
              {currentCard.card_type === 'qa_hint' ? (
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold mb-2">Answer:</h3>
                  <MarkdownRenderer content={(currentCard.card_data as QAHintData).answer} />
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="font-semibold">Result:</h3>
                  {(currentCard.card_data as MultipleChoiceData).choices.map((choice, index) => {
                    const isCorrect = index === (currentCard.card_data as MultipleChoiceData).correct_index;
                    const isSelected = index === selectedChoice;

                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          isCorrect
                            ? 'bg-green-50 dark:bg-green-950 border-green-500'
                            : isSelected
                            ? 'bg-red-50 dark:bg-red-950 border-red-500'
                            : 'bg-secondary border-border'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="font-semibold">{String.fromCharCode(65 + index)}.</span>
                          <div className="flex-1">
                            <MarkdownRenderer content={choice} />
                          </div>
                          {isCorrect && <span className="text-green-600 dark:text-green-400">✓</span>}
                          {isSelected && !isCorrect && (
                            <span className="text-red-600 dark:text-red-400">✗</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Rating Buttons */}
              <div>
                <h3 className="font-semibold mb-2">How well did you remember?</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                  <Button
                    variant="outline"
                    className="h-auto py-2 px-2 flex flex-col items-center gap-1 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900 border-red-200 dark:border-red-800"
                    onClick={() => handleSubmitReview(0)}
                    disabled={submitting}
                  >
                    <span className="font-semibold">Again</span>
                    <span className="text-xs text-muted-foreground">Forgot</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-3 px-4 flex flex-col items-center gap-1 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950 dark:hover:bg-orange-900 border-orange-200 dark:border-orange-800"
                    onClick={() => handleSubmitReview(1)}
                    disabled={submitting}
                  >
                    <span className="font-semibold">Hard</span>
                    <span className="text-xs text-muted-foreground">Difficult</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-3 px-4 flex flex-col items-center gap-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 border-blue-200 dark:border-blue-800"
                    onClick={() => handleSubmitReview(2)}
                    disabled={submitting}
                  >
                    <span className="font-semibold">Good</span>
                    <span className="text-xs text-muted-foreground">Normal</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-3 px-4 flex flex-col items-center gap-1 bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900 border-green-200 dark:border-green-800"
                    onClick={() => handleSubmitReview(3)}
                    disabled={submitting}
                  >
                    <span className="font-semibold">Easy</span>
                    <span className="text-xs text-muted-foreground">Perfect</span>
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </div>
    </div>
  );
}
