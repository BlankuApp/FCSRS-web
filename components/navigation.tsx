'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  // Don't show navigation on auth pages
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  // Don't show navigation if not authenticated
  if (!user && !loading) {
    return null;
  }

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/dashboard" className="text-xl font-bold">
            TCSRS
          </Link>
          <div className="hidden md:flex space-x-4">
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === '/dashboard'
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/decks"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname.startsWith('/decks')
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              Decks
            </Link>
            <Link
              href="/profile"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === '/profile'
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              Profile
            </Link>
          </div>
        </div>
        <Button variant="ghost" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </nav>
  );
}
