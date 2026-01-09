'use client';

import { useEffect, use } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { DeckProvider, useDeck } from '@/contexts/deck-context';
import { AISettingsProvider } from '@/contexts/ai-settings-context';
import Loading from '@/components/loading';
import DeckHeader from '@/components/deck-header';
import { cn } from '@/lib/utils';

function DeckLayoutContent({ children, deckId }: { children: React.ReactNode; deckId: string }) {
  const { deck, loading } = useDeck();
  const pathname = usePathname();

  const tabs = [
    { value: 'create', label: 'Create Topic', href: `/decks/${deckId}/create` },
    { value: 'prompt', label: 'Prompt', href: `/decks/${deckId}/prompt` },
    { value: 'topics', label: 'Topics', href: `/decks/${deckId}/topics` },
  ];

  if (loading) {
    return <Loading variant="page" />;
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <DeckHeader />

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="bg-muted text-muted-foreground flex h-auto min-h-9 w-full items-center justify-center rounded-lg p-[3px]">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.value}
                href={tab.href}
                className={cn(
                  "inline-flex h-auto min-h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-xs sm:text-sm font-medium whitespace-normal sm:whitespace-nowrap text-center transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50",
                  isActive
                    ? "bg-background dark:text-foreground shadow-sm dark:border-input dark:bg-input/30"
                    : "text-foreground dark:text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Page Content */}
      <div>{children}</div>
    </div>
  );
}

export default function DeckLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { id } = use(params);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return <Loading variant="page" />;
  }

  return (
    <DeckProvider>
      <AISettingsProvider>
        <DeckLayoutContent deckId={id}>{children}</DeckLayoutContent>
      </AISettingsProvider>
    </DeckProvider>
  );
}
