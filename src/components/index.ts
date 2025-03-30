// Component organization index file

// Main layout components
export * from './layout';

// Dashboard components
export * from './dashboard';

// Platform-specific components
export * from './platforms';

// Unified components
export * from './unified';

// UI components
export * from './ui';

// Individual components with direct export
import MainApp from './MainApp';
import GooeyMenu from './GooeyMenu';
import TokenSideMenu from './TokenSideMenu';
import OnboardingChat from './OnboardingChat';
import OnboardingManager from './OnboardingManager';
import ThemePreview from './ThemePreview';
import DashboardPreferenceProvider from './DashboardPreferenceProvider';

export {
  MainApp,
  GooeyMenu,
  TokenSideMenu,
  OnboardingChat,
  OnboardingManager,
  ThemePreview,
  DashboardPreferenceProvider
};
