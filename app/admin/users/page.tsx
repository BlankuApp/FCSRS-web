'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, Filter, Edit, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import Loading from '@/components/loading';
import EmptyState from '@/components/empty-state';
import EditUserRoleDialog from '@/components/edit-user-role-dialog';
import EditUserCreditsDialog from '@/components/edit-user-credits-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/lib/api-client';
import { UserInfo, UserListResponse } from '@/lib/types';

type SortField = 'email' | 'name' | 'role' | 'created_at';
type SortOrder = 'asc' | 'desc';

export default function AdminUsersPage() {
  const { user, loading: authLoading, role } = useAuth();
  const router = useRouter();
  
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [sortBy, setSortBy] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [roleFilter, setRoleFilter] = useState<'user' | 'pro' | 'admin' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  
  const [creditsDialogOpen, setCreditsDialogOpen] = useState(false);
  const [selectedUserForCredits, setSelectedUserForCredits] = useState<UserInfo | null>(null);

  // Auth and role check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (!authLoading && role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, authLoading, role, router]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    if (!user || role !== 'admin') return;

    try {
      setLoading(true);
      setError('');
      
      const params: any = {
        page: currentPage,
        page_size: 25,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      if (roleFilter !== 'all') {
        params.role = roleFilter;
      }

      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      const response: UserListResponse = await apiClient.listUsers(params);
      
      setUsers(response.items);
      setTotalPages(response.total_pages);
      setTotalUsers(response.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [user, role, currentPage, sortBy, sortOrder, roleFilter, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      // Toggle sort order if clicking same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with ascending order
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset to first page
  };

  const handleEditRole = (user: UserInfo) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleAddCredits = (user: UserInfo) => {
    setSelectedUserForCredits(user);
    setCreditsDialogOpen(true);
  };

  const handleRoleUpdateSuccess = () => {
    fetchUsers(); // Refresh the list
  };

  const handleCreditsUpdateSuccess = () => {
    fetchUsers(); // Refresh the list
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getSortIcon = (field: SortField) => {
    if (sortBy !== field) {
      return <ChevronsUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    );
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pro':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  if (authLoading || !user || role !== 'admin') {
    return <Loading variant="page" />;
  }

  return (
    <>
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-muted-foreground">
            View and manage user accounts and roles
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={roleFilter}
              onValueChange={(value) => {
                setRoleFilter(value as 'user' | 'pro' | 'admin' | 'all');
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Users Table */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            title="No users found"
            description={
              searchQuery || roleFilter !== 'all'
                ? "No users match your search criteria. Try adjusting your filters."
                : "No users in the system yet."
            }
          />
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button
                        onClick={() => handleSort('email')}
                        className="flex items-center font-medium hover:text-foreground"
                      >
                        Email
                        {getSortIcon('email')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('role')}
                        className="flex items-center font-medium hover:text-foreground"
                      >
                        Role
                        {getSortIcon('role')}
                      </button>
                    </TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleSort('created_at')}
                        className="flex items-center font-medium hover:text-foreground"
                      >
                        Created
                        {getSortIcon('created_at')}
                      </button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((userItem) => (
                    <TableRow key={userItem.id}>
                      <TableCell className="font-medium">{userItem.email}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                            userItem.role
                          )}`}
                        >
                          {userItem.role}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {userItem.credits !== null ? userItem.credits.toFixed(6) : 'N/A'}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {userItem.total_spent !== null ? userItem.total_spent.toFixed(6) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(userItem.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRole(userItem)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Role
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddCredits(userItem)}
                          >
                            <Coins className="h-4 w-4 mr-2" />
                            Add Credits
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing page {currentPage} of {totalPages} ({totalUsers} total users)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <EditUserRoleDialog
        user={selectedUser}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleRoleUpdateSuccess}
      />

      <EditUserCreditsDialog
        user={selectedUserForCredits}
        open={creditsDialogOpen}
        onOpenChange={setCreditsDialogOpen}
        onSuccess={handleCreditsUpdateSuccess}
      />
    </>
  );
}
