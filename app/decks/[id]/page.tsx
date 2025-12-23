'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api-client';
import { Deck, Topic } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import EmptyState from '@/components/empty-state';

interface GeneratedCard {
  card_type: 'qa_hint' | 'multiple_choice';
  question: string;
  answer?: string;
  hint?: string;
  choices?: string[];
  correct_index?: number;
}

export default function DeckDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const deckId = params.id as string;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [topicName, setTopicName] = useState('');
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && deckId) {
      fetchDeckAndTopics();
    }
  }, [user, deckId]);

  const fetchDeckAndTopics = async () => {
    try {
      setLoading(true);
      const [deckData, topicsData] = await Promise.all([
        apiClient.getDeck(deckId),
        apiClient.getTopicsByDeck(deckId),
      ]);
      setDeck(deckData);
      setTopics(topicsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load deck');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCards = async () => {
    if (!topicName.trim() || !deck) return;

    setIsGenerating(true);
    setError('');
    setGeneratedCards([]);

    try {
      const response = await apiClient.generateCards(deck.prompt, topicName);
      setGeneratedCards(response.cards);
    } catch (err: any) {
      setError(err.message || 'Failed to generate cards');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemoveCard = (index: number) => {
    setGeneratedCards(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddTopic = async () => {
    if (!topicName.trim() || generatedCards.length === 0) return;

    setIsAdding(true);
    setError('');

    try {
      // Create the topic first
      const topic = await apiClient.createTopic({
        deck_id: deckId,
        name: topicName,
      });

      // Add all generated cards to the topic
      for (const card of generatedCards) {
        if (card.card_type === 'qa_hint') {
          await apiClient.createCard({
            topic_id: topic.id,
            card_type: 'qa_hint',
            question: card.question,
            answer: card.answer || '',
            hint: card.hint,
          });
        } else if (card.card_type === 'multiple_choice') {
          await apiClient.createCard({
            topic_id: topic.id,
            card_type: 'multiple_choice',
            question: card.question,
            choices: card.choices || [],
            correct_index: card.correct_index || 0,
          });
        }
      }

      // Reset dialog state and refresh
      setDialogOpen(false);
      setTopicName('');
      setGeneratedCards([]);
      fetchDeckAndTopics();
    } catch (err: any) {
      setError(err.message || 'Failed to add topic');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setTopicName('');
      setGeneratedCards([]);
      setError('');
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Are you sure you want to delete this topic? All cards will be deleted.')) {
      return;
    }

    try {
      await apiClient.deleteTopic(topicId);
      fetchDeckAndTopics();
    } catch (err: any) {
      setError(err.message || 'Failed to delete topic');
    }
  };

  const formatNextReview = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) {
      return 'Due now';
    } else if (diffMins < 60) {
      return `Due in ${diffMins}m`;
    } else if (diffHours < 24) {
      return `Due in ${diffHours}h`;
    } else {
      return `Due in ${diffDays}d`;
    }
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

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/decks">← Back to Decks</Link>
        </Button>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{deck?.name || 'Deck'}</h1>
          {deck?.prompt && (
            <p className="text-muted-foreground">{deck.prompt}</p>
          )}
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>Create Topic</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Topic</DialogTitle>
              <DialogDescription>
                Enter a topic name and generate AI-powered flashcards
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Topic Name Input */}
              <div className="space-y-2">
                <Label htmlFor="topicName">Topic Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="topicName"
                    value={topicName}
                    onChange={(e) => setTopicName(e.target.value)}
                    placeholder="e.g., Present Tense Verbs"
                    maxLength={255}
                    disabled={isGenerating || isAdding}
                  />
                  <Button
                    type="button"
                    onClick={handleGenerateCards}
                    disabled={!topicName.trim() || isGenerating || isAdding}
                  >
                    {isGenerating ? 'Generating...' : 'Generate Cards'}
                  </Button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Generated Cards Preview */}
              {generatedCards.length > 0 && (
                <div className="space-y-3">
                  <Label>Generated Cards ({generatedCards.length})</Label>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded-md p-3">
                    {generatedCards.map((card, index) => (
                      <div
                        key={index}
                        className="bg-muted p-3 rounded-md relative"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleRemoveCard(index)}
                        >
                          ×
                        </Button>
                        <div className="pr-6">
                          <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-primary/10 text-primary mb-2">
                            {card.card_type === 'qa_hint' ? 'Q&A' : 'Multiple Choice'}
                          </span>
                          <p className="font-medium text-sm">{card.question}</p>
                          {card.card_type === 'qa_hint' ? (
                            <div className="mt-1 text-sm text-muted-foreground">
                              <p><strong>Answer:</strong> {card.answer}</p>
                              {card.hint && <p><strong>Hint:</strong> {card.hint}</p>}
                            </div>
                          ) : (
                            <div className="mt-1 text-sm text-muted-foreground">
                              <p><strong>Choices:</strong></p>
                              <ul className="list-disc list-inside">
                                {card.choices?.map((choice, i) => (
                                  <li key={i} className={i === card.correct_index ? 'text-green-600 font-medium' : ''}>
                                    {choice} {i === card.correct_index && '✓'}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => handleDialogClose(false)}
                disabled={isAdding}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddTopic}
                disabled={!topicName.trim() || generatedCards.length === 0 || isAdding}
              >
                {isAdding ? 'Adding...' : `Add Topic with ${generatedCards.length} Cards`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && !dialogOpen && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <p>Loading topics...</p>
        </div>
      ) : topics.length === 0 ? (
        <EmptyState
          title="No topics yet"
          description="Create your first topic to add flashcards"
          action={
            <Button onClick={() => setDialogOpen(true)}>Create Your First Topic</Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <Card key={topic.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{topic.name}</CardTitle>
                <CardDescription>
                  Difficulty: {topic.difficulty.toFixed(1)} | {formatNextReview(topic.next_review)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild className="w-full">
                  <Link href={`/topics/${topic.id}`}>View Cards</Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                  disabled={new Date(topic.next_review) > new Date()}
                >
                  <Link href={`/review/${topic.id}`}>Review Now</Link>
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleDeleteTopic(topic.id)}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
