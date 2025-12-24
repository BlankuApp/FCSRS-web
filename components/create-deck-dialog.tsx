'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CreateDeckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateDeckDialog({ open, onOpenChange, onSuccess }: CreateDeckDialogProps) {
  const [formData, setFormData] = useState({ name: '', prompt: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.prompt.trim()) {
      setError('Deck prompt is required');
      return;
    }
    
    setSubmitting(true);
    setError('');

    try {
      await apiClient.createDeck({
        name: formData.name,
        prompt: formData.prompt,
      });
      setFormData({ name: '', prompt: '' });
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create deck');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({ name: '', prompt: '' });
      setError('');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="min-w-[90vw] max-h-[90vh]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Deck</DialogTitle>
          </DialogHeader>
          
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Spanish Vocabulary"
                required
                maxLength={255}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt">Deck Prompt</Label>
              <Textarea
                id="prompt"
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                placeholder="Enter the prompt that defines this deck..."
                className="min-h-[calc(90vh-250px)] w-full overflow-y-auto resize-none"
                required
                disabled={submitting}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Deck'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
