import React, { useState } from 'react';
import { resendVerificationEmail } from '../../utils/supabase';
import { Loader2, Mail, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

interface EmailVerificationProps {
  email: string;
  onBack: () => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ email, onBack }) => {
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendStatus('idle');
    setError(null);

    try {
      const { error: resendError } = await resendVerificationEmail(email);
      
      if (resendError) throw resendError;
      
      setResendStatus('success');
    } catch (err) {
      console.error('Error resending verification email:', err);
      setResendStatus('error');
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="p-6 bg-theme-bg border border-theme-border rounded-lg max-w-md w-full mx-auto">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-theme-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-6 h-6 text-theme-accent" />
        </div>
        <h2 className="text-xl font-bold text-theme-text-primary mb-2">Check your email</h2>
        <p className="text-sm text-theme-text-secondary">
          We've sent a verification link to <strong>{email}</strong>
        </p>
      </div>

      <div className="space-y-4">
        {resendStatus === 'success' && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <p className="text-sm text-green-500">Verification email sent successfully!</p>
          </div>
        )}

        {resendStatus === 'error' && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        <button
          onClick={handleResendEmail}
          disabled={isResending}
          className="w-full flex items-center justify-center px-4 py-2 bg-theme-accent/10 text-theme-accent hover:bg-theme-accent/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isResending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Resending...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Resend verification email
            </>
          )}
        </button>

        <button
          onClick={onBack}
          className="w-full px-4 py-2 text-theme-text-secondary hover:text-theme-text-primary transition-colors"
        >
          Back to sign in
        </button>
      </div>
    </div>
  );
};

export default EmailVerification;