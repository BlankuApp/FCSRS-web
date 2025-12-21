'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api-client';
import { Topic } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/empty-state';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchDueTopics();
    }
  }, [user]);

  const fetchDueTopics = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getDueTopics(10);
      setTopics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load due topics');
    } finally {
      setLoading(false);
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
      return 'Overdue';
    } else if (diffMins < 60) {
      return `${diffMins}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else {
      return `${diffDays}d`;
    }
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
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Review your due topics</p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <p>Loading topics...</p>
        </div>
      ) : topics.length === 0 ? (
        <EmptyState
          title="No reviews due"
          description="You're all caught up! Create your first deck or wait for scheduled reviews."
          action={
            <Button asChild>
              <Link href="/decks">Go to Decks</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {topics.map((topic) => (
            <Card key={topic.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{topic.name}</CardTitle>
                    <CardDescription>
                      Difficulty: {topic.difficulty.toFixed(1)} | Stability:{' '}
                      {Math.round(topic.stability)}h
                    </CardDescription>
                  </div>
                  <div className="text-sm">
                    <span
                      className={`font-medium ${
                        new Date(topic.next_review) < new Date()
                          ? 'text-destructive'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {formatNextReview(topic.next_review)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={`/review/${topic.id}`}>Start Review</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
