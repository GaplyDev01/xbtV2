import React, { useEffect, lazy, Suspense } from 'react';
import { useOnboarding } from '../context/OnboardingContext';

// Lazy load OnboardingChat to avoid circular dependency
const OnboardingChat = lazy(() => import('./OnboardingChat'));

interface OnboardingManagerProps {
  children: React.ReactNode;
}

/**
 * Component responsible for managing the onboarding experience
 * Determines when to show the onboarding flow based on user state
 */
const OnboardingManager: React.FC<OnboardingManagerProps> = ({ children }) => {
  const {
    isOnboardingCompleted,
    startOnboarding,
  } = useOnboarding();

  return (
    <>
      {/* Show onboarding UI if onboarding is not completed */}
      {!isOnboardingCompleted && (
        <Suspense fallback={<div className="fixed inset-0 bg-theme-bg/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="animate-pulse text-theme-accent">Loading onboarding...</div>
        </div>}>
          <OnboardingChat />
        </Suspense>
      )}
      
      {/* Always render the main application */}
      {children}
    </>
  );
};

export default OnboardingManager;
