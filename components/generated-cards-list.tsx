'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import MarkdownRenderer from '@/components/markdown-renderer';
import { Pencil, Trash2 } from 'lucide-react';

interface GeneratedCard {
  card_type: 'qa_hint' | 'multiple_choice';
  question: string;
  answer?: string;
  hint?: string;
  choices?: string[];
  correct_index?: number;
  explanation?: string;
}

interface GeneratedCardsListProps {
  cards: GeneratedCard[];
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
}

export default function GeneratedCardsList({ cards, onEdit, onRemove }: GeneratedCardsListProps) {
  if (cards.length === 0) return null;

  return (
    <div className="space-y-2 overflow-y-auto">
      <TooltipProvider>
        {cards.map((card, index) => (
          <Card
            key={index}
            className="bg-muted border-0 shadow-none py-3 gap-2"
          >
            <CardHeader className="px-3 py-0 gap-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-primary/10 text-primary mb-2">
                    {card.card_type === 'qa_hint' ? 'Q&A' : 'Multiple Choice'}
                  </span>
                  <div className="text-sm">
                    <MarkdownRenderer content={card.question} />
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-primary"
                        onClick={() => onEdit(index)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit card</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => onRemove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete card</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 py-0">
              {card.card_type === 'qa_hint' ? (
                <div className="text-sm text-muted-foreground space-y-1">
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
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Choices:</strong></p>
                  <ul className="list-disc list-inside">
                    {card.choices?.map((choice, i) => (
                      <li key={i} className={i === card.correct_index ? 'text-green-600 font-medium' : ''}>
                        {choice} {i === card.correct_index && '✓'}
                      </li>
                    ))}
                  </ul>
                  {card.explanation && (
                    <div>
                      <strong>Explanation:</strong>
                      <MarkdownRenderer content={card.explanation} />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </TooltipProvider>
    </div>
  );
}
