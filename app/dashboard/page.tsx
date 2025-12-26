'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpenIcon } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api-client';
import { Topic, Deck } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
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
        <div className="flex flex-col gap-4 max-w-2xl mx-auto">
          {deckGroups.map(({ deck, topics, dueCount }) => (
            <Item key={deck.id} variant="outline">
              <ItemMedia variant="icon">
                <BookOpenIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{deck.name}</ItemTitle>
                <ItemDescription>
                  {dueCount} topic{dueCount === 1 ? '' : 's'} due for review
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/review/${deck.id}`}>Review</Link>
                </Button>
              </ItemActions>
            </Item>
          ))}
        </div>
      )}
    </div>
  );
}
