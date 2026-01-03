'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { UserInfo } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EditUserRoleDialogProps {
  user: UserInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function EditUserRoleDialog({ user, open, onOpenChange, onSuccess }: EditUserRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<'user' | 'pro' | 'admin'>('user');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset form when dialog opens with new user
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && user) {
      setSelectedRole(user.role);
      setError('');
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setSubmitting(true);
    setError('');

    try {
      const response = await apiClient.updateUserRole(user.id, selectedRole);
      toast.success('Role updated successfully', {
        description: 'User must re-login for changes to take effect.',
      });
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to update user role');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change the role for {user.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value as 'user' | 'pro' | 'admin')}
                disabled={submitting}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User (Free)</SelectItem>
                  <SelectItem value="pro">Pro (Premium)</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Role Permissions:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li><strong>User:</strong> Must provide own API keys for AI generation</li>
                <li><strong>Pro:</strong> Can use server-side AI API keys</li>
                <li><strong>Admin:</strong> Full access + user management</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
