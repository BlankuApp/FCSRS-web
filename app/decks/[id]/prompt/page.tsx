'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useDeck } from '@/contexts/deck-context';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Loading from '@/components/loading';

export default function PromptPage() {
  const { deck, deckId, refreshDeck } = useDeck();
  const [editedPrompt, setEditedPrompt] = useState('');
  const [isUpdatingPrompt, setIsUpdatingPrompt] = useState(false);

  useEffect(() => {
    if (deck) {
      setEditedPrompt(deck.prompt);
    }
  }, [deck]);

  const handleUpdatePrompt = async () => {
    if (!editedPrompt.trim()) {
      toast.error('Prompt cannot be empty');
      return;
    }

    if (editedPrompt.length > 4000) {
      toast.error('Prompt must be 4000 characters or less');
      return;
    }

    setIsUpdatingPrompt(true);

    try {
      await apiClient.updateDeck(deckId, { prompt: editedPrompt });
      toast.success('Prompt updated successfully!');
      await refreshDeck();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update prompt');
    } finally {
      setIsUpdatingPrompt(false);
    }
  };

  if (!deck) {
    return <Loading variant="content" />;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="prompt">Deck Prompt</Label>
        <p className="text-sm text-muted-foreground">
          This prompt will be used to generate flashcards for topics in this deck.
        </p>
        <Textarea
          id="prompt"
          value={editedPrompt}
          onChange={(e) => setEditedPrompt(e.target.value)}
          placeholder="e.g., You are a Spanish language tutor. Generate flashcards to help students learn..."
          className="text-sm min-h-[200px] font-mono"
          maxLength={4000}
          disabled={isUpdatingPrompt}
        />
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            {editedPrompt?.length || 0}/4000 characters
          </p>
          {!editedPrompt?.trim() && (
            <p className="text-xs text-destructive">Prompt cannot be empty</p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleUpdatePrompt}
          disabled={
            !editedPrompt?.trim() ||
            editedPrompt === deck?.prompt ||
            editedPrompt.length > 4000 ||
            isUpdatingPrompt
          }
        >
          {isUpdatingPrompt ? 'Saving...' : 'Save Prompt'}
        </Button>
        <Button
          variant="outline"
          onClick={() => setEditedPrompt(deck?.prompt || '')}
          disabled={isUpdatingPrompt || editedPrompt === deck?.prompt}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
