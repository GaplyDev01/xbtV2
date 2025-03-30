import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { Loader2, AlertTriangle, Star, Terminal } from 'lucide-react';
import { StarsBackground } from '../../components/ui/stars-background';
import { z } from 'zod';

const signUpSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const validateField = (field: keyof typeof formData, value: string) => {
    try {
      const schema = signUpSchema.pick({ [field]: true });
      schema.parse({ [field]: value });
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    } catch (err) {
      if (err instanceof z.ZodError) {
        setValidationErrors(prev => ({
          ...prev,
          [field]: err.errors[0].message
        }));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name as keyof typeof formData, value);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate all fields
      const validatedData = signUpSchema.parse(formData);

      const { error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          data: {
            username: validatedData.username
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      // Redirect to email verification page
      navigate('/auth/verify-email', { state: { email: validatedData.email } });
    } catch (err) {
      console.error('Error signing up:', err);
      if (err instanceof z.ZodError) {
        const errors = err.errors.reduce((acc, error) => ({
          ...acc,
          [error.path[0]]: error.message
        }), {});
        setValidationErrors(errors);
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred during sign up');
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
            <code>{`// Welcome to TradesXBT
// Let's create your account to get started

const register = async (userData) => {
  try {
    await createAccount(userData);
    console.log('Account created successfully');
  } catch (error) {
    console.error('Registration failed:', error);
  }
};`}</code>
          </pre>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center text-red-500">
            <AlertTriangle size={16} className="mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-xs font-mono text-sand-DEFAULT mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-3 py-2 font-mono text-sm bg-carbon-dark/50 border rounded-lg text-sand-DEFAULT placeholder-sand-dark/50 focus:outline-none ${
                validationErrors.username 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-sand-dark/30 focus:border-sand-DEFAULT'
              }`}
              placeholder="johndoe"
            />
            {validationErrors.username && (
              <p className="mt-1 text-xs font-mono text-red-500">{validationErrors.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-mono text-sand-DEFAULT mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 font-mono text-sm bg-carbon-dark/50 border rounded-lg text-sand-DEFAULT placeholder-sand-dark/50 focus:outline-none ${
                validationErrors.email 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-sand-dark/30 focus:border-sand-DEFAULT'
              }`}
              placeholder="you@example.com"
            />
            {validationErrors.email && (
              <p className="mt-1 text-xs font-mono text-red-500">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-mono text-sand-DEFAULT mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 font-mono text-sm bg-carbon-dark/50 border rounded-lg text-sand-DEFAULT placeholder-sand-dark/50 focus:outline-none ${
                validationErrors.password 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-sand-dark/30 focus:border-sand-DEFAULT'
              }`}
              placeholder="••••••••"
            />
            {validationErrors.password && (
              <p className="mt-1 text-xs font-mono text-red-500">{validationErrors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-mono text-sand-DEFAULT mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 font-mono text-sm bg-carbon-dark/50 border rounded-lg text-sand-DEFAULT placeholder-sand-dark/50 focus:outline-none ${
                validationErrors.confirmPassword 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-sand-dark/30 focus:border-sand-DEFAULT'
              }`}
              placeholder="••••••••"
            />
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-xs font-mono text-red-500">{validationErrors.confirmPassword}</p>
            )}
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
                '&gt; ./create_account.sh'
              )}
            </button>
          </div>
        </form>

        <p className="mt-6 text-xs font-mono text-sand-dark text-center">
          Already have an account?{' '}
          <Link to="/auth/sign-in" className="text-sand-DEFAULT hover:text-sand-light">
            &gt; ./sign_in.sh
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
};

export default SignUp;