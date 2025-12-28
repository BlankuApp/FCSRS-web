'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { defaultPrompts } from '@/lib/default-prompts';
import Loading from '@/components/loading';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreateDeckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (deck: any) => void;
}

export default function CreateDeckDialog({ open, onOpenChange, onSuccess }: CreateDeckDialogProps) {
  const [formData, setFormData] = useState({ name: '', prompt: '' });
  const [selectedPromptId, setSelectedPromptId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handlePromptSelect = (promptId: string) => {
    setSelectedPromptId(promptId);
    const selectedPrompt = defaultPrompts.find(p => p.id === promptId);
    if (selectedPrompt) {
      setFormData(prev => ({ ...prev, prompt: selectedPrompt.content }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.prompt.trim()) {
      setError('Deck prompt is required');
      return;
    }
    
    setSubmitting(true);
    setError('');

    try {
      const newDeck = await apiClient.createDeck({
        name: formData.name,
        prompt: formData.prompt,
      });
      setFormData({ name: '', prompt: '' });
      setSelectedPromptId('');
      onOpenChange(false);
      onSuccess(newDeck);
    } catch (err: any) {
      setError(err.message || 'Failed to create deck');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({ name: '', prompt: '' });
      setSelectedPromptId('');
      setError('');
    }
    onOpenChange(open);
  };

  const selectedPrompt = defaultPrompts.find(p => p.id === selectedPromptId);

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

          <div className="space-y-3 py-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="name" className="shrink-0 w-28">Deck Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Spanish Vocabulary"
                required
                maxLength={255}
                disabled={submitting}
                className="flex-1"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <Label htmlFor="prompt-template" className="shrink-0 w-28">Template</Label>
                <Select
                  value={selectedPromptId}
                  onValueChange={handlePromptSelect}
                  disabled={submitting}
                >
                  <SelectTrigger id="prompt-template" className="flex-1">
                    <SelectValue placeholder="Select a template or start from scratch..." />
                  </SelectTrigger>
                  <SelectContent>
                    {defaultPrompts.map((prompt) => (
                      <SelectItem key={prompt.id} value={prompt.id}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{prompt.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedPrompt && selectedPrompt.id !== 'custom' && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                      IMPORTANT NOTICE
                    </p>
                    <p className="text-sm text-red-800 dark:text-red-200">
                      {selectedPrompt.description}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-sm font-medium">Deck Prompt</Label>
              <Textarea
                id="prompt"
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                placeholder="Enter the prompt that defines this deck..."
                className="min-h-[200px] max-h-[calc(90vh-400px)] w-full overflow-y-auto resize-none"
                required
                disabled={submitting}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loading variant="spinner" size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                'Create Deck'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
