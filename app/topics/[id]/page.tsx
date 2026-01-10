'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, Trash2, Pencil, ArrowLeft, Check, X, Settings, Lock, Hash, DollarSign, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import Loading from '@/components/loading';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api-client';
import { Topic, Deck, CardItem, QAHintData, MultipleChoiceData, AIProvider } from '@/lib/types';
import { Card as CardUI, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import EmptyState from '@/components/empty-state';
import MarkdownRenderer from '@/components/markdown-renderer';
import EditCardDialog, { GeneratedCard } from '@/components/edit-card-dialog';
import { AI_PROVIDERS, DEFAULT_PROVIDER, getDefaultModel } from '@/lib/ai-providers';

export default function TopicDetailPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const topicId = params.id as string;

  const [topic, setTopic] = useState<Topic | null>(null);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeckLoading, setIsDeckLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Dialog states for existing cards
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<{ card: CardItem; index: number } | null>(null);
  
  // Generated cards states
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingGeneratedCardIndex, setEditingGeneratedCardIndex] = useState<number | null>(null);
  const [generatedCardDialogOpen, setGeneratedCardDialogOpen] = useState(false);
  
  const [tokenUsage, setTokenUsage] = useState<{
    input_tokens: number | null;
    output_tokens: number | null;
    total_tokens: number | null;
    cost_usd: number | null;
  } | null>(null);
  
  // Mode selection dialog state
  const [showModeDialog, setShowModeDialog] = useState(false);
  const [isAddingCards, setIsAddingCards] = useState(false);

  // Topic name editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  // Topic deletion state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // AI Provider state
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aiProvider');
      if (saved && saved in AI_PROVIDERS) {
        return saved as AIProvider;
      }
    }
    return DEFAULT_PROVIDER;
  });
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedProvider = localStorage.getItem('aiProvider') as AIProvider;
      const savedModel = localStorage.getItem('aiModel');
      if (savedProvider && savedModel) {
        const providerConfig = AI_PROVIDERS[savedProvider];
        if (providerConfig?.models.some(m => m.id === savedModel)) {
          return savedModel;
        }
      }
    }
    return getDefaultModel(DEFAULT_PROVIDER);
  });
  const [rememberApiKey, setRememberApiKey] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('rememberApiKey') === 'true';
    }
    return false;
  });
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      const remember = localStorage.getItem('rememberApiKey') === 'true';
      if (remember) {
        return localStorage.getItem('aiApiKey') || '';
      }
    }
    return '';
  });

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

  // Fetch deck when topic loads
  useEffect(() => {
    if (topic?.deck_id) {
      fetchDeck(topic.deck_id);
    }
  }, [topic?.deck_id]);

  // Sync edited name with topic name
  useEffect(() => {
    if (topic) {
      setEditedName(topic.name);
    }
  }, [topic]);

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

  const fetchDeck = async (deckId: string) => {
    try {
      setIsDeckLoading(true);
      const deckData = await apiClient.getDeck(deckId);
      setDeck(deckData);
    } catch (err: any) {
      // Silently fail - deck info is optional for display
      console.error('Failed to load deck:', err);
    } finally {
      setIsDeckLoading(false);
    }
  };

  // === Existing card handlers ===
  const handleEditCard = (index: number, card: CardItem) => {
    setEditingCard({ card, index });
    setDialogOpen(true);
  };

  const handleCreateCard = () => {
    setEditingCard(null);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingCard(null);
    }
  };

  const handleSuccess = () => {
    fetchTopic();
  };

  // === Generated cards handlers ===
  const isPremiumUser = role === 'admin' || role === 'pro';

  // Reset provider to default for premium users
  useEffect(() => {
    if (isPremiumUser && selectedProvider !== DEFAULT_PROVIDER) {
      setSelectedProvider(DEFAULT_PROVIDER);
      setSelectedModel(getDefaultModel(DEFAULT_PROVIDER));
    }
  }, [isPremiumUser, selectedProvider]);

  const handleGenerateCards = async () => {
    if (!topic || !deck?.prompt) return;

    if (!isPremiumUser && !apiKey.trim()) {
      toast.error('Please enter your API key in the AI Settings');
      return;
    }

    setIsGenerating(true);
    setGeneratedCards([]);
    setTokenUsage(null);

    try {
      const response = await apiClient.generateCards(deck.prompt, topic.name, {
        provider: selectedProvider,
        model: selectedModel,
        apiKey: apiKey,
      });
      setGeneratedCards(response.cards);
      setTokenUsage({
        input_tokens: response.input_tokens,
        output_tokens: response.output_tokens,
        total_tokens: response.total_tokens,
        cost_usd: response.cost_usd,
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate cards');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleProviderChange = (provider: AIProvider) => {
    setSelectedProvider(provider);
    const newModel = getDefaultModel(provider);
    setSelectedModel(newModel);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aiProvider', provider);
      localStorage.setItem('aiModel', newModel);
    }
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aiModel', model);
    }
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    if (typeof window !== 'undefined' && rememberApiKey) {
      localStorage.setItem('aiApiKey', value);
    }
  };

  const handleRememberApiKeyChange = (checked: boolean) => {
    setRememberApiKey(checked);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rememberApiKey', checked.toString());
      if (checked) {
        localStorage.setItem('aiApiKey', apiKey);
      } else {
        localStorage.removeItem('aiApiKey');
      }
    }
  };

  const handleRemoveGeneratedCard = (index: number) => {
    setGeneratedCards(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditGeneratedCard = (index: number) => {
    setEditingGeneratedCardIndex(index);
    setGeneratedCardDialogOpen(true);
  };

  const handleSaveGeneratedCard = (index: number, card: GeneratedCard) => {
    setGeneratedCards(prev => {
      const newCards = [...prev];
      newCards[index] = card;
      return newCards;
    });
  };

  const handleGeneratedCardDialogClose = (open: boolean) => {
    setGeneratedCardDialogOpen(open);
    if (!open) {
      setEditingGeneratedCardIndex(null);
    }
  };

  const handleShowModeDialog = () => {
    if (generatedCards.length === 0) return;
    setShowModeDialog(true);
  };

  const handleAddGeneratedCards = async (mode: 'append' | 'replace') => {
    if (generatedCards.length === 0) return;

    setIsAddingCards(true);

    try {
      await apiClient.addCardsBatchToTopic(topicId, {
        cards: generatedCards.map(card => {
          if (card.card_type === 'qa_hint') {
            return {
              card_type: 'qa_hint' as const,
              question: card.question,
              answer: card.answer || '',
              hint: card.hint || '',
            };
          } else {
            return {
              card_type: 'multiple_choice' as const,
              question: card.question,
              choices: card.choices || [],
              correct_index: card.correct_index || 0,
              explanation: card.explanation || '',
            };
          }
        }),
        mode,
      });

      const action = mode === 'replace' ? 'replaced with' : 'added';
      toast.success(`Cards ${action} successfully! (${generatedCards.length} cards)`);
      setGeneratedCards([]);
      setShowModeDialog(false);
      fetchTopic();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add cards');
    } finally {
      setIsAddingCards(false);
    }
  };

  // === Topic name editing handlers ===
  const handleUpdateTopicName = async () => {
    if (!editedName.trim()) {
      toast.error('Topic name cannot be empty');
      return;
    }

    if (editedName.length > 255) {
      toast.error('Topic name must be 255 characters or less');
      return;
    }

    if (editedName === topic?.name) {
      setIsEditingName(false);
      return;
    }

    setIsUpdatingName(true);

    try {
      await apiClient.updateTopic(topicId, { name: editedName });
      toast.success('Topic name updated successfully!');
      await fetchTopic();
      setIsEditingName(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update topic name');
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleCancelEditName = () => {
    setEditedName(topic?.name || '');
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUpdateTopicName();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEditName();
    }
  };

  // === Topic deletion handler ===
  const handleDeleteTopic = async () => {
    setIsDeleting(true);

    try {
      await apiClient.deleteTopic(topicId);
      toast.success('Topic deleted successfully');
      setDeleteDialogOpen(false);
      if (topic?.deck_id) {
        router.push(`/decks/${topic.deck_id}`);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete topic');
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading || !user) {
    return <Loading variant="page" />;
  }

  const currentGeneratedCard = editingGeneratedCardIndex !== null ? generatedCards[editingGeneratedCardIndex] : null;

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Back link */}
      {topic?.deck_id && (
        <Link 
          href={`/decks/${topic.deck_id}`} 
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Deck
        </Link>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          {isEditingName ? (
            <div className="flex items-center gap-2 mb-2">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={handleNameKeyDown}
                placeholder="Topic name"
                maxLength={255}
                disabled={isUpdatingName}
                className="text-3xl font-bold h-auto py-1 px-2"
                autoFocus
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUpdateTopicName}
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
            <div className="flex items-center gap-2 group mb-2">
              <h1 className="text-3xl font-bold">{topic?.name || 'Topic'}</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingName(true)}
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Rename topic"
              >
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isDeleting}
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                title="Delete topic"
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          )}
          <p className="text-muted-foreground">
            Difficulty: {topic?.difficulty.toFixed(1)} | Stability: {Math.round(topic?.stability || 0)}h
          </p>
        </div>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="outline"
                    onClick={handleGenerateCards}
                    disabled={isGenerating || isDeckLoading || !deck?.prompt || (!isPremiumUser && !apiKey.trim())}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : isDeckLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Regenerate Cards
                      </>
                    )}
                  </Button>
                </span>
              </TooltipTrigger>
              {!isDeckLoading && !deck?.prompt && (
                <TooltipContent>
                  <p>Deck prompt is required for card generation</p>
                </TooltipContent>
              )}
              {!isPremiumUser && !isDeckLoading && deck?.prompt && !apiKey.trim() && (
                <TooltipContent>
                  <p>API key required - configure in AI Settings below</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <Button onClick={handleCreateCard}>
            <Plus className="h-4 w-4 mr-2" />
            Create Card
          </Button>
        </div>
      </div>

      {/* AI Settings Accordion */}
      <Accordion type="single" collapsible className="w-full mb-6">
        <AccordionItem value="ai-settings" className="border rounded-xl bg-muted/30 px-4">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary/10">
                <Settings className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-sm font-medium">AI Settings</span>
                {!isPremiumUser && !apiKey.trim() ? (
                  <span className="text-xs text-destructive">API key required</span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {AI_PROVIDERS[selectedProvider].displayName} · {AI_PROVIDERS[selectedProvider].models.find(m => m.id === selectedModel)?.name || selectedModel}
                  </span>
                )}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-3 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={selectedProvider}
                  onValueChange={(value) => handleProviderChange(value as AIProvider)}
                  disabled={isGenerating}
                >
                  <SelectTrigger id="provider" className="w-auto min-w-[120px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(AI_PROVIDERS) as AIProvider[]).map((provider) => (
                      <SelectItem 
                        key={provider} 
                        value={provider} 
                        className="text-xs"
                        disabled={isPremiumUser && provider !== DEFAULT_PROVIDER}
                      >
                        {AI_PROVIDERS[provider].displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedModel}
                  onValueChange={handleModelChange}
                  disabled={isGenerating}
                >
                  <SelectTrigger id="model" className="w-auto min-w-[140px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AI_PROVIDERS[selectedProvider].models.map((model) => (
                      <SelectItem key={model.id} value={model.id} className="text-xs">
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {!isPremiumUser && (
                <>
                  <div className="flex items-center gap-2">
                    <Input
                      id="apiKey"
                      type="text"
                      value={apiKey}
                      onChange={(e) => handleApiKeyChange(e.target.value)}
                      placeholder={`${AI_PROVIDERS[selectedProvider].displayName} API key`}
                      disabled={isGenerating}
                      autoComplete="on"
                      className="h-8 text-xs flex-1"
                    />
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Checkbox
                        id="rememberApiKey"
                        checked={rememberApiKey}
                        onCheckedChange={handleRememberApiKeyChange}
                        disabled={isGenerating}
                        className="h-3.5 w-3.5"
                      />
                      <Label
                        htmlFor="rememberApiKey"
                        className="text-[11px] cursor-pointer flex items-center gap-1 m-0"
                      >
                        <Lock className="h-3 w-3" />
                        Remember
                      </Label>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    Your API key is stored locally and never sent to our servers.
                  </p>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Prompt missing warning */}
      {!isDeckLoading && deck && !deck.prompt && (
        <Alert className="mb-6">
          <AlertDescription>
            Card regeneration requires a deck prompt.{' '}
            <Link href={`/decks/${deck.id}`} className="text-primary hover:underline font-medium">
              Set up the prompt in deck settings →
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Generated Cards Preview */}
      {generatedCards.length > 0 && (
        <div className="space-y-3 mb-8">
          {/* Token Usage and Cost Information */}
          {tokenUsage && (tokenUsage.total_tokens !== null || tokenUsage.cost_usd !== null) && (
            <div className="rounded-md border border-border bg-muted/30 px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                {tokenUsage.total_tokens !== null && (
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Total tokens:</span>
                    <span className="font-medium">{tokenUsage.total_tokens.toLocaleString()}</span>
                  </div>
                )}
                {tokenUsage.cost_usd !== null && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Cost:</span>
                    <span className="font-medium">${tokenUsage.cost_usd.toFixed(6)} USD</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <Label>Generated Cards ({generatedCards.length})</Label>
          <div className="space-y-2 overflow-y-auto border rounded-md p-3 max-h-[500px]">
            <TooltipProvider>
              {generatedCards.map((card, index) => (
                <CardUI
                  key={index}
                  className="bg-muted border-0 shadow-none py-3 gap-2"
                >
                  <CardHeader className="px-3 py-0 gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-primary/10 text-primary mb-2">
                          {card.card_type === 'qa_hint' ? 'Q&A' : 'Multiple Choice'}
                        </span>
                        <div className="text-sm font-medium">
                          <MarkdownRenderer content={card.question} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditGeneratedCard(index)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit card</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit card</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:text-destructive"
                              onClick={() => handleRemoveGeneratedCard(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove card</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Remove card</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 py-0">
                    {card.card_type === 'qa_hint' ? (
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div><span className="font-medium">Answer:</span> <MarkdownRenderer content={card.answer || ''} className="inline" /></div>
                        {card.hint && (
                          <div><span className="font-medium">Hint:</span> <MarkdownRenderer content={card.hint} className="inline" /></div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        <div className="font-medium mb-1">Choices:</div>
                        <ul className="list-decimal list-inside space-y-0.5">
                          {card.choices?.map((choice, choiceIndex) => (
                            <li key={choiceIndex} className={choiceIndex === card.correct_index ? 'text-green-600 font-medium' : ''}>
                              {choice} {choiceIndex === card.correct_index && '✓'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </CardUI>
              ))}
            </TooltipProvider>
          </div>

          <Button
            onClick={handleShowModeDialog}
            disabled={generatedCards.length === 0 || isAddingCards}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add {generatedCards.length} Cards to Topic
          </Button>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border p-6 space-y-4">
              <Skeleton className="h-5 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
          ))}
        </div>
      ) : !topic || topic.cards.length === 0 ? (
        generatedCards.length === 0 && (
          <EmptyState
            title="No cards yet"
            description="Create your first flashcard for this topic or regenerate cards using AI"
            action={
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleGenerateCards} disabled={isGenerating || !deck?.prompt}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Regenerate Cards
                    </>
                  )}
                </Button>
                <Button onClick={handleCreateCard}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Card Manually
                </Button>
              </div>
            }
          />
        )
      ) : (
        <div className="space-y-4">
          <Label>Existing Cards ({topic.cards.length})</Label>
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
                        {(cardData as MultipleChoiceData).explanation && (
                          <div>
                            <p className="text-sm font-semibold mb-1">Explanation:</p>
                            <MarkdownRenderer content={(cardData as MultipleChoiceData).explanation} />
                          </div>
                        )}
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
                        className="w-full"
                        size="sm"
                        onClick={() => handleEditCard(index, card)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit or Remove Card
                      </Button>
                    </div>
                  </CardContent>
                </CardUI>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit existing card dialog */}
      <EditCardDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSuccess={handleSuccess}
        card={editingCard?.card || null}
        cardIndex={editingCard?.index ?? null}
        topicId={topicId}
      />

      {/* Edit generated card dialog */}
      <EditCardDialog
        open={generatedCardDialogOpen}
        onOpenChange={handleGeneratedCardDialogClose}
        onSuccess={() => {}}
        card={null}
        cardIndex={null}
        topicId={topicId}
        generatedCard={currentGeneratedCard}
        generatedCardIndex={editingGeneratedCardIndex}
        onSaveGenerated={handleSaveGeneratedCard}
      />

      {/* Mode selection dialog */}
      <Dialog open={showModeDialog} onOpenChange={setShowModeDialog}>
        <DialogContent className="sm:max-w-md max-w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Add Generated Cards</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              How would you like to add the {generatedCards.length} generated card{generatedCards.length !== 1 ? 's' : ''} to this topic?
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 sm:gap-3 py-2 sm:py-4">
            <Button
              variant="outline"
              onClick={() => handleAddGeneratedCards('append')}
              disabled={isAddingCards}
              className="justify-start h-auto py-2 sm:py-3 px-3 sm:px-4"
            >
              <div className="text-left w-full">
                <p className="font-medium text-sm sm:text-base">Append to existing cards</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Keep {topic?.cards.length || 0} + add {generatedCards.length} new
                </p>
              </div>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleAddGeneratedCards('replace')}
              disabled={isAddingCards}
              className="justify-start h-auto py-2 sm:py-3 px-3 sm:px-4"
            >
              <div className="text-left w-full">
                <p className="font-medium text-sm sm:text-base">Replace all cards</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Remove existing, use only {generatedCards.length} new
                </p>
              </div>
            </Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowModeDialog(false)} disabled={isAddingCards} className="text-sm">
              Cancel
            </Button>
          </DialogFooter>
          {isAddingCards && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-lg">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Topic Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Topic?</DialogTitle>
            <DialogDescription>
              This will permanently delete the topic &quot;{topic?.name}&quot; and all its cards. This action cannot be undone.
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
              onClick={handleDeleteTopic}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
