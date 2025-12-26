'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Loading from '@/components/loading';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api-client';
import { Topic, CardItem, QAHintData, MultipleChoiceData } from '@/lib/types';
import { Card as CardUI, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import EmptyState from '@/components/empty-state';
import MarkdownRenderer from '@/components/markdown-renderer';
import EditCardDialog from '@/components/edit-card-dialog';

export default function TopicDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const topicId = params.id as string;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<{ card: CardItem; index: number } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && topicId) {
      fetchTopic();
    }
  }, [user, topicId]);

  const fetchTopic = async () => {
    try {
      setLoading(true);
      const topicData = await apiClient.getTopic(topicId);
      setTopic(topicData);
    } catch (err: any) {
      setError(err.message || 'Failed to load topic');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCard = (index: number, card: CardItem) => {
    setEditingCard({ card, index });
    setDialogOpen(true);
  };

  const handleCreateCard = () => {
    setEditingCard(null);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingCard(null);
    }
  };

  const handleSuccess = () => {
    fetchTopic();
  };

  if (authLoading || !user) {
    return <Loading variant="page" />;
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{topic?.name || 'Topic'}</h1>
          <p className="text-muted-foreground">
            Difficulty: {topic?.difficulty.toFixed(1)} | Stability: {Math.round(topic?.stability || 0)}h
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateCard}>Create Card</Button>
          </DialogTrigger>
        </Dialog>
        <EditCardDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          onSuccess={handleSuccess}
          card={editingCard?.card || null}
          cardIndex={editingCard?.index ?? null}
          topicId={topicId}
        />
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border p-6 space-y-4">
              <Skeleton className="h-5 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
          ))}
        </div>
      ) : !topic || topic.cards.length === 0 ? (
        <EmptyState
          title="No cards yet"
          description="Create your first flashcard for this topic"
          action={
            <Button onClick={handleCreateCard}>Create Your First Card</Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {topic.cards.map((card, index) => {
            const isQACard = card.card_type === 'qa_hint';
            const cardData = card.card_data as QAHintData | MultipleChoiceData;
            
            return (
              <CardUI key={`topic-${topicId}-card-${index}`} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {isQACard ? 'Q&A Card' : 'Multiple Choice Card'} (#{index + 1})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-1">Question:</p>
                    <MarkdownRenderer content={cardData.question} />
                  </div>
                  
                  {isQACard ? (
                    <>
                      <div>
                        <p className="text-sm font-semibold mb-1">Answer:</p>
                        <MarkdownRenderer content={(cardData as QAHintData).answer} />
                      </div>
                      {(cardData as QAHintData).hint && (
                        <div>
                          <p className="text-sm font-semibold mb-1">Hint:</p>
                          <MarkdownRenderer content={(cardData as QAHintData).hint} />
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm font-semibold mb-1">Choices:</p>
                        <ul className="list-decimal list-inside space-y-1">
                          {(cardData as MultipleChoiceData).choices.map((choice, choiceIndex) => (
                            <li 
                              key={choiceIndex} 
                              className={choiceIndex === (cardData as MultipleChoiceData).correct_index ? 'text-green-600 font-medium' : ''}
                            >
                              <MarkdownRenderer content={choice} className="inline" />
                              {choiceIndex === (cardData as MultipleChoiceData).correct_index && ' ✓'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                  
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">
                      Weight: {card.intrinsic_weight}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      size="sm"
                      onClick={() => handleEditCard(index, card)}
                    >
                      Edit Card
                    </Button>
                  </div>
                </CardContent>
              </CardUI>
            );
          })}
        </div>
      )}
    </div>
  );
}
