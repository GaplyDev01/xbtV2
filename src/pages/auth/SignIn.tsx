import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { Loader2, AlertTriangle, Star, Terminal } from 'lucide-react';
import { StarsBackground } from '../../components/ui/stars-background';
import { z } from 'zod';

// Validation schema
const signInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Load remembered email
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form data
      const formData = { email, password };
      signInSchema.parse(formData);

      // Trim whitespace
      const trimmedEmail = email.trim();
      const trimmedPassword = password;

      // Regular user sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      // Check if session was created
      if (!data.session) {
        throw new Error('No session created after sign in');
      }

      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', trimmedEmail);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Error signing in:', err);
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-carbon-dark relative overflow-hidden">
      <StarsBackground 
        starDensity={0.00015}
        allStarsTwinkle={true}
        twinkleProbability={0.7}
        minTwinkleSpeed={0.5}
        maxTwinkleSpeed={1}
      />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-3xl w-full bg-carbon-light/20 backdrop-blur-sm rounded-lg border border-sand-dark/20 p-8">
          <div className="flex items-center mb-6">
            <Terminal size={24} className="text-sand-DEFAULT mr-2" />
            <h1 className="text-xl font-mono text-sand-DEFAULT">TradesXBT Terminal</h1>
          </div>

          <pre className="font-mono text-sand-DEFAULT whitespace-pre-wrap text-sm mb-8">
            <code>{`// Welcome back trader
// Please authenticate to continue your session

const authenticate = async (credentials) => {
  try {
    await login(credentials);
    console.log('Authentication successful');
  } catch (error) {
    console.error('Authentication failed:', error);
  }
};`}</code>
          </pre>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center text-red-500">
            <AlertTriangle size={16} className="mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-mono text-sand-DEFAULT mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 font-mono text-sm bg-carbon-dark/50 border border-sand-dark/30 rounded-lg text-sand-DEFAULT placeholder-sand-dark/50 focus:outline-none focus:border-sand-DEFAULT"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-mono text-sand-DEFAULT mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 font-mono text-sm bg-carbon-dark/50 border border-sand-dark/30 rounded-lg text-sand-DEFAULT placeholder-sand-dark/50 focus:outline-none focus:border-sand-DEFAULT"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-sand-DEFAULT bg-carbon-dark border-sand-dark/30 rounded focus:ring-sand-DEFAULT cursor-pointer"
              />
              <span className="ml-2 text-xs font-mono text-sand-DEFAULT">Remember me</span>
            </label>

            <Link
              to="/auth/reset-password"
              className="text-xs font-mono text-sand-DEFAULT hover:text-sand-light"
            >
              Forgot password?
            </Link>
          </div>

          <div className="flex justify-center space-x-4 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 font-mono text-sm bg-carbon-dark border border-sand-DEFAULT/30 text-sand-DEFAULT hover:bg-sand-DEFAULT/5 hover:border-sand-DEFAULT transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin mx-auto" />
              ) : (
                '> ./authenticate.sh'
              )}
            </button>
          </div>
        </form>

        <p className="mt-6 text-xs font-mono text-sand-dark text-center">
          Don't have an account?{' '}
          <Link to="/auth/sign-up" className="text-sand-DEFAULT hover:text-sand-light">
            &gt; ./register.sh
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
};

export default SignIn;