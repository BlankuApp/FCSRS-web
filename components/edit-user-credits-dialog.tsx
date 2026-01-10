'use client';

import { useState } from 'react';
import { AlertTriangle, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { UserInfo } from '@/lib/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EditUserCreditsDialogProps {
  user: UserInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function EditUserCreditsDialog({ user, open, onOpenChange, onSuccess }: EditUserCreditsDialogProps) {
  const [creditsAmount, setCreditsAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset form when dialog opens with new user
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && user) {
      setCreditsAmount('');
      setError('');
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const credits = parseFloat(creditsAmount);
    if (isNaN(credits) || credits <= 0) {
      setError('Please enter a valid positive number');
      return;
    }
    
    setSubmitting(true);
    setError('');

    try {
      const response = await apiClient.addCredits(user.id, credits);
      toast.success('Credits added successfully', {
        description: `New balance: ${response.credits.toFixed(6)} credits`,
      });
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to add credits');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  const currentCredits = user.credits ?? 0;
  const creditsToAdd = parseFloat(creditsAmount) || 0;
  const newBalance = currentCredits + creditsToAdd;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Credits</DialogTitle>
            <DialogDescription>
              Add credits to {user.email}
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
              <Label htmlFor="current-balance">Current Balance</Label>
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                <Coins className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono font-medium">{currentCredits.toFixed(6)}</span>
                <span className="text-muted-foreground">credits</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="credits">Credits to Add</Label>
              <Input
                id="credits"
                type="number"
                min="0.000001"
                step="0.000001"
                value={creditsAmount}
                onChange={(e) => setCreditsAmount(e.target.value)}
                placeholder="0.000000"
                required
                disabled={submitting}
                className="font-mono"
              />
            </div>

            {creditsToAdd > 0 && (
              <div className="space-y-2">
                <Label>New Balance</Label>
                <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-md border border-primary/20">
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="font-mono font-medium text-primary">{newBalance.toFixed(6)}</span>
                  <span className="text-muted-foreground">credits</span>
                </div>
              </div>
            )}
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
            <Button type="submit" disabled={submitting || !creditsAmount}>
              <Coins className="h-4 w-4 mr-2" />
              {submitting ? 'Adding...' : 'Add Credits'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
