'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import Loading from '@/components/loading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ProfilePage() {
  const { user, username, avatar, role, loading: authLoading, updateProfile } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ username: '', avatar: '' });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (username && avatar !== undefined) {
      setFormData({ username, avatar });
    }
  }, [username, avatar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await updateProfile(formData.username, formData.avatar);
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({ username, avatar });
    setEditing(false);
    setError('');
  };

  if (authLoading || !user) {
    return <Loading variant="page" />;
  }

  return (
    <div className="container mx-auto pt-4 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>View and update your profile details</CardDescription>
        </CardHeader>
        <CardContent>
          {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="johndoe"
                    required
                    minLength={3}
                    maxLength={50}
                    pattern="[a-zA-Z0-9_-]+"
                    title="Username must be 3-50 characters, alphanumeric, underscore, or hyphen"
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    id="avatar"
                    type="url"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                    disabled={submitting}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel} disabled={submitting}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  {avatar ? (
                    <img 
                      src={avatar} 
                      alt="Avatar" 
                      className="w-20 h-20 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&size=80`;
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-2xl font-bold">{username[0]?.toUpperCase()}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold">{username}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{role}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">User ID</Label>
                    <p className="font-mono text-sm">{user?.id}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Member Since</Label>
                    <p>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>

                <Button onClick={() => setEditing(true)} className="mt-4">
                  Edit Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }