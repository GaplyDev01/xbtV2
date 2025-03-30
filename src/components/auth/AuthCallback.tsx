import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { Loader2 } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          // Check for refresh token error
          if (error.message?.includes('refresh_token_not_found') || 
              error.message?.includes('Invalid Refresh Token')) {
            console.warn('Invalid refresh token, redirecting to sign in');
            navigate('/auth/sign-in', { replace: true });
            return;
          }
          throw error;
        }

        if (session) {
          // Session exists, redirect to dashboard
          navigate('/dashboard', { replace: true });
        } else {
          // No session, redirect to sign in
          navigate('/auth/sign-in', { replace: true });
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
        navigate('/auth/sign-in', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-bg">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-theme-accent animate-spin mx-auto mb-4" />
        <p className="text-theme-text-primary">Verifying your account...</p>
      </div>
    </div>
  );
};

export default AuthCallback;