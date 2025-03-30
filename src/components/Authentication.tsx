import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../utils/supabase';

interface AuthenticationProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (userData: any) => void;
}

const Authentication: React.FC<AuthenticationProps> = ({ 
  isOpen, 
  onClose,
  onAuthenticated 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-theme-bg/80 flex items-center justify-center z-50">
      <div className="bg-theme-bg border border-theme-border rounded-lg shadow-xl overflow-hidden w-full max-w-md">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-theme-accent to-theme-accent-dark p-6">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-theme-text-primary hover:bg-theme-text-primary/20 rounded-full p-1 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-theme-text-primary">Welcome to TradesXBT</h2>
          <p className="text-theme-text-primary/80 text-sm mt-1">Sign in to access your dashboard</p>
        </div>
        
        {/* Auth UI */}
        <div className="p-6">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#00d69e',
                    brandAccent: '#158c6c',
                    inputBackground: '#010202',
                    inputText: '#F9FAFB',
                    inputBorder: '#158c6c',
                    inputBorderFocus: '#00d69e',
                    inputBorderHover: '#158c6c',
                  },
                },
              },
              className: {
                container: 'w-full',
                button: 'w-full px-4 py-2 text-sm font-medium text-theme-bg bg-theme-accent hover:bg-theme-accent-dark rounded-lg transition-colors',
                input: 'w-full px-3 py-2 text-sm bg-theme-bg border border-theme-border rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-accent focus:border-theme-accent text-theme-text-primary',
                label: 'block text-sm font-medium text-theme-text-accent mb-1',
              },
            }}
            theme="dark"
            providers={[]}
            redirectTo={`${window.location.origin}/auth/callback`}
          />
        </div>
      </div>
    </div>
  );
};

export default Authentication;