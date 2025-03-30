import React, { Suspense } from 'react';
// Removed unused import
import GooeyMenu from '../GooeyMenu';
import { useOnboarding } from '../../context/OnboardingContext';
// Lazy load ActivityBar to prevent it from blocking rendering
const ActivityBar = React.lazy(() => import('../ActivityBar'));

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children,
  className = ''
}) => {
  const { isOnboardingCompleted, currentStep } = useOnboarding();
  const isOnboardingActive = !isOnboardingCompleted && currentStep !== null;
  
  // Use simple theme selection since dashboardPreferences is not directly available
  const theme = 'dark'; // Default theme, in a real implementation this would come from preferences
  
  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${className}`}
      data-theme={theme}
    >
      {/* Activity Bar - lazy loaded with error boundary */}
      <Suspense fallback={<div className="h-12 bg-gray-900"></div>}>
        <ErrorBoundary>
          <ActivityBar />
        </ErrorBoundary>
      </Suspense>
      
      <div className="flex min-h-screen">
        {/* Main content area */}
        <main className="flex-1 p-4 md:p-6 pt-14">
          {children}
        </main>
      </div>
      
      {/* Gooey Menu remains visible regardless of onboarding state */}
      <GooeyMenu 
        activeTab="dashboard" 
        setActiveTab={() => {}} // No-op function as we're not changing tabs here
      />
      
      {/* Status bar */}
      <div className="fixed bottom-0 left-0 right-0 h-6 bg-theme-bg/80 backdrop-blur-sm border-t border-theme-border text-theme-text-secondary text-xs px-4 flex items-center justify-between z-10">
        <div>I Got You • Dashboard</div>
        <div>© 2025 • All rights reserved</div>
      </div>
    </div>
  );
};

// Simple error boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="h-12 bg-gray-900"></div>;
    }
    return this.props.children;
  }
}

export default DashboardLayout;
