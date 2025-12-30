'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Lock, Eye, EyeOff, Sparkles, Brain, BarChart3 } from 'lucide-react';
import Loading from '@/components/loading';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const { user, loading: authLoading, updatePassword } = useAuth();
  const router = useRouter();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = form.watch('password');

  useEffect(() => {
    if (!password) {
      setPasswordStrength('weak');
      return;
    }

    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    const hasLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const criteriaCount = [hasLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;

    if (criteriaCount >= 4) {
      strength = 'strong';
    } else if (criteriaCount >= 2) {
      strength = 'medium';
    }

    setPasswordStrength(strength);
  }, [password]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      await updatePassword(data.password);
      // User is automatically signed in after password update
      router.push('/dashboard');
    } catch (err: any) {
      form.setError('password', {
        type: 'manual',
        message: err.message || 'Failed to reset password',
      });
    }
  };

  if (authLoading) {
    return <Loading variant="page" fullscreen />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50/50 to-teal-50/30">
        {/* Floating orbs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-float will-change-transform pointer-events-none" />
        <div className="absolute top-1/2 -left-32 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-float-delayed will-change-transform pointer-events-none" />
        <div className="absolute -bottom-20 right-1/3 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl animate-float-slow will-change-transform pointer-events-none" />
        
        <Card className="w-full max-w-md border-border/50 shadow-lg bg-white/80 backdrop-blur-sm relative z-10">
          <CardHeader className="text-center">
            <CardTitle>Invalid Reset Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <a href="/forgot-password">Request New Link</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'strong':
        return 'bg-teal-500';
      case 'medium':
        return 'bg-purple-500';
      default:
        return 'bg-indigo-500';
    }
  };

  const getStrengthWidth = () => {
    switch (passwordStrength) {
      case 'strong':
        return 'w-full';
      case 'medium':
        return 'w-2/3';
      default:
        return 'w-1/3';
    }
  };

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
              <CardTitle className="text-2xl">Reset Password</CardTitle>
              <CardDescription>
                Enter your new password below
              </CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
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
                        {password && (
                          <div className="space-y-2">
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${getStrengthColor()} ${getStrengthWidth()}`}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Password strength: <span className="font-medium capitalize">{passwordStrength}</span>
                            </p>
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              {...field}
                              type={showConfirmPassword ? 'text' : 'password'}
                              placeholder="••••••••"
                              className="pl-10 pr-10"
                              disabled={form.formState.isSubmitting}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showConfirmPassword ? (
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
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-0 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300" 
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? 'Resetting...' : 'Reset Password'}
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
