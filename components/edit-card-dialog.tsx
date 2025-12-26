'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import Loading from '@/components/loading';
import { CardItem, CreateCardRequest, UpdateCardRequest, QAHintData, MultipleChoiceData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EditCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onDelete?: () => void;
  card: CardItem | null;
  cardIndex: number | null;
  topicId: string;
}

export default function EditCardDialog({
  open,
  onOpenChange,
  onSuccess,
  onDelete,
  card,
  cardIndex,
  topicId,
}: EditCardDialogProps) {
  const [cardType, setCardType] = useState<'qa_hint' | 'multiple_choice'>('qa_hint');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [qaFormData, setQaFormData] = useState({ question: '', answer: '', hint: '', intrinsic_weight: 1.0 });
  const [mcFormData, setMcFormData] = useState({ question: '', choices: ['', ''], correct_index: 0, intrinsic_weight: 1.0 });

  const isEditMode = card !== null && cardIndex !== null;

  // Initialize form when card changes
  useEffect(() => {
    if (card) {
      setCardType(card.card_type);
      
      if (card.card_type === 'qa_hint') {
        const data = card.card_data as QAHintData;
        setQaFormData({
          question: data.question,
          answer: data.answer,
          hint: data.hint || '',
          intrinsic_weight: card.intrinsic_weight,
        });
      } else {
        const data = card.card_data as MultipleChoiceData;
        setMcFormData({
          question: data.question,
          choices: [...data.choices],
          correct_index: data.correct_index,
          intrinsic_weight: card.intrinsic_weight,
        });
      }
    } else {
      // Reset for create mode
      setCardType('qa_hint');
      setQaFormData({ question: '', answer: '', hint: '', intrinsic_weight: 1.0 });
      setMcFormData({ question: '', choices: ['', ''], correct_index: 0, intrinsic_weight: 1.0 });
    }
  }, [card]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isEditMode) {
        // Update existing card
        let requestData: UpdateCardRequest;

        if (cardType === 'qa_hint') {
          requestData = {
            question: qaFormData.question,
            answer: qaFormData.answer,
            hint: qaFormData.hint || undefined,
            intrinsic_weight: qaFormData.intrinsic_weight,
          };
        } else {
          const filteredChoices = mcFormData.choices.filter(c => c.trim());
          if (filteredChoices.length < 2) {
            toast.error('Multiple choice cards must have at least 2 choices');
            setSubmitting(false);
            return;
          }
          
          requestData = {
            question: mcFormData.question,
            choices: filteredChoices,
            correct_index: mcFormData.correct_index,
            intrinsic_weight: mcFormData.intrinsic_weight,
          };
        }

        await apiClient.updateTopicCard(topicId, cardIndex!, requestData);
        toast.success('Card updated successfully');
      } else {
        // Create new card
        let requestData: CreateCardRequest;

        if (cardType === 'qa_hint') {
          requestData = {
            card_type: 'qa_hint',
            question: qaFormData.question,
            answer: qaFormData.answer,
            hint: qaFormData.hint || undefined,
            intrinsic_weight: qaFormData.intrinsic_weight,
          };
        } else {
          const filteredChoices = mcFormData.choices.filter(c => c.trim());
          if (filteredChoices.length < 2) {
            toast.error('Multiple choice cards must have at least 2 choices');
            setSubmitting(false);
            return;
          }
          
          requestData = {
            card_type: 'multiple_choice',
            question: mcFormData.question,
            choices: filteredChoices,
            correct_index: mcFormData.correct_index,
            intrinsic_weight: mcFormData.intrinsic_weight,
          };
        }

        await apiClient.addCardsBatchToTopic(topicId, {
          cards: [requestData],
        });
        toast.success('Card created successfully');
      }

      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || `Failed to ${isEditMode ? 'update' : 'create'} card`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode) return;
    if (!confirm('Are you sure you want to delete this card?')) return;

    setDeleting(true);
    try {
      await apiClient.deleteTopicCard(topicId, cardIndex!);
      toast.success('Card deleted successfully');
      onOpenChange(false);
      if (onDelete) {
        onDelete();
      } else {
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete card');
    } finally {
      setDeleting(false);
    }
  };

  const addChoice = () => {
    setMcFormData({ ...mcFormData, choices: [...mcFormData.choices, ''] });
  };

  const updateChoice = (index: number, value: string) => {
    const newChoices = [...mcFormData.choices];
    newChoices[index] = value;
    setMcFormData({ ...mcFormData, choices: newChoices });
  };

  const removeChoice = (index: number) => {
    if (mcFormData.choices.length <= 2) return;
    const newChoices = mcFormData.choices.filter((_, i) => i !== index);
    setMcFormData({ 
      ...mcFormData, 
      choices: newChoices,
      correct_index: mcFormData.correct_index >= newChoices.length ? 0 : mcFormData.correct_index
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Card' : 'Create New Card'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Update the flashcard details' : 'Add a new flashcard to this topic'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Card Type</Label>
              <Select 
                value={cardType} 
                onValueChange={(value: any) => setCardType(value)}
                disabled={isEditMode}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="qa_hint">Q&A with Hint</SelectItem>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {cardType === 'qa_hint' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="question">Question (Markdown supported)</Label>
                  <Textarea
                    id="question"
                    value={qaFormData.question}
                    onChange={(e) => setQaFormData({ ...qaFormData, question: e.target.value })}
                    placeholder="What is the capital of France?"
                    required
                    disabled={submitting || deleting}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="answer">Answer (Markdown supported)</Label>
                  <Textarea
                    id="answer"
                    value={qaFormData.answer}
                    onChange={(e) => setQaFormData({ ...qaFormData, answer: e.target.value })}
                    placeholder="Paris"
                    required
                    disabled={submitting || deleting}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hint">Hint (optional, Markdown supported)</Label>
                  <Textarea
                    id="hint"
                    value={qaFormData.hint}
                    onChange={(e) => setQaFormData({ ...qaFormData, hint: e.target.value })}
                    placeholder="It's a major European city"
                    disabled={submitting || deleting}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="intrinsic-weight">Intrinsic Weight (0.5 - 2.0)</Label>
                  <Input
                    id="intrinsic-weight"
                    type="number"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={qaFormData.intrinsic_weight}
                    onChange={(e) => setQaFormData({ ...qaFormData, intrinsic_weight: parseFloat(e.target.value) })}
                    disabled={submitting || deleting}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="mc-question">Question (Markdown supported)</Label>
                  <Textarea
                    id="mc-question"
                    value={mcFormData.question}
                    onChange={(e) => setMcFormData({ ...mcFormData, question: e.target.value })}
                    placeholder="What is the capital of France?"
                    required
                    disabled={submitting || deleting}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Choices (Markdown supported)</Label>
                  {mcFormData.choices.map((choice, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={choice}
                        onChange={(e) => updateChoice(index, e.target.value)}
                        placeholder={`Choice ${index + 1}`}
                        required
                        disabled={submitting || deleting}
                      />
                      {mcFormData.choices.length > 2 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeChoice(index)}
                          disabled={submitting || deleting}
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
                    disabled={submitting || deleting}
                  >
                    Add Choice
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correct">Correct Answer</Label>
                  <Select 
                    value={mcFormData.correct_index.toString()} 
                    onValueChange={(value) => setMcFormData({ ...mcFormData, correct_index: parseInt(value) })}
                    disabled={submitting || deleting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mcFormData.choices.map((_, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          Choice {index + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mc-intrinsic-weight">Intrinsic Weight (0.5 - 2.0)</Label>
                  <Input
                    id="mc-intrinsic-weight"
                    type="number"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={mcFormData.intrinsic_weight}
                    onChange={(e) => setMcFormData({ ...mcFormData, intrinsic_weight: parseFloat(e.target.value) })}
                    disabled={submitting || deleting}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter className="gap-2">
            {isEditMode && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={submitting || deleting}
              >
                {deleting ? (
                  <>
                    <Loading variant="spinner" size="sm" className="mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete Card'
                )}
              </Button>
            )}
            <Button type="submit" disabled={submitting || deleting}>
              {submitting ? (
                <>
                  <Loading variant="spinner" size="sm" className="mr-2" />
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditMode ? 'Update Card' : 'Create Card'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
