'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpenIcon, Dumbbell, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import Loading from '@/components/loading';
import { Skeleton } from '@/components/ui/skeleton';
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
import CreateDeckDialog from '@/components/create-deck-dialog';

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
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

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

      // Create deck groups for all decks
      const groups: DeckWithDueTopics[] = allDecks.map((deck) => {
        const topics = deckMap.get(deck.id) || [];
        return {
          deck,
          topics,
          dueCount: topics.length,
        };
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
    return <Loading variant="page" />;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-start mb-8 max-w-2xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Review your due topics by deck</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>Create Deck</Button>
      </div>

      <CreateDeckDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={(deck) => router.push(`/decks/${deck.id}`)}
      />

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-4 max-w-2xl mx-auto">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
              <Skeleton className="h-12 w-12 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-9 w-20" />
            </div>
          ))}
        </div>
      ) : deckGroups.length === 0 ? (
        <EmptyState
          title="No decks yet"
          description="Create your first deck to start learning with spaced repetition."
          action={
            <Button onClick={() => setCreateDialogOpen(true)}>
              Create Your First Deck
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-4 max-w-2xl mx-auto">
          {deckGroups.map(({ deck, topics, dueCount }) => (
            <Item key={deck.id} variant="outline">
              <ItemMedia variant="icon">
                <Link href={`/decks/${deck.id}`} className="p-2 -m-2 rounded-lg transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:scale-110 active:scale-95">
                  <BookOpenIcon />
                </Link>
              </ItemMedia>
              <ItemContent>
                <ItemTitle><Link href={`/decks/${deck.id}`}>{deck.name}</Link></ItemTitle>
                <ItemDescription>
                  {dueCount === 0 ? 'No topics due' : `${dueCount} topic${dueCount === 1 ? '' : 's'} due for review`}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button asChild size="sm" variant="outline" disabled={dueCount === 0} className="gap-1.5 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 disabled:opacity-50">
                  <Link href={`/review/${deck.id}`}>
                    <GraduationCap className="h-4 w-4" />
                    <span className="hidden sm:inline">Review</span>
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="gap-1.5 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950">
                  <Link href={`/practice/${deck.id}`}>
                    <Dumbbell className="h-4 w-4" />
                    <span className="hidden sm:inline">Practice</span>
                  </Link>
                </Button>
              </ItemActions>
            </Item>
          ))}
        </div>
      )}
    </div>
  );
}
