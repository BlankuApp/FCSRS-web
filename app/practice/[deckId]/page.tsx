'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import Loading from '@/components/loading';
import { apiClient } from '@/lib/api-client';
import { Deck, ReviewCardItem, DeckReviewResponse, QAHintData, MultipleChoiceData } from '@/lib/types';
import { Card as CardUI, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import MarkdownRenderer from '@/components/markdown-renderer';
import EditCardDialog from '@/components/edit-card-dialog';

export default function DeckPracticePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const deckId = params.deckId as string;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<ReviewCardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalPracticed, setTotalPracticed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [practiceComplete, setPracticeComplete] = useState(false);
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

      const [deckData, practiceData] = await Promise.all([
        apiClient.getDeck(deckId),
        apiClient.getDeckPracticeCards(deckId),
      ]);

      setDeck(deckData);

      if (practiceData.cards.length === 0) {
        setPracticeComplete(true);
      } else {
        setCards(shuffleMultipleChoiceCards(practiceData.cards));
        setCurrentIndex(0);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load practice cards');
    } finally {
      setLoading(false);
    }
  };

  const fetchNextBatch = async () => {
    try {
      setFetching(true);
      const practiceData = await apiClient.getDeckPracticeCards(deckId);

      if (practiceData.cards.length === 0) {
        setPracticeComplete(true);
      } else {
        setCards(shuffleMultipleChoiceCards(practiceData.cards));
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
      setShowHint(false);
      setSelectedChoice(null);
    } catch (err: any) {
      setError(err.message || 'Failed to refresh card data');
    }
  };

  const handleEditDelete = async () => {
    // Move to next card or show completion
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex(prev => prev + 1);
      setShowHint(false);
      setShowAnswer(false);
      setSelectedChoice(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Fetch next batch automatically
      await fetchNextBatch();
    }
  };

  const handleNextCard = () => {
    setTotalPracticed(prev => prev + 1);

    // Move to next card
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex(prev => prev + 1);
      setShowHint(false);
      setShowAnswer(false);
      setSelectedChoice(null);
    } else {
      // Finished current batch - fetch next batch automatically
      fetchNextBatch();
    }
  };

  const currentCard = cards[currentIndex];

  if (authLoading || !user) {
    return <Loading variant="page" />;
  }

  if (loading) {
    return <Loading variant="page" text="Loading practice cards..." />;
  }

  if (practiceComplete) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <CardUI>
          <CardHeader>
            <CardTitle>Practice Complete! 🎉</CardTitle>
            <CardDescription>
              {totalPracticed === 0
                ? 'No cards available for practice in this deck.'
                : `You've practiced ${totalPracticed} card${totalPracticed === 1 ? '' : 's'} from ${deck?.name || 'this deck'}.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={() => {
                setTotalPracticed(0);
                setPracticeComplete(false);
                loadDeckAndCards();
              }}>
                Practice Again
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard">Back to Dashboard</Link>
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
          <AlertDescription>No card available for practice.</AlertDescription>
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
          <Progress value={(currentIndex / cards.length) * 100} className="h-1.5" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">{currentIndex + 1}/{cards.length}</span>
        </div>
        <span className="text-xs text-muted-foreground">Practiced: {totalPracticed}</span>
        <Button variant="ghost" size="sm" onClick={handleEditCard} className="h-7 px-2 text-xs">
          Edit
        </Button>
      </div>

      <div>
        <CardContent className="space-y-4 md:px-0">
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

              {/* Next Card Button */}
              <Button
                onClick={handleNextCard}
                className="w-full"
              >
                Next Card
              </Button>
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
