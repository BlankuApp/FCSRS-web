'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import Loading from '@/components/loading';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api-client';
import { Deck } from '@/lib/types';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/empty-state';
import CreateDeckDialog from '@/components/create-deck-dialog';
import { Item, ItemContent, ItemTitle, ItemDescription } from '@/components/ui/item';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function DecksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDeckId, setDeletingDeckId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchDecks();
    }
  }, [user]);

  const fetchDecks = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getDecks();
      setDecks(data);
    } catch (err: any) {
      console.error('Failed to load decks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDeck = async () => {
    if (!deletingDeckId) return;

    try {
      setIsDeleting(true);
      await apiClient.deleteDeck(deletingDeckId);
      toast.success('Deck deleted successfully');
      setDeleteDialogOpen(false);
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete deck');
    } finally {
      setIsDeleting(false);
      setDeletingDeckId(null);
    }
  };

  if (authLoading || !user) {
    return <Loading variant="page" />;
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Decks</h1>
          <p className="text-muted-foreground">Organize your flashcards into decks</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>Create Deck</Button>
      </div>

      <CreateDeckDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchDecks}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Deck?</DialogTitle>
            <DialogDescription>
              This will permanently delete the deck and all its topics and cards. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteDeck}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-lg border p-6 space-y-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 w-9" />
              </div>
            </div>
          ))}
        </div>
      ) : decks.length === 0 ? (
        <EmptyState
          title="No decks yet"
          description="Create your first deck to start organizing your flashcards"
          action={
            <Button onClick={() => setCreateDialogOpen(true)}>Create Your First Deck</Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <Item 
              key={deck.id} 
              variant="outline"
              className={isDeleting && deletingDeckId === deck.id ? 'opacity-50' : ''}
            >
              <ItemContent>
                <ItemTitle>
                  <div className="flex items-center justify-between gap-2">
                    <Link href={`/decks/${deck.id}`} className="flex-1 min-w-0">
                      {deck.name}
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        setDeletingDeckId(deck.id);
                        setDeleteDialogOpen(true);
                      }}
                      disabled={isDeleting && deletingDeckId === deck.id}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </ItemTitle>
                <ItemDescription>
                  Updated {deck.updated_at ? new Date(deck.updated_at).toLocaleDateString() : 'Recently'}
                </ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </div>
      )}
    </div>
  );
}
