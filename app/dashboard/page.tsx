'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api-client';
import { Topic, Deck } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/empty-state';

interface DeckWithDueTopics {
  deck: Deck;
  topics: Topic[];
  dueCount: number;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [deckGroups, setDeckGroups] = useState<DeckWithDueTopics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchDueTopicsGroupedByDeck();
    }
  }, [user]);

  const fetchDueTopicsGroupedByDeck = async () => {
    try {
      setLoading(true);
      const [dueTopics, allDecks] = await Promise.all([
        apiClient.getDueTopics(),
        apiClient.getDecks(),
      ]);

      // Group topics by deck_id
      const deckMap = new Map<string, Topic[]>();
      dueTopics.forEach((topic) => {
        if (!deckMap.has(topic.deck_id)) {
          deckMap.set(topic.deck_id, []);
        }
        deckMap.get(topic.deck_id)!.push(topic);
      });

      // Create deck groups with due topics
      const groups: DeckWithDueTopics[] = [];
      deckMap.forEach((topics, deckId) => {
        const deck = allDecks.find((d) => d.id === deckId);
        if (deck) {
          groups.push({
            deck,
            topics,
            dueCount: topics.length,
          });
        }
      });

      // Sort by due count (descending)
      groups.sort((a, b) => b.dueCount - a.dueCount);

      setDeckGroups(groups);
    } catch (err: any) {
      setError(err.message || 'Failed to load due topics');
    } finally {
      setLoading(false);
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
      return 'Overdue';
    } else if (diffMins < 60) {
      return `${diffMins}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else {
      return `${diffDays}d`;
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
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Review your due topics by deck</p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <p>Loading topics...</p>
        </div>
      ) : deckGroups.length === 0 ? (
        <EmptyState
          title="No reviews due"
          description="You're all caught up! Create your first deck or wait for scheduled reviews."
          action={
            <Button asChild>
              <Link href="/decks">Go to Decks</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {deckGroups.map(({ deck, topics, dueCount }) => (
            <Card key={deck.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{deck.name}</CardTitle>
                    <CardDescription>
                      {dueCount} topic{dueCount === 1 ? '' : 's'} due for review
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Show first few topics */}
                <div className="space-y-2 text-sm">
                  {topics.slice(0, 3).map((topic) => (
                    <div key={topic.id} className="flex justify-between items-center p-2 bg-secondary rounded">
                      <span className="font-medium">{topic.name}</span>
                      <span
                        className={`text-xs ${
                          new Date(topic.next_review) < new Date()
                            ? 'text-destructive'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {formatNextReview(topic.next_review)}
                      </span>
                    </div>
                  ))}
                  {topics.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{topics.length - 3} more topic{topics.length - 3 === 1 ? '' : 's'}
                    </div>
                  )}
                </div>
                <Button asChild className="w-full">
                  <Link href={`/review/${deck.id}`}>Review Deck ({dueCount})</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
