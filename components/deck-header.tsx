'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useDeck } from '@/contexts/deck-context';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Pencil, Trash2, Check, X, GraduationCap, Dumbbell, Plus } from 'lucide-react';

export default function DeckHeader() {
  const { deck, refreshDeck, deckId } = useDeck();
  const router = useRouter();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (deck) {
      setEditedName(deck.name);
    }
  }, [deck]);

  const handleUpdateDeckName = async () => {
    if (!editedName.trim()) {
      toast.error('Deck name cannot be empty');
      return;
    }

    if (editedName.length > 255) {
      toast.error('Deck name must be 255 characters or less');
      return;
    }

    if (editedName === deck?.name) {
      setIsEditingName(false);
      return;
    }

    setIsUpdatingName(true);

    try {
      await apiClient.updateDeck(deckId, { name: editedName });
      toast.success('Deck name updated successfully!');
      await refreshDeck();
      setIsEditingName(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update deck name');
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleCancelEditName = () => {
    setEditedName(deck?.name || '');
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUpdateDeckName();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEditName();
    }
  };

  const handleDeleteDeck = async () => {
    setIsDeleting(true);

    try {
      await apiClient.deleteDeck(deckId);
      toast.success('Deck deleted successfully');
      setDeleteDialogOpen(false);
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete deck');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        {isEditingName ? (
          <div className="flex items-center gap-2 mb-4">
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={handleNameKeyDown}
              placeholder="Deck name"
              maxLength={255}
              disabled={isUpdatingName}
              className="text-3xl font-bold h-auto py-1 px-2"
              autoFocus
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUpdateDeckName}
              disabled={!editedName.trim() || isUpdatingName}
              className="h-10 w-10 p-0"
              title="Save (Enter)"
            >
              {isUpdatingName ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Check className="h-5 w-5 text-green-600" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelEditName}
              disabled={isUpdatingName}
              className="h-10 w-10 p-0"
              title="Cancel (Escape)"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1 className="text-3xl font-bold">{deck?.name || 'Deck'}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                asChild 
                size="sm" 
                variant="outline" 
                className="gap-1.5 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                <Link href={`/review/${deckId}`}>
                  <GraduationCap className="h-4 w-4" />
                  <span className="hidden sm:inline">Review</span>
                </Link>
              </Button>
              <Button 
                asChild 
                size="sm" 
                variant="outline" 
                className="gap-1.5 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950"
              >
                <Link href={`/practice/${deckId}`}>
                  <Dumbbell className="h-4 w-4" />
                  <span className="hidden sm:inline">Practice</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingName(true)}
                className="gap-1.5 border-blue-100 dark:border-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950"
                title="Rename deck"
              >
                <Pencil className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isDeleting}
                className="gap-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                title="Delete deck"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Deck Confirmation Dialog */}
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
    </>
  );
}
