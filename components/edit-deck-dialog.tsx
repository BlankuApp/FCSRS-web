'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Deck } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface EditDeckDialogProps {
  deck: Deck | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onDelete: (deckId: string) => Promise<void>;
}

export default function EditDeckDialog({ deck, open, onOpenChange, onSuccess, onDelete }: EditDeckDialogProps) {
  const [formData, setFormData] = useState({ name: '', prompt: '' });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (deck) {
      setFormData({ name: deck.name, prompt: deck.prompt });
    }
  }, [deck]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deck) return;
    
    if (!formData.prompt.trim()) {
      setError('Deck prompt is required');
      return;
    }
    
    setSubmitting(true);
    setError('');

    try {
      await apiClient.updateDeck(deck.id, {
        name: formData.name,
        prompt: formData.prompt,
      });
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to update deck');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deck) return;
    
    if (!confirm('Are you sure you want to delete this deck? All topics and cards will be deleted.')) {
      return;
    }

    setDeleting(true);
    setError('');

    try {
      await onDelete(deck.id);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to delete deck');
      setDeleting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setError('');
    }
    onOpenChange(open);
  };

  if (!deck) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl max-h-[100vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Deck</DialogTitle>
            <DialogDescription>Update your deck details</DialogDescription>
          </DialogHeader>
          
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Spanish Vocabulary"
                required
                maxLength={255}
                disabled={submitting || deleting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-prompt">Deck Prompt</Label>
              <Textarea
                id="edit-prompt"
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                placeholder="Enter the prompt that defines this deck..."
                className="min-h-[400px] max-h-[500px] overflow-y-auto resize-none"
                required
                disabled={submitting || deleting}
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting || deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Deck'}
            </Button>
            <Button type="submit" disabled={submitting || deleting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
