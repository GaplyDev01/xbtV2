import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

const VerifyEmail: React.FC = () => {
  const location = useLocation();
  const email = location.state?.email;

  if (!email) {
    return (
      <div className="min-h-screen bg-carbon-dark flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-carbon-light/20 backdrop-blur-sm rounded-lg border border-sand-dark/20 p-8 text-center">
          <p className="text-sand-DEFAULT mb-4">Invalid verification request.</p>
          <Link 
            to="/auth/sign-up"
            className="text-sand-DEFAULT hover:text-sand-light flex items-center justify-center"
          >
            <ArrowLeft size={16} className="mr-2" />
            Return to Sign Up
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-carbon-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-carbon-light/20 backdrop-blur-sm rounded-lg border border-sand-dark/20 p-8 text-center">
        <div className="w-16 h-16 bg-sand-DEFAULT/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail size={32} className="text-sand-DEFAULT" />
        </div>

        <h2 className="text-2xl font-bold text-sand-DEFAULT mb-2">Check your email</h2>
        <p className="text-sand-dark mb-6">
          We've sent a verification link to <strong className="text-sand-DEFAULT">{email}</strong>
        </p>

        <div className="space-y-4">
          <Link 
            to="/auth/sign-in"
            className="block w-full bg-sand-DEFAULT hover:bg-sand-light text-carbon-dark py-2 rounded-lg font-medium transition-colors"
          >
            Return to Sign In
          </Link>

          <p className="text-sm text-sand-dark">
            Didn't receive the email? Check your spam folder or{' '}
            <Link to="/auth/sign-up" className="text-sand-DEFAULT hover:text-sand-light">
              try another email
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;