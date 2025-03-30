import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AlertProvider } from './context/AlertContext';
import { TokenProvider } from './context/TokenContext';
import { CryptoProvider } from './context/CryptoContext';
import { PortfolioProvider } from './context/PortfolioContext';
import { OnboardingProvider } from './context/OnboardingContext';
import { TwitterProvider } from './context/TwitterContext';
import { DashboardProvider } from './context/DashboardContext';
import { GroqAIProvider } from './context/GroqAIContext';
import { LandingPage, SignIn, SignUp, VerifyEmail, ResetPassword, UpdatePassword } from './pages';
import MainApp from './components/MainApp';
import { StarsBackground } from './components/ui/stars-background';
import CanonicalLink from './components/CanonicalLink';
import AuthCallback from './components/auth/AuthCallback';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-theme-accent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AlertProvider>
            <TokenProvider>
              <CryptoProvider>
                <PortfolioProvider>
                  <TwitterProvider>
                    <OnboardingProvider>
                      <DashboardProvider>
                        <GroqAIProvider>
                          <div className="relative min-h-screen overflow-hidden">
                            <StarsBackground 
                              starDensity={0.00015}
                              allStarsTwinkle={true}
                              twinkleProbability={0.7}
                              minTwinkleSpeed={0.5}
                              maxTwinkleSpeed={1}
                            />
                            <div className="relative z-10">
                              <CanonicalLink />
                              <Routes>
                                {/* Public routes */}
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/auth/sign-in" element={<SignIn />} />
                                <Route path="/auth/sign-up" element={<SignUp />} />
                                <Route path="/auth/verify-email" element={<VerifyEmail />} />
                                <Route path="/auth/reset-password" element={<ResetPassword />} />
                                <Route path="/auth/update-password" element={<UpdatePassword />} />
                                <Route path="/auth/callback" element={<AuthCallback />} />
                                
                                {/* Protected routes */}
                                <Route path="/*" element={
                                  <ProtectedRoute>
                                    <MainApp />
                                  </ProtectedRoute>
                                } />
                              </Routes>
                            </div>
                          </div>
                        </GroqAIProvider>
                      </DashboardProvider>
                    </OnboardingProvider>
                  </TwitterProvider>
                </PortfolioProvider>
              </CryptoProvider>
            </TokenProvider>
          </AlertProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;