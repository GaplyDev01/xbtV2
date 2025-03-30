/**
 * Types for the onboarding experience
 */

export interface LayoutConfig {
  columns: number;
  margin: number;
  cellHeight: number;
}

export interface UserDashboardPreferences {
  theme: string;
  layout: LayoutConfig;
  cardColors: Record<string, string>;
  defaultToken?: string;
  contentPreferences: Record<string, boolean>;
  firstVisit: boolean;
}

export interface OnboardingStep {
  id: string;
  completed: boolean;
  userResponses: Record<string, any>;
  nextStep?: string;
}

export interface OnboardingMessage {
  id: string;
  type: 'text' | 'options' | 'theme-preview' | 'token-select' | 'complete';
  content: string;
  options?: {
    value: string;
    label: string;
    description?: string;
    preview?: string;
  }[];
  stepId: string;
  preferenceKey?: keyof UserDashboardPreferences | string;
}

export interface OnboardingChatMessage {
  id: string;
  sender: 'user' | 'system';
  timestamp: number;
  content: string | OnboardingMessage;
  isOnboarding: true;
}
