'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import Loading from '@/components/loading';
import { apiClient } from '@/lib/api-client';
import { Deck, Topic } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupInput, InputGroupButton } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import EmptyState from '@/components/empty-state';
import MarkdownRenderer from '@/components/markdown-renderer';

interface GeneratedCard {
  card_type: 'qa_hint' | 'multiple_choice';
  question: string;
  answer?: string;
  hint?: string;
  choices?: string[];
  correct_index?: number;
}

export default function DeckDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const deckId = params.id as string;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create Topic state
  const [topicName, setTopicName] = useState('');
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Prompt editing state
  const [editedPrompt, setEditedPrompt] = useState('');
  const [isUpdatingPrompt, setIsUpdatingPrompt] = useState(false);

  // Success message state
  const [successMessage, setSuccessMessage] = useState('');

  // Edit generated card state
  const [editingCardIndex, setEditingCardIndex] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<GeneratedCard | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && deckId) {
      fetchDeckAndTopics();
    }
  }, [user, deckId]);

  useEffect(() => {
    if (deck) {
      setEditedPrompt(deck.prompt);
    }
  }, [deck]);

  const fetchDeckAndTopics = async () => {
    try {
      setLoading(true);
      const [deckData, topicsData] = await Promise.all([
        apiClient.getDeck(deckId),
        apiClient.getTopicsByDeck(deckId),
      ]);
      setDeck(deckData);
      setTopics(topicsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load deck');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCards = async () => {
    if (!topicName.trim() || !deck) return;

    setIsGenerating(true);
    setError('');
    setGeneratedCards([]);

    try {
      const response = await apiClient.generateCards(deck.prompt, topicName);
      setGeneratedCards(response.cards);
    } catch (err: any) {
      setError(err.message || 'Failed to generate cards');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemoveCard = (index: number) => {
    setGeneratedCards(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditCard = (index: number) => {
    const card = generatedCards[index];
    setEditingCardIndex(index);
    setEditFormData({
      ...card,
      choices: card.choices ? [...card.choices] : undefined,
    });
    setEditDialogOpen(true);
  };

  const handleSaveEditedCard = () => {
    if (editingCardIndex !== null && editFormData) {
      // Validate multiple choice cards
      if (editFormData.card_type === 'multiple_choice') {
        const filteredChoices = editFormData.choices?.filter(c => c.trim()) || [];
        if (filteredChoices.length < 2) {
          setError('Multiple choice cards must have at least 2 choices');
          return;
        }
      }

      setGeneratedCards(prev => {
        const newCards = [...prev];
        newCards[editingCardIndex] = editFormData;
        return newCards;
      });
      handleCloseEditDialog();
    }
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingCardIndex(null);
    setEditFormData(null);
    setError('');
  };

  const updateEditChoice = (index: number, value: string) => {
    if (editFormData && editFormData.choices) {
      const newChoices = [...editFormData.choices];
      newChoices[index] = value;
      setEditFormData({ ...editFormData, choices: newChoices });
    }
  };

  const addEditChoice = () => {
    if (editFormData && editFormData.choices) {
      setEditFormData({ ...editFormData, choices: [...editFormData.choices, ''] });
    }
  };

  const removeEditChoice = (index: number) => {
    if (editFormData && editFormData.choices && editFormData.choices.length > 2) {
      const newChoices = editFormData.choices.filter((_, i) => i !== index);
      setEditFormData({
        ...editFormData,
        choices: newChoices,
        correct_index: (editFormData.correct_index || 0) >= newChoices.length ? 0 : editFormData.correct_index,
      });
    }
  };

  const handleAddTopic = async () => {
    if (!topicName.trim() || generatedCards.length === 0) return;

    setIsAdding(true);
    setError('');

    try {
      // Create the topic first
      const topic = await apiClient.createTopic({
        deck_id: deckId,
        name: topicName,
      });

      // Add all generated cards to the topic in batch
      await apiClient.addCardsBatchToTopic(topic.id, {
        cards: generatedCards.map(card => {
          if (card.card_type === 'qa_hint') {
            return {
              card_type: 'qa_hint',
              question: card.question,
              answer: card.answer || '',
              hint: card.hint || '',
            };
          } else {
            return {
              card_type: 'multiple_choice',
              question: card.question,
              choices: card.choices || [],
              correct_index: card.correct_index || 0,
            };
          }
        }),
      });

      // Reset form and refresh
      setTopicName('');
      setGeneratedCards([]);
      setSuccessMessage(`Topic "${topic.name}" created with ${generatedCards.length} cards!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchDeckAndTopics();
    } catch (err: any) {
      setError(err.message || 'Failed to add topic');
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdatePrompt = async () => {
    if (!editedPrompt.trim()) {
      setError('Prompt cannot be empty');
      return;
    }

    if (editedPrompt.length > 2000) {
      setError('Prompt must be 2000 characters or less');
      return;
    }

    setIsUpdatingPrompt(true);
    setError('');

    try {
      await apiClient.updateDeck(deckId, { prompt: editedPrompt });
      setSuccessMessage('Prompt updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchDeckAndTopics();
    } catch (err: any) {
      setError(err.message || 'Failed to update prompt');
    } finally {
      setIsUpdatingPrompt(false);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Are you sure you want to delete this topic? All cards will be deleted.')) {
      return;
    }

    try {
      await apiClient.deleteTopic(topicId);
      fetchDeckAndTopics();
    } catch (err: any) {
      setError(err.message || 'Failed to delete topic');
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
      return 'Due now';
    } else if (diffMins < 60) {
      return `Due in ${diffMins}m`;
    } else if (diffHours < 24) {
      return `Due in ${diffHours}h`;
    } else {
      return `Due in ${diffDays}d`;
    }
  };

  if (authLoading || !user) {
    return <Loading variant="page" />;
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{deck?.name || 'Deck'}</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <Loading variant="content" text="Loading deck..." />
      ) : (
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="create">Create Topic</TabsTrigger>
            <TabsTrigger value="prompt">Prompt</TabsTrigger>
            <TabsTrigger value="topics">Topics</TabsTrigger>
          </TabsList>

          {/* Create Topic Tab */}
          <TabsContent value="create" className="space-y-4">
            {successMessage && (
              <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <AlertDescription className="text-green-800 dark:text-green-200">{successMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <InputGroup>
                  <InputGroupInput
                    id="topicName"
                    value={topicName}
                    onChange={(e) => setTopicName(e.target.value)}
                    placeholder="e.g., Present Tense Verbs"
                    maxLength={255}
                    disabled={isGenerating || isAdding}
                  />
                  <InputGroupButton
                    type="button"
                    onClick={handleGenerateCards}
                    disabled={!topicName.trim() || isGenerating || isAdding || !deck?.prompt}
                  >
                    {isGenerating ? (
                      <>
                        <Loading variant="spinner" size="sm" className="mr-2" />
                        Generating...
                      </>
                    ) : (
                      'Generate Cards'
                    )}
                  </InputGroupButton>
                </InputGroup>
                {!deck?.prompt && (
                  <p className="text-sm text-muted-foreground">Please add a prompt in the Prompt tab first</p>
                )}
              </div>

              {/* Generated Cards Preview */}
              {generatedCards.length > 0 && (
                <div className="space-y-3">
                  <Label>Generated Cards ({generatedCards.length})</Label>
                  <div className="space-y-2 overflow-y-auto border rounded-md p-3">
                    {generatedCards.map((card, index) => (
                      <div
                        key={index}
                        className="bg-muted p-3 rounded-md relative"
                      >
                        <div className="absolute top-1 right-1 flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-muted-foreground hover:text-primary"
                            onClick={() => handleEditCard(index)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveCard(index)}
                          >
                            ×
                          </Button>
                        </div>
                        <div className="pr-16">
                          <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-primary/10 text-primary mb-2">
                            {card.card_type === 'qa_hint' ? 'Q&A' : 'Multiple Choice'}
                          </span>
                          <div className="text-sm">
                            <MarkdownRenderer content={card.question} />
                          </div>
                          {card.card_type === 'qa_hint' ? (
                            <div className="mt-1 text-sm text-muted-foreground space-y-1">
                              <div>
                                <strong>Answer:</strong>
                                <MarkdownRenderer content={card.answer || ''} />
                              </div>
                              {card.hint && (
                                <div>
                                  <strong>Hint:</strong>
                                  <MarkdownRenderer content={card.hint} />
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="mt-1 text-sm text-muted-foreground">
                              <p><strong>Choices:</strong></p>
                              <ul className="list-disc list-inside">
                                {card.choices?.map((choice, i) => (
                                  <li key={i} className={i === card.correct_index ? 'text-green-600 font-medium' : ''}>
                                    {choice} {i === card.correct_index && '✓'}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleAddTopic}
                    disabled={!topicName.trim() || generatedCards.length === 0 || isAdding}
                    className="w-full"
                  >
                    {isAdding ? 'Adding...' : `Add Topic with ${generatedCards.length} Cards`}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Prompt Tab */}
          <TabsContent value="prompt" className="space-y-4">
            {successMessage && (
              <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <AlertDescription className="text-green-800 dark:text-green-200">{successMessage}</AlertDescription>
              </Alert>
            )}

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
                  className="text-sm min-h-[200px]"
                  maxLength={2000}
                  disabled={isUpdatingPrompt}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    {editedPrompt?.length || 0}/2000 characters
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
                    editedPrompt.length > 2000 ||
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
          </TabsContent>

          {/* Topics Tab */}
          <TabsContent value="topics" className="space-y-4">
            {/* Deck-level Review Button */}
            {topics.length > 0 && (() => {
              const dueTopics = topics.filter(t => new Date(t.next_review) <= new Date());
              return dueTopics.length > 0 ? (
                <Button asChild className="mb-4">
                  <Link href={`/review/${deckId}`}>
                    Review Deck ({dueTopics.length} topic{dueTopics.length === 1 ? '' : 's'} due)
                  </Link>
                </Button>
              ) : (
                <Button disabled className="mb-4">
                  No Reviews Due
                </Button>
              );
            })()}

            {topics.length === 0 ? (
              <EmptyState
                title="No topics yet"
                description="Create your first topic to add flashcards"
                action={
                  <Button onClick={() => {
                    const tabsTrigger = document.querySelector('[value="create"]') as HTMLElement;
                    tabsTrigger?.click();
                  }}>Create Your First Topic</Button>
                }
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {topics.map((topic) => (
                  <Card key={topic.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle>{topic.name}</CardTitle>
                      <CardDescription>
                        Difficulty: {topic.difficulty.toFixed(1)} | {formatNextReview(topic.next_review)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button asChild className="w-full">
                        <Link href={`/topics/${topic.id}`}>View Cards</Link>
                      </Button>
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => handleDeleteTopic(topic.id)}
                      >
                        Delete
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Edit Generated Card Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={handleCloseEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Generated Card</DialogTitle>
            <DialogDescription>
              Make changes to this card before adding it to the topic
            </DialogDescription>
          </DialogHeader>
          {editFormData && (
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
                          onChange={(e) => updateEditChoice(index, e.target.value)}
                          placeholder={`Choice ${index + 1}`}
                          required
                        />
                        {(editFormData.choices?.length || 0) > 2 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeEditChoice(index)}
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
                      onClick={addEditChoice}
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
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEditDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditedCard}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
