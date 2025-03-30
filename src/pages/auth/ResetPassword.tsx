import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) throw error;

      setSuccess(true);
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-carbon-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-carbon-light/20 backdrop-blur-sm rounded-lg border border-sand-dark/20 p-8">
        <Link 
          to="/auth/sign-in"
          className="inline-flex items-center text-sand-DEFAULT hover:text-sand-light mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Sign In
        </Link>

        <h2 className="text-2xl font-bold text-sand-DEFAULT mb-2">Reset Password</h2>
        <p className="text-sand-dark mb-6">
          Enter your email address and we'll send you instructions to reset your password.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center text-red-500">
            <AlertTriangle size={16} className="mr-2" />
            {error}
          </div>
        )}

        {success ? (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500">
            <p>Check your email for password reset instructions.</p>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-sand-DEFAULT mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-carbon-dark/50 border border-sand-dark/30 rounded-lg text-sand-DEFAULT placeholder-sand-dark/50 focus:outline-none focus:border-sand-DEFAULT"
                placeholder="you@example.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sand-DEFAULT hover:bg-sand-light text-carbon-dark py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin mx-auto" />
              ) : (
                'Send Reset Instructions'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;