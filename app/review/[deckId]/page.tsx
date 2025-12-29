'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Pencil, ExternalLink, Lightbulb, RotateCcw, Flame, ThumbsUp, Sparkles, Check, X, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import Loading from '@/components/loading';
import { apiClient } from '@/lib/api-client';
import { Deck, ReviewCardItem, DeckReviewResponse, QAHintData, MultipleChoiceData } from '@/lib/types';
import { Card as CardUI, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import MarkdownRenderer from '@/components/markdown-renderer';
import EditCardDialog from '@/components/edit-card-dialog';

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
  const [showAnswer, setShowAnswer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [reviewComplete, setReviewComplete] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentIndex]);


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
        setShowAnswer(false);
        setSelectedChoice(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch next batch');
    } finally {
      setFetching(false);
    }
  };

  const handleEditCard = () => {
    setEditDialogOpen(true);
  };

  const handleEditSuccess = async () => {
    // Refetch the current card's topic to get updated data
    try {
      const topicData = await apiClient.getTopic(currentCard.topic_id);
      const updatedCard = topicData.cards[currentCard.card_index];

      // Update the current card in the cards array
      setCards(prevCards => {
        const newCards = [...prevCards];
        newCards[currentIndex] = {
          ...newCards[currentIndex],
          card_type: updatedCard.card_type,
          card_data: updatedCard.card_data,
          intrinsic_weight: updatedCard.intrinsic_weight,
        };
        return shuffleMultipleChoiceCards(newCards);
      });

      // Reset view state
      setShowAnswer(false);
      setSelectedChoice(null);
    } catch (err: any) {
      setError(err.message || 'Failed to refresh card data');
    }
  };

  const handleEditDelete = async () => {
    // Move to next card or show completion
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
      setSelectedChoice(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const remainingDue = totalDue - cards.length;
      if (remainingDue > 0) {
        await fetchNextBatch();
      } else {
        setReviewComplete(true);
      }
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
        setShowAnswer(false);
        setSelectedChoice(null);
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
    return <Loading variant="page" />;
  }

  if (loading) {
    return <Loading variant="page" text="Loading review..." />;
  }

  if (reviewComplete) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
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
    <div className="container mx-auto p-2 md:p-4 max-w-3xl">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {fetching && (
        <Loading variant="inline" text="Loading next batch of cards..." className="mb-4" />
      )}

      <div className="mb-3 flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2">
          <Progress value={(totalReviewed / totalDue) * 100} className="h-1.5" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">{totalReviewed}/{totalDue}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleEditCard} className="h-7 px-2 text-xs gap-1">
            <Pencil className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs gap-1">
            <Link href={`/topics/${currentCard.topic_id}`}>
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Topic</span>
            </Link>
          </Button>
        </div>
      </div>

      <div>
        <CardContent className="space-y-4 md:px-0">
          {/* Question */}
          <div className="p-3 bg-secondary rounded-lg">
            <MarkdownRenderer content={currentCard.card_data.question} />
            
            {/* Hint (for QA cards only) */}
            {currentCard.card_type === 'qa_hint' && (currentCard.card_data as QAHintData).hint && !showAnswer && (
              <Accordion type="single" collapsible className="mt-3 border-t border-blue-200 dark:border-blue-800 pt-2">
                <AccordionItem value="hint" className="border-b-0">
                  <AccordionTrigger className="py-2 dark:text-blue-400 hover:no-underline">
                    <span className="font-semibold flex items-center gap-1.5"><Lightbulb className="h-4 w-4" /> Hint</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <MarkdownRenderer content={(currentCard.card_data as QAHintData).hint} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </div>

          {/* Multiple Choice Options */}
          {currentCard.card_type === 'multiple_choice' && !showAnswer && (
            <div className="space-y-2">
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
              className="w-full gap-2"
              disabled={currentCard.card_type === 'multiple_choice' && selectedChoice === null}
            >
              <Eye className="h-4 w-4" />
              Show Answer
            </Button>
          )}

          {/* Answer Display */}
          {showAnswer && (
            <>
              {currentCard.card_type === 'qa_hint' ? (
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <MarkdownRenderer content={(currentCard.card_data as QAHintData).answer} />
                </div>
              ) : (
                <div className="space-y-2">
                  {(currentCard.card_data as MultipleChoiceData).choices.map((choice, index) => {
                    const isCorrect = index === (currentCard.card_data as MultipleChoiceData).correct_index;
                    const isSelected = index === selectedChoice;

                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${isCorrect
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
                          {isCorrect && <Check className="h-4 w-4 text-green-600 dark:text-green-400" />}
                          {isSelected && !isCorrect && (
                            <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {(currentCard.card_data as MultipleChoiceData).explanation && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <MarkdownRenderer content={(currentCard.card_data as MultipleChoiceData).explanation} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Rating Buttons */}
              <div>
                <h3 className="font-semibold mb-2">How well did you remember?</h3>
                <div className="grid grid-cols-4 gap-1">
                  <Button
                    variant="outline"
                    className="h-auto py-2 px-2 flex flex-col items-center gap-1 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900 border-red-200 dark:border-red-800"
                    onClick={() => handleSubmitReview(0)}
                    disabled={submitting}
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span className="font-semibold hidden sm:inline">Again</span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">Forgot</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-2 px-2 flex flex-col items-center gap-1 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950 dark:hover:bg-orange-900 border-orange-200 dark:border-orange-800"
                    onClick={() => handleSubmitReview(1)}
                    disabled={submitting}
                  >
                    <Flame className="h-4 w-4" />
                    <span className="font-semibold hidden sm:inline">Hard</span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">Difficult</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-2 px-2 flex flex-col items-center gap-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 border-blue-200 dark:border-blue-800"
                    onClick={() => handleSubmitReview(2)}
                    disabled={submitting}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span className="font-semibold hidden sm:inline">Good</span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">Normal</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-2 px-2 flex flex-col items-center gap-1 bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900 border-green-200 dark:border-green-800"
                    onClick={() => handleSubmitReview(3)}
                    disabled={submitting}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="font-semibold hidden sm:inline">Easy</span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">Perfect</span>
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </div>

      <EditCardDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleEditSuccess}
        onDelete={handleEditDelete}
        card={currentCard ? { card_type: currentCard.card_type, card_data: currentCard.card_data, intrinsic_weight: currentCard.intrinsic_weight } : null}
        cardIndex={currentCard?.card_index ?? null}
        topicId={currentCard?.topic_id || ''}
      />
    </div>
  );
}
