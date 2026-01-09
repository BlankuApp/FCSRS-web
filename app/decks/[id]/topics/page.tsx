'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { useDeck } from '@/contexts/deck-context';
import { apiClient } from '@/lib/api-client';
import { Topic } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import EmptyState from '@/components/empty-state';
import Loading from '@/components/loading';

export default function TopicsPage() {
  const { deck, deckId } = useDeck();
  const router = useRouter();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingTopics, setIsFetchingTopics] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('topicsPageSize');
      return saved ? parseInt(saved) : 25;
    }
    return 25;
  });
  const [sortBy, setSortBy] = useState<'name' | 'difficulty' | 'next_review'>('next_review');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  useEffect(() => {
    if (deckId) {
      fetchTopics();
    }
  }, [deckId, currentPage, pageSize, sortBy, sortOrder]);

  const fetchTopics = async () => {
    try {
      // Show loading overlay for subsequent fetches
      if (topics.length > 0) {
        setIsFetchingTopics(true);
      } else {
        setLoading(true);
      }
      
      const topicsData = await apiClient.getTopicsByDeck(deckId, {
        page: currentPage,
        page_size: pageSize,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      
      setTopics(topicsData.items);
      setTotalPages(topicsData.total_pages);
      setHasNext(topicsData.has_next);
      setHasPrev(topicsData.has_prev);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load topics');
    } finally {
      setLoading(false);
      setIsFetchingTopics(false);
    }
  };

  const handleSortChange = (field: 'name' | 'difficulty' | 'next_review') => {
    if (sortBy === field) {
      // Toggle order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to asc
      setSortBy(field);
      setSortOrder('asc');
      setCurrentPage(1);
    }
  };

  const handlePageSizeChange = (newSize: string) => {
    const size = parseInt(newSize);
    setPageSize(size);
    setCurrentPage(1);
    if (typeof window !== 'undefined') {
      localStorage.setItem('topicsPageSize', size.toString());
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Are you sure you want to delete this topic? All cards will be deleted.')) {
      return;
    }

    try {
      await apiClient.deleteTopic(topicId);
      fetchTopics();
      toast.success('Topic deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete topic');
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

  if (loading) {
    return <Loading variant="content" text="Loading topics..." />;
  }

  return (
    <div className="space-y-4">
      {topics.length === 0 ? (
        <EmptyState
          title="No topics yet"
          description="Create your first topic to add flashcards"
          action={
            <Button onClick={() => router.push(`/decks/${deckId}/create`)}>
              Create Your First Topic
            </Button>
          }
        />
      ) : (
        <>
          {/* Topics Table */}
          <div className="rounded-md border overflow-x-auto relative">
            {isFetchingTopics && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-md">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            <Table className={isFetchingTopics ? 'opacity-50' : ''}>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSortChange('name')}
                  >
                    <div className="flex items-center gap-2">
                      Topic Name
                      {sortBy === 'name' && (
                        sortOrder === 'asc' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-center">Cards</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 transition-colors text-center"
                    onClick={() => handleSortChange('difficulty')}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Difficulty
                      {sortBy === 'difficulty' && (
                        sortOrder === 'asc' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSortChange('next_review')}
                  >
                    <div className="flex items-center gap-2">
                      Next Review
                      {sortBy === 'next_review' && (
                        sortOrder === 'asc' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topics.map((topic) => (
                  <TableRow key={topic.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">
                      <Link 
                        href={`/topics/${topic.id}`}
                        className="text-primary hover:underline"
                      >
                        {topic.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">
                      {topic.cards.length}
                    </TableCell>
                    <TableCell className="text-center">
                      {topic.difficulty.toFixed(1)}
                    </TableCell>
                    <TableCell>
                      {formatNextReview(topic.next_review)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTopic(topic.id)}
                        disabled={loading || isFetchingTopics}
                        className="h-8 w-8 p-0 hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete topic</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!hasPrev || loading || isFetchingTopics}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!hasNext || loading || isFetchingTopics}
                >
                  Next
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Items per page:</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={handlePageSizeChange}
                  disabled={loading || isFetchingTopics}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
