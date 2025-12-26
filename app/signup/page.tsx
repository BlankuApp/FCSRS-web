'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import Loading from '@/components/loading';

const signupSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { user, loading: authLoading, signUp, signIn } = useAuth();
  const router = useRouter();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const onSubmit = async (data: SignupFormValues) => {
    try {
      await signUp(data.email, data.password);
      await signIn(data.email, data.password);
      
      await apiClient.createProfile({
        username: data.username,
      });

      router.push('/dashboard');
    } catch (err: any) {
      form.setError('root', {
        type: 'manual',
        message: err.message || 'Failed to sign up',
      });
    }
  };

  if (authLoading) {
    return <Loading variant="page" fullscreen />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex flex-col justify-center space-y-6 p-12">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">TCSRS</h1>
            <p className="text-xl text-muted-foreground">
              Your intelligent spaced repetition learning companion
            </p>
          </div>
          <div className="space-y-4 text-muted-foreground">
            <p>✓ Generate flashcards with AI</p>
            <p>✓ Smart spaced repetition algorithm</p>
            <p>✓ Track your learning progress</p>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md border-border/50 shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Sign Up</CardTitle>
              <CardDescription>Create a new account to get started</CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  {form.formState.errors.root && (
                    <div className="text-sm font-medium text-destructive">
                      {form.formState.errors.root.message}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type="text"
                              placeholder="johndoe"
                              className="pl-10"
                              disabled={form.formState.isSubmitting}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type="email"
                              placeholder="you@example.com"
                              className="pl-10"
                              disabled={form.formState.isSubmitting}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type={showPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              className="pl-10 pr-10"
                              disabled={form.formState.isSubmitting}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? 'Signing up...' : 'Sign Up'}
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}
