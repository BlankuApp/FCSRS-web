'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useDeck } from '@/contexts/deck-context';
import { useAISettings } from '@/contexts/ai-settings-context';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupInput, InputGroupButton } from '@/components/ui/input-group';
import Loading from '@/components/loading';
import AIProviderSettings from '@/components/ai-provider-settings';
import GeneratedCardsList from '@/components/generated-cards-list';
import EditGeneratedCardDialog from '@/components/edit-generated-card-dialog';

interface GeneratedCard {
  card_type: 'qa_hint' | 'multiple_choice';
  question: string;
  answer?: string;
  hint?: string;
  choices?: string[];
  correct_index?: number;
  explanation?: string;
}

export default function CreateTopicPage() {
  const { deck, deckId } = useDeck();
  const { role } = useAuth();
  const router = useRouter();
  const { selectedProvider, selectedModel, apiKey } = useAISettings();

  const [topicName, setTopicName] = useState('');
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [editingCardIndex, setEditingCardIndex] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const isPremiumUser = role === 'admin' || role === 'pro';

  // Redirect if no prompt
  useEffect(() => {
    if (deck && !deck.prompt) {
      toast.error('Please add a prompt first');
      router.push(`/decks/${deckId}/prompt`);
    }
  }, [deck, deckId, router]);

  const handleGenerateCards = async () => {
    if (!topicName.trim() || !deck) return;

    if (!isPremiumUser && !apiKey.trim()) {
      toast.error('Please enter your API key in the AI Settings');
      return;
    }

    setIsGenerating(true);
    setGeneratedCards([]);

    try {
      const response = await apiClient.generateCards(deck.prompt, topicName, {
        provider: selectedProvider,
        model: selectedModel,
        apiKey: apiKey,
      });
      setGeneratedCards(response.cards);
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate cards');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTopicNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && topicName.trim() && !isGenerating && !isAdding && deck?.prompt && (isPremiumUser || apiKey.trim())) {
      e.preventDefault();
      handleGenerateCards();
    }
  };

  const handleRemoveCard = (index: number) => {
    setGeneratedCards(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditCard = (index: number) => {
    setEditingCardIndex(index);
    setEditDialogOpen(true);
  };

  const handleSaveEditedCard = (card: GeneratedCard) => {
    if (editingCardIndex !== null) {
      setGeneratedCards(prev => {
        const newCards = [...prev];
        newCards[editingCardIndex] = card;
        return newCards;
      });
      handleCloseEditDialog();
    }
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingCardIndex(null);
  };

  const handleAddTopic = async () => {
    if (!topicName.trim() || generatedCards.length === 0) return;

    setIsAdding(true);

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
              explanation: card.explanation || '',
            };
          }
        }),
      });

      // Reset form and show success
      setTopicName('');
      setGeneratedCards([]);
      toast.success(`Topic "${topic.name}" created with ${generatedCards.length} cards!`);
      
      // Optionally navigate to topics page
      router.push(`/decks/${deckId}/topics`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to add topic');
    } finally {
      setIsAdding(false);
    }
  };

  if (!deck) {
    return <Loading variant="content" />;
  }

  return (
    <div className="space-y-4">
      {/* AI Settings Accordion */}
      <AIProviderSettings disabled={isGenerating || isAdding} />

      <div className="space-y-2">
        <InputGroup>
          <InputGroupInput
            id="topicName"
            value={topicName}
            onChange={(e) => setTopicName(e.target.value)}
            onKeyDown={handleTopicNameKeyDown}
            placeholder="e.g., Present Tense Verbs"
            maxLength={255}
            disabled={isGenerating || isAdding}
            autoComplete="off"
          />
          <InputGroupButton
            type="button"
            onClick={handleGenerateCards}
            disabled={!topicName.trim() || isGenerating || isAdding || !deck?.prompt || (!isPremiumUser && !apiKey.trim())}
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
          <GeneratedCardsList
            cards={generatedCards}
            onEdit={handleEditCard}
            onRemove={handleRemoveCard}
          />

          <Button
            onClick={handleAddTopic}
            disabled={!topicName.trim() || generatedCards.length === 0 || isAdding}
            className="w-full"
          >
            {isAdding ? 'Adding...' : `Add Topic with ${generatedCards.length} Cards`}
          </Button>
        </div>
      )}

      {/* Edit Generated Card Dialog */}
      <EditGeneratedCardDialog
        open={editDialogOpen}
        card={editingCardIndex !== null ? generatedCards[editingCardIndex] : null}
        onClose={handleCloseEditDialog}
        onSave={handleSaveEditedCard}
      />
    </div>
  );
}
