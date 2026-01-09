'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GeneratedCard {
  card_type: 'qa_hint' | 'multiple_choice';
  question: string;
  answer?: string;
  hint?: string;
  choices?: string[];
  correct_index?: number;
  explanation?: string;
}

interface EditGeneratedCardDialogProps {
  open: boolean;
  card: GeneratedCard | null;
  onClose: () => void;
  onSave: (card: GeneratedCard) => void;
}

export default function EditGeneratedCardDialog({ open, card, onClose, onSave }: EditGeneratedCardDialogProps) {
  const [editFormData, setEditFormData] = useState<GeneratedCard | null>(null);

  // Update form data when card changes
  useEffect(() => {
    if (card) {
      setEditFormData({
        ...card,
        choices: card.choices ? [...card.choices] : undefined,
      });
    }
  }, [card]);

  const handleSave = () => {
    if (!editFormData) return;

    // Validate multiple choice cards
    if (editFormData.card_type === 'multiple_choice') {
      const filteredChoices = editFormData.choices?.filter(c => c.trim()) || [];
      if (filteredChoices.length < 2) {
        toast.error('Multiple choice cards must have at least 2 choices');
        return;
      }
    }

    onSave(editFormData);
  };

  const updateChoice = (index: number, value: string) => {
    if (editFormData && editFormData.choices) {
      const newChoices = [...editFormData.choices];
      newChoices[index] = value;
      setEditFormData({ ...editFormData, choices: newChoices });
    }
  };

  const addChoice = () => {
    if (editFormData && editFormData.choices) {
      setEditFormData({ ...editFormData, choices: [...editFormData.choices, ''] });
    }
  };

  const removeChoice = (index: number) => {
    if (editFormData && editFormData.choices && editFormData.choices.length > 2) {
      const newChoices = editFormData.choices.filter((_, i) => i !== index);
      setEditFormData({
        ...editFormData,
        choices: newChoices,
        correct_index: (editFormData.correct_index || 0) >= newChoices.length ? 0 : editFormData.correct_index,
      });
    }
  };

  if (!card || !editFormData) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Generated Card</DialogTitle>
          <DialogDescription>
            Make changes to this card before adding it to the topic
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {editFormData.card_type === 'qa_hint' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="edit-question">Question (Markdown supported)</Label>
                <Textarea
                  id="edit-question"
                  value={editFormData.question}
                  onChange={(e) => setEditFormData({ ...editFormData, question: e.target.value })}
                  placeholder="What is the capital of France?"
                  required
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-answer">Answer (Markdown supported)</Label>
                <Textarea
                  id="edit-answer"
                  value={editFormData.answer || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, answer: e.target.value })}
                  placeholder="Paris"
                  required
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-hint">Hint (optional, Markdown supported)</Label>
                <Textarea
                  id="edit-hint"
                  value={editFormData.hint || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, hint: e.target.value })}
                  placeholder="It's a major European city"
                  rows={2}
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="edit-mc-question">Question (Markdown supported)</Label>
                <Textarea
                  id="edit-mc-question"
                  value={editFormData.question}
                  onChange={(e) => setEditFormData({ ...editFormData, question: e.target.value })}
                  placeholder="What is the capital of France?"
                  required
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Choices (Markdown supported)</Label>
                {editFormData.choices?.map((choice, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={choice}
                      onChange={(e) => updateChoice(index, e.target.value)}
                      placeholder={`Choice ${index + 1}`}
                      required
                    />
                    {(editFormData.choices?.length || 0) > 2 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeChoice(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addChoice}
                >
                  Add Choice
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-correct">Correct Answer</Label>
                <Select
                  value={(editFormData.correct_index || 0).toString()}
                  onValueChange={(value) => setEditFormData({ ...editFormData, correct_index: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {editFormData.choices?.map((_, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        Choice {index + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
