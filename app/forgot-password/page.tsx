'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Mail, ArrowLeft, Check, Sparkles, Brain, BarChart3 } from 'lucide-react';
import Loading from '@/components/loading';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const { user, loading: authLoading, resetPassword } = useAuth();
  const router = useRouter();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      await resetPassword(data.email);
      setSuccess(true);
    } catch (err: any) {
      form.setError('email', {
        type: 'manual',
        message: err.message || 'Failed to send reset email',
      });
    }
  };

  if (authLoading) {
    return <Loading variant="page" fullscreen />;
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50/50 to-teal-50/30">
        {/* Floating orbs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-float will-change-transform pointer-events-none" />
        <div className="absolute top-1/2 -left-32 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-float-delayed will-change-transform pointer-events-none" />
        <div className="absolute -bottom-20 right-1/3 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl animate-float-slow will-change-transform pointer-events-none" />
        
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
          {/* Left Panel - Branding */}
          <div className="hidden lg:flex flex-col justify-center space-y-6 p-12">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 bg-clip-text text-transparent">TCSRS</h1>
              <p className="text-xl text-muted-foreground">
                Your intelligent spaced repetition learning companion
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                </div>
                <span className="text-muted-foreground">Generate flashcards with AI</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Brain className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-muted-foreground">Smart spaced repetition algorithm</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-teal-600" />
                </div>
                <span className="text-muted-foreground">Track your learning progress</span>
              </div>
            </div>
          </div>

          {/* Right Panel - Success Message */}
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md border-border/50 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center mb-2">
                  <Check className="w-6 h-6 text-teal-500" />
                </div>
                <CardTitle>Check Your Email</CardTitle>
                <CardDescription>
                  We've sent a password reset link to your email address. Click the link to reset your password.
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex flex-col space-y-4">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50/50 to-teal-50/30">
      {/* Floating orbs */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-float will-change-transform pointer-events-none" />
      <div className="absolute top-1/2 -left-32 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-float-delayed will-change-transform pointer-events-none" />
      <div className="absolute -bottom-20 right-1/3 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl animate-float-slow will-change-transform pointer-events-none" />
      
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex flex-col justify-center space-y-6 p-12">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 bg-clip-text text-transparent">TCSRS</h1>
            <p className="text-xl text-muted-foreground">
              Your intelligent spaced repetition learning companion
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-indigo-600" />
              </div>
              <span className="text-muted-foreground">Generate flashcards with AI</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <Brain className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-muted-foreground">Smart spaced repetition algorithm</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-teal-600" />
              </div>
              <span className="text-muted-foreground">Track your learning progress</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md border-border/50 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Forgot Password?</CardTitle>
              <CardDescription>
                Enter your email address and we'll send you a link to reset your password.
              </CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
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
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 mt-6">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-0 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300" 
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                  <Button asChild variant="ghost" className="w-full">
                    <Link href="/login">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Login
                    </Link>
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
}
