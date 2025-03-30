import React, { createContext, useContext, useState, useEffect } from 'react';
import { OnboardingStep, UserDashboardPreferences } from '../types/onboarding';

interface OnboardingContextType {
  isOnboardingCompleted: boolean;
  currentStep: string | null;
  userPreferences: UserDashboardPreferences;
  onboardingSteps: OnboardingStep[];
  startOnboarding: () => void;
  completeOnboarding: () => void;
  goToNextStep: (nextStepId?: string) => void;
  updateUserPreference: <K extends keyof UserDashboardPreferences>(
    key: K,
    value: UserDashboardPreferences[K]
  ) => void;
  saveUserResponse: (stepId: string, key: string, value: any) => void;
}

// Default preferences configuration
const defaultPreferences: UserDashboardPreferences = {
  theme: 'system',
  layout: {
    columns: 6,
    margin: 10,
    cellHeight: 50,
  },
  cardColors: {},
  contentPreferences: {
    news: true,
    price: true,
    trends: true,
    portfolio: true,
    watchlist: true,
  },
  firstVisit: true,
};

// Default onboarding steps
const defaultOnboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    completed: false,
    userResponses: {},
    nextStep: 'theme',
  },
  {
    id: 'theme',
    completed: false,
    userResponses: {},
    nextStep: 'content',
  },
  {
    id: 'content',
    completed: false,
    userResponses: {},
    nextStep: 'token',
  },
  {
    id: 'token',
    completed: false,
    userResponses: {},
    nextStep: 'complete',
  },
  {
    id: 'complete',
    completed: false,
    userResponses: {},
  },
];

export const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  // State for tracking onboarding completion
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<string | null>('welcome');
  const [userPreferences, setUserPreferences] = useState<UserDashboardPreferences>(defaultPreferences);
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>(defaultOnboardingSteps);

  // Load saved preferences and onboarding state from localStorage on initial load
  useEffect(() => {
    const savedPreferences = localStorage.getItem('userDashboardPreferences');
    const savedOnboardingState = localStorage.getItem('onboardingState');

    if (savedPreferences) {
      setUserPreferences(JSON.parse(savedPreferences));
    }

    if (savedOnboardingState) {
      const { completed, step, steps } = JSON.parse(savedOnboardingState);
      setIsOnboardingCompleted(completed);
      setCurrentStep(step);
      if (steps) setOnboardingSteps(steps);
    }
  }, []);

  // Save changes to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('userDashboardPreferences', JSON.stringify(userPreferences));
    localStorage.setItem('onboardingState', JSON.stringify({
      completed: isOnboardingCompleted,
      step: currentStep,
      steps: onboardingSteps,
    }));
  }, [isOnboardingCompleted, currentStep, userPreferences, onboardingSteps]);

  // Start the onboarding process
  const startOnboarding = () => {
    setIsOnboardingCompleted(false);
    setCurrentStep('welcome');
    // Reset onboarding steps
    setOnboardingSteps(defaultOnboardingSteps);
  };

  // Complete the onboarding process
  const completeOnboarding = () => {
    setIsOnboardingCompleted(true);
    setCurrentStep(null);
    // Mark all steps as completed
    setOnboardingSteps(steps => 
      steps.map(step => ({ ...step, completed: true }))
    );
    // Update first visit flag
    setUserPreferences(prev => ({ ...prev, firstVisit: false }));
  };

  // Progress to the next step in the onboarding flow
  const goToNextStep = (nextStepId?: string) => {
    // Find current step
    const currentStepObj = onboardingSteps.find(step => step.id === currentStep);
    
    // If no specific next step is provided, use the one defined in the current step
    const targetNextStep = nextStepId || (currentStepObj?.nextStep ?? null);
    
    if (!targetNextStep) {
      // If no next step is available, complete the onboarding
      completeOnboarding();
      return;
    }

    // Mark current step as completed
    setOnboardingSteps(steps => 
      steps.map(step => 
        step.id === currentStep ? { ...step, completed: true } : step
      )
    );

    // Set the next step as current
    setCurrentStep(targetNextStep);
  };

  // Update a specific user preference
  const updateUserPreference = <K extends keyof UserDashboardPreferences>(
    key: K,
    value: UserDashboardPreferences[K]
  ) => {
    setUserPreferences(prev => ({ ...prev, [key]: value }));
  };

  // Save a user response for a specific step
  const saveUserResponse = (stepId: string, key: string, value: any) => {
    setOnboardingSteps(steps => 
      steps.map(step => {
        if (step.id === stepId) {
          return {
            ...step,
            userResponses: { ...step.userResponses, [key]: value },
          };
        }
        return step;
      })
    );
  };

  const contextValue: OnboardingContextType = {
    isOnboardingCompleted,
    currentStep,
    userPreferences,
    onboardingSteps,
    startOnboarding,
    completeOnboarding,
    goToNextStep,
    updateUserPreference,
    saveUserResponse,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};
