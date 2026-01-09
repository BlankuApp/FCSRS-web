'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { Deck } from '@/lib/types';
import { apiClient } from '@/lib/api-client';

interface DeckContextType {
  deck: Deck | null;
  loading: boolean;
  refreshDeck: () => Promise<void>;
  deckId: string;
}

const DeckContext = createContext<DeckContextType | undefined>(undefined);

export function DeckProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const deckId = params.id as string;
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshDeck = async () => {
    try {
      const deckData = await apiClient.getDeck(deckId);
      setDeck(deckData);
    } catch (err: any) {
      console.error('Failed to load deck:', err);
    }
  };

  useEffect(() => {
    if (deckId) {
      fetchDeck();
    }
  }, [deckId]);

  const fetchDeck = async () => {
    try {
      setLoading(true);
      await refreshDeck();
    } catch (err: any) {
      console.error('Failed to load deck:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DeckContext.Provider value={{ deck, loading, refreshDeck, deckId }}>
      {children}
    </DeckContext.Provider>
  );
}

export function useDeck() {
  const context = useContext(DeckContext);
  if (context === undefined) {
    throw new Error('useDeck must be used within a DeckProvider');
  }
  return context;
}
