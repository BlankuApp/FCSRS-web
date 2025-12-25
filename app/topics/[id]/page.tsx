'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api-client';
import { Topic, CardItem, CreateCardRequest, UpdateCardRequest, QAHintData, MultipleChoiceData } from '@/lib/types';
import { Card as CardUI, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmptyState from '@/components/empty-state';
import MarkdownRenderer from '@/components/markdown-renderer';

export default function TopicDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const topicId = params.id as string;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cardType, setCardType] = useState<'qa_hint' | 'multiple_choice'>('qa_hint');
  const [submitting, setSubmitting] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [qaFormData, setQaFormData] = useState({ question: '', answer: '', hint: '', intrinsic_weight: 1.0 });
  const [mcFormData, setMcFormData] = useState({ question: '', choices: ['', ''], correct_index: 0, intrinsic_weight: 1.0 });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && topicId) {
      fetchTopic();
    }
  }, [user, topicId]);

  const fetchTopic = async () => {
    try {
      setLoading(true);
      const topicData = await apiClient.getTopic(topicId);
      setTopic(topicData);
    } catch (err: any) {
      setError(err.message || 'Failed to load topic');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
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
        // Filter out empty choices
        const filteredChoices = mcFormData.choices.filter(c => c.trim());
        if (filteredChoices.length < 2) {
          setError('Multiple choice cards must have at least 2 choices');
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

      const updatedTopic = await apiClient.addCardsBatchToTopic(topicId, {
        cards: [requestData],
      });
      setTopic(updatedTopic);
      setDialogOpen(false);
      setQaFormData({ question: '', answer: '', hint: '', intrinsic_weight: 1.0 });
      setMcFormData({ question: '', choices: ['', ''], correct_index: 0, intrinsic_weight: 1.0 });
    } catch (err: any) {
      setError(err.message || 'Failed to create card');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIndex === null) return;
    
    setSubmitting(true);
    setError('');

    try {
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
          setError('Multiple choice cards must have at least 2 choices');
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

      const updatedTopic = await apiClient.updateTopicCard(topicId, editingIndex, requestData);
      setTopic(updatedTopic);
      setDialogOpen(false);
      setEditingIndex(null);
      setQaFormData({ question: '', answer: '', hint: '', intrinsic_weight: 1.0 });
      setMcFormData({ question: '', choices: ['', ''], correct_index: 0, intrinsic_weight: 1.0 });
    } catch (err: any) {
      setError(err.message || 'Failed to update card');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCard = async (index: number) => {
    if (!confirm('Are you sure you want to delete this card?')) {
      return;
    }

    try {
      const updatedTopic = await apiClient.deleteTopicCard(topicId, index);
      setTopic(updatedTopic);
    } catch (err: any) {
      setError(err.message || 'Failed to delete card');
    }
  };

  const handleEditCard = (index: number, card: CardItem) => {
    setEditingIndex(index);
    setCardType(card.card_type);
    
    if (card.card_type === 'qa_hint') {
      const data = card.card_data as QAHintData;
      setQaFormData({
        question: data.question,
        answer: data.answer,
        hint: data.hint,
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
    
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingIndex(null);
      setQaFormData({ question: '', answer: '', hint: '', intrinsic_weight: 1.0 });
      setMcFormData({ question: '', choices: ['', ''], correct_index: 0, intrinsic_weight: 1.0 });
      setError('');
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
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/decks/${topic?.deck_id}`}>← Back to Topics</Link>
        </Button>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{topic?.name || 'Topic'}</h1>
          <p className="text-muted-foreground">
            Difficulty: {topic?.difficulty.toFixed(1)} | Stability: {Math.round(topic?.stability || 0)}h
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>Create Card</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={editingIndex !== null ? handleUpdateCard : handleCreateCard}>
              <DialogHeader>
                <DialogTitle>{editingIndex !== null ? 'Edit Card' : 'Create New Card'}</DialogTitle>
                <DialogDescription>
                  {editingIndex !== null ? 'Update the flashcard details' : 'Add a new flashcard to this topic'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Card Type</Label>
                  <Select 
                    value={cardType} 
                    onValueChange={(value: any) => setCardType(value)}
                    disabled={editingIndex !== null}
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
                        disabled={submitting}
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
                        disabled={submitting}
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
                        disabled={submitting}
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
                        disabled={submitting}
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
                        disabled={submitting}
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
                            disabled={submitting}
                          />
                          {mcFormData.choices.length > 2 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeChoice(index)}
                              disabled={submitting}
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
                        disabled={submitting}
                      >
                        Add Choice
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="correct">Correct Answer</Label>
                      <Select 
                        value={mcFormData.correct_index.toString()} 
                        onValueChange={(value) => setMcFormData({ ...mcFormData, correct_index: parseInt(value) })}
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
                        disabled={submitting}
                      />
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (editingIndex !== null ? 'Updating...' : 'Creating...') : (editingIndex !== null ? 'Update Card' : 'Create Card')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <p>Loading cards...</p>
        </div>
      ) : !topic || topic.cards.length === 0 ? (
        <EmptyState
          title="No cards yet"
          description="Create your first flashcard for this topic"
          action={
            <Button onClick={() => setDialogOpen(true)}>Create Your First Card</Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {topic.cards.map((card, index) => {
            const isQACard = card.card_type === 'qa_hint';
            const cardData = card.card_data as QAHintData | MultipleChoiceData;
            
            return (
              <CardUI key={`topic-${topicId}-card-${index}`} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {isQACard ? 'Q&A Card' : 'Multiple Choice Card'} (#{index + 1})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-1">Question:</p>
                    <MarkdownRenderer content={cardData.question} />
                  </div>
                  
                  {isQACard ? (
                    <>
                      <div>
                        <p className="text-sm font-semibold mb-1">Answer:</p>
                        <MarkdownRenderer content={(cardData as QAHintData).answer} />
                      </div>
                      {(cardData as QAHintData).hint && (
                        <div>
                          <p className="text-sm font-semibold mb-1">Hint:</p>
                          <MarkdownRenderer content={(cardData as QAHintData).hint} />
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-sm font-semibold mb-1">Choices:</p>
                        <ul className="list-decimal list-inside space-y-1">
                          {(cardData as MultipleChoiceData).choices.map((choice, choiceIndex) => (
                            <li 
                              key={choiceIndex} 
                              className={choiceIndex === (cardData as MultipleChoiceData).correct_index ? 'text-green-600 font-medium' : ''}
                            >
                              <MarkdownRenderer content={choice} className="inline" />
                              {choiceIndex === (cardData as MultipleChoiceData).correct_index && ' ✓'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                  
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">
                      Weight: {card.intrinsic_weight}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      size="sm"
                      onClick={() => handleEditCard(index, card)}
                    >
                      Edit Card
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      size="sm"
                      onClick={() => handleDeleteCard(index)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </CardUI>
            );
          })}
        </div>
      )}
    </div>
  );
}
