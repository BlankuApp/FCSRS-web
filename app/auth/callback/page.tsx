'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Loading from '@/components/loading';

export default function AuthCallbackPage() {
  const router = useRouter();
  const processingRef = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent double processing
      if (processingRef.current) {
        return;
      }
      
      processingRef.current = true;

      try {
        // Check for error in query params
        const params = new URLSearchParams(window.location.search);
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        if (error) {
          router.replace(`/login?error=${encodeURIComponent(errorDescription || error)}`);
          return;
        }

        // Check if we have hash fragments (implicit flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken) {
          // Set the session using the tokens
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (sessionError) {
            router.replace(`/login?error=${encodeURIComponent(sessionError.message)}`);
            return;
          }

          // Update user metadata if needed
          if (data.user) {
            const googleName = data.user.user_metadata?.full_name || data.user.user_metadata?.name;
            const googleAvatar = data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture;
            
            const updateData: any = {};
            
            if (googleName && !data.user.user_metadata?.name) {
              updateData.name = googleName;
            }
            
            if (googleAvatar && !data.user.user_metadata?.avatar_url) {
              updateData.avatar_url = googleAvatar;
            }
            
            if (!data.user.user_metadata?.role) {
              updateData.role = 'user';
            }

            if (data.user.user_metadata?.credits === null || data.user.user_metadata?.credits === undefined) {
              updateData.credits = 2.0;
            }

            if (data.user.user_metadata?.total_spent === null || data.user.user_metadata?.total_spent === undefined) {
              updateData.total_spent = 0.0;
            }

            if (Object.keys(updateData).length > 0) {
              await supabase.auth.updateUser({
                data: updateData,
              });
            }
          }

          router.replace('/dashboard');
          return;
        }

        // Check for authorization code (PKCE flow)
        const code = params.get('code');
        
        if (code) {
          // Exchange code for session
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            router.replace(`/login?error=${encodeURIComponent(exchangeError.message)}`);
            return;
          }

          // Update metadata for PKCE flow users too
          if (data.user) {
            const googleName = data.user.user_metadata?.full_name || data.user.user_metadata?.name;
            const googleAvatar = data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture;
            
            const updateData: any = {};
            
            if (googleName && !data.user.user_metadata?.name) {
              updateData.name = googleName;
            }
            
            if (googleAvatar && !data.user.user_metadata?.avatar_url) {
              updateData.avatar_url = googleAvatar;
            }
            
            if (!data.user.user_metadata?.role) {
              updateData.role = 'user';
            }
            
            if (data.user.user_metadata?.credits === null || data.user.user_metadata?.credits === undefined) {
              updateData.credits = 2.0;
            }
            
            if (data.user.user_metadata?.total_spent === null || data.user.user_metadata?.total_spent === undefined) {
              updateData.total_spent = 0.0;
            }

            if (Object.keys(updateData).length > 0) {
              await supabase.auth.updateUser({ data: updateData });
            }
          }

          router.replace('/dashboard');
          return;
        }

        // No code or tokens found
        router.replace('/login?error=No%20authorization%20data%20received');

      } catch (error: any) {
        router.replace(`/login?error=${encodeURIComponent('Authentication failed')}`);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loading variant="page" fullscreen />
        <p className="text-muted-foreground">Completing sign in with Google...</p>
      </div>
    </div>
  );
}
