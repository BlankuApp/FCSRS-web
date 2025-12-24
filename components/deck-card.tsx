'use client';

import Link from 'next/link';
import { Deck } from '@/lib/types';
import { Item, ItemContent, ItemTitle, ItemActions } from '@/components/ui/item';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface DeckCardProps {
    deck: Deck;
    onOpenSettings: (deck: Deck) => void;
}

export default function DeckCard({ deck, onOpenSettings }: DeckCardProps) {
    return (
        <Item variant="outline" className="hover:shadow-lg transition-all duration-200 group">
            <ItemContent className="flex-1">
                <ItemTitle className="pr-10">
                    <Link
                        href={`/decks/${deck.id}`}
                        className="hover:underline hover:text-primary transition-colors"
                    >
                        {deck.name}
                    </Link>
                </ItemTitle>
            </ItemContent>
            <ItemActions>
                <Button
                    variant="ghost"
                    size="icon"
                    title="Deck settings"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-accent hover:scale-110"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onOpenSettings(deck);
                    }}
                >
                    <Settings className="h-4 w-4" />
                </Button>
            </ItemActions>
        </Item>
    );
}
