import React, { useState, useEffect, useRef } from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { OnboardingMessage, OnboardingChatMessage } from '../types/onboarding';
import { User, Bot } from 'lucide-react';

/**
 * Chat-based onboarding experience that guides users through personalizing their dashboard
 */
const OnboardingChat: React.FC = () => {
  const {
    currentStep,
    goToNextStep,
    updateUserPreference,
    saveUserResponse,
    completeOnboarding
  } = useOnboarding();

  const [messages, setMessages] = useState<OnboardingChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate onboarding messages based on current step
  useEffect(() => {
    if (!currentStep) return;
    
    setIsTyping(true);
    
    // Simulate typing effect
    const typingTimeout = setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        sender: 'system',
        timestamp: Date.now(),
        content: getStepMessage(currentStep),
        isOnboarding: true
      }]);
    }, 1000);

    return () => clearTimeout(typingTimeout);
  }, [currentStep]);

  // Handle user selection for an option
  const handleOptionSelect = (message: OnboardingMessage, optionValue: string) => {
    // Add user message
    const selectedOption = message.options?.find(opt => opt.value === optionValue);
    
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: Date.now(),
      content: selectedOption?.label || optionValue,
      isOnboarding: true
    }]);

    // Save user response
    saveUserResponse(message.stepId, message.preferenceKey || 'response', optionValue);
    
    // Update preference if specified
    if (message.preferenceKey) {
      updateUserPreference(
        message.preferenceKey as any,
        optionValue
      );
    }

    // Go to next step
    setTimeout(() => {
      if (message.stepId === 'complete') {
        completeOnboarding();
      } else {
        goToNextStep();
      }
    }, 500);
  };

  // Render an onboarding message based on its type
  const renderOnboardingMessage = (message: OnboardingMessage) => {
    switch (message.type) {
      case 'text':
        return <p className="mb-3">{message.content}</p>;
      
      case 'options':
        return (
          <div className="space-y-2">
            <p className="mb-3">{message.content}</p>
            <div className="flex flex-wrap gap-2">
              {message.options?.map(option => (
                <button
                  key={option.value}
                  className="px-4 py-2 text-sm bg-theme-accent text-theme-bg rounded-lg hover:bg-theme-accent-dark transition-colors"
                  onClick={() => handleOptionSelect(message, option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        );
      
      case 'theme-preview':
        return (
          <div className="space-y-4">
            <p className="mb-2">{message.content}</p>
            <div className="grid grid-cols-2 gap-4">
              {message.options?.map(option => (
                <ThemePreviewItem
                  key={option.value}
                  theme={option.value}
                  label={option.label}
                  onClick={() => handleOptionSelect(message, option.value)}
                />
              ))}
            </div>
          </div>
        );
      
      case 'token-select':
        return (
          <div className="space-y-2">
            <p className="mb-3">{message.content}</p>
            {/* Token select component will be added later */}
            <div className="flex flex-wrap gap-2">
              {message.options?.map(option => (
                <button
                  key={option.value}
                  className="px-4 py-2 text-sm bg-theme-accent/10 text-theme-text-primary rounded-lg hover:bg-theme-accent/20 transition-colors flex items-center border border-theme-border"
                  onClick={() => handleOptionSelect(message, option.value)}
                >
                  <span className="w-3 h-3 rounded-full bg-theme-accent mr-2"></span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        );
      
      case 'complete':
        return (
          <div className="space-y-2">
            <p className="mb-3">{message.content}</p>
            <button
              className="px-4 py-2 text-sm bg-theme-accent text-theme-bg rounded-lg hover:bg-theme-accent-dark transition-colors"
              onClick={() => handleOptionSelect(message, 'complete')}
            >
              Continue to Dashboard
            </button>
          </div>
        );
      
      default:
        return <p>{message.content}</p>;
    }
  };

  // Get the message content for the current step
  const getStepMessage = (stepId: string): OnboardingMessage => {
    switch (stepId) {
      case 'welcome':
        return {
          id: `welcome-${Date.now()}`,
          type: 'options',
          content: "Welcome to your personalized crypto dashboard! I'll help you set it up just the way you like it. Ready to customize your experience?",
          options: [
            { value: 'ready', label: "Let's get started!" },
            { value: 'skip', label: "Skip for now" }
          ],
          stepId: 'welcome',
        };
      
      case 'theme':
        return {
          id: `theme-${Date.now()}`,
          type: 'theme-preview',
          content: "First, let's pick a theme for your dashboard. Which one looks best to you?",
          options: [
            { value: 'light', label: "Light Mode" },
            { value: 'dark', label: "Dark Mode" },
            { value: 'system', label: "Use System Setting" },
            { value: 'halloween', label: "Halloween" }
          ],
          stepId: 'theme',
          preferenceKey: 'theme'
        };
      
      case 'content':
        return {
          id: `content-${Date.now()}`,
          type: 'options',
          content: "What type of content are you most interested in seeing on your dashboard?",
          options: [
            { value: 'trading', label: "Trading & Analysis" },
            { value: 'news', label: "News & Updates" },
            { value: 'portfolio', label: "Portfolio Tracking" },
            { value: 'all', label: "Show me everything" }
          ],
          stepId: 'content',
          preferenceKey: 'contentType'
        };
      
      case 'token':
        return {
          id: `token-${Date.now()}`,
          type: 'token-select',
          content: "Do you have a favorite token you'd like to focus on?",
          options: [
            { value: 'BTC', label: "Bitcoin (BTC)" },
            { value: 'ETH', label: "Ethereum (ETH)" },
            { value: 'SOL', label: "Solana (SOL)" },
            { value: 'none', label: "No preference" }
          ],
          stepId: 'token',
          preferenceKey: 'defaultToken'
        };
      
      case 'complete':
        return {
          id: `complete-${Date.now()}`,
          type: 'complete',
          content: "Great! Your dashboard is now personalized based on your preferences. You can always change these settings later in your profile.",
          stepId: 'complete',
        };

      default:
        return {
          id: `unknown-${Date.now()}`,
          type: 'text',
          content: "Something went wrong with the onboarding process. Please refresh the page or contact support.",
          stepId: 'unknown',
        };
    }
  };

  return (
    <div className="fixed inset-0 bg-theme-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-theme-bg rounded-xl border border-theme-border shadow-lg w-full max-w-lg overflow-hidden">
        <div className="border-b border-theme-border p-4">
          <h2 className="text-theme-text-primary font-medium flex items-center">
            <Bot size={18} className="text-theme-accent mr-2" />
            Dashboard Setup Assistant
          </h2>
        </div>
        
        <div className="p-4 h-96 overflow-y-auto">
          {/* Chat messages */}
          <div className="space-y-6">
            {messages.map(message => (
              <div 
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-xl p-3 ${message.sender === 'user' 
                    ? 'bg-theme-accent text-theme-bg rounded-tr-none' 
                    : 'bg-theme-bg border border-theme-border rounded-tl-none'}`}
                >
                  <div className="flex items-center mb-1">
                    <div className="w-6 h-6 rounded-full bg-theme-bg/20 flex items-center justify-center mr-2">
                      {message.sender === 'user' ? (
                        <User size={14} className="text-theme-bg" />
                      ) : (
                        <Bot size={14} className="text-theme-accent" />
                      )}
                    </div>
                    <span className="text-xs opacity-70">
                      {message.sender === 'user' ? 'You' : 'Assistant'}
                    </span>
                  </div>
                  
                  <div className="text-sm">
                    {typeof message.content === 'string' ? (
                      <p>{message.content}</p>
                    ) : (
                      renderOnboardingMessage(message.content)
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-xl p-3 bg-theme-bg border border-theme-border rounded-tl-none">
                  <div className="flex items-center mb-1">
                    <div className="w-6 h-6 rounded-full bg-theme-bg/20 flex items-center justify-center mr-2">
                      <Bot size={14} className="text-theme-accent" />
                    </div>
                    <span className="text-xs opacity-70">Assistant</span>
                  </div>
                  <div className="flex space-x-1 py-2 px-1">
                    <div className="w-2 h-2 bg-theme-text-secondary/50 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-theme-text-secondary/50 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-theme-text-secondary/50 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Inline theme preview component
interface ThemePreviewItemProps {
  theme: string;
  label: string;
  onClick: () => void;
}

const ThemePreviewItem: React.FC<ThemePreviewItemProps> = ({ theme, label, onClick }) => {
  // Theme color mapping with proper typing
  interface ThemeColorSet {
    bg: string;
    panel: string;
    border: string;
    text: string;
    accent: string;
    darkBg?: string;
    darkPanel?: string;
  }
  
  const themeColors: Record<string, ThemeColorSet> = {
    light: {
      bg: '#ffffff',
      panel: '#f8fafc',
      border: '#e2e8f0',
      text: '#334155',
      accent: '#3b82f6',
    },
    dark: {
      bg: '#0f172a',
      panel: '#1e293b',
      border: '#334155',
      text: '#e2e8f0',
      accent: '#3b82f6',
    },
    system: {
      bg: '#f8fafc',
      panel: '#ffffff',
      border: '#e2e8f0',
      text: '#334155',
      accent: '#3b82f6',
      // Second half for dark
      darkBg: '#0f172a',
      darkPanel: '#1e293b',
    },
    halloween: {
      bg: '#1a1a1a',
      panel: '#261D2A',
      border: '#423252',
      text: '#F5F1DE',
      accent: '#FF6D00',
    },
  };

  // Get colors for the selected theme
  const colors = themeColors[theme as keyof typeof themeColors] || themeColors.light;

  // Render a split preview for system theme
  if (theme === 'system') {
    return (
      <button
        onClick={onClick}
        className="overflow-hidden rounded-lg border border-theme-border hover:border-theme-accent transition-colors focus:outline-none focus:ring-2 focus:ring-theme-accent focus:ring-opacity-50"
      >
        <div className="w-full h-32 flex">
          {/* Light mode half */}
          <div className="w-1/2" style={{ background: colors.bg }}>
            <div className="p-2">
              <div className="h-6 w-16 rounded" style={{ background: colors.accent }}></div>
              <div className="mt-2 h-3 w-12 rounded-sm" style={{ background: colors.text, opacity: 0.7 }}></div>
              <div className="mt-2 h-3 w-16 rounded-sm" style={{ background: colors.text, opacity: 0.4 }}></div>
              
              <div className="mt-4 h-12 rounded" style={{ background: colors.panel, border: `1px solid ${colors.border}` }}></div>
            </div>
          </div>
          
          {/* Dark mode half */}
          <div className="w-1/2" style={{ background: colors.darkBg }}>
            <div className="p-2">
              <div className="h-6 w-16 rounded" style={{ background: colors.accent }}></div>
              <div className="mt-2 h-3 w-12 rounded-sm" style={{ background: colors.text, opacity: 0.7 }}></div>
              <div className="mt-2 h-3 w-16 rounded-sm" style={{ background: colors.text, opacity: 0.4 }}></div>
              
              <div className="mt-4 h-12 rounded" style={{ background: colors.darkPanel, border: `1px solid ${colors.border}` }}></div>
            </div>
          </div>
        </div>
        <div className="p-2 text-center text-sm text-theme-text-primary bg-theme-bg border-t border-theme-border">
          {label}
        </div>
      </button>
    );
  }

  // Regular theme preview
  return (
    <button
      onClick={onClick}
      className="overflow-hidden rounded-lg border border-theme-border hover:border-theme-accent transition-colors focus:outline-none focus:ring-2 focus:ring-theme-accent focus:ring-opacity-50"
    >
      <div className="w-full h-32" style={{ background: colors.bg }}>
        <div className="p-2">
          <div className="h-6 w-16 rounded" style={{ background: colors.accent }}></div>
          <div className="mt-2 h-3 w-12 rounded-sm" style={{ background: colors.text, opacity: 0.7 }}></div>
          <div className="mt-2 h-3 w-16 rounded-sm" style={{ background: colors.text, opacity: 0.4 }}></div>
          
          <div className="mt-4 h-12 rounded" style={{ background: colors.panel, border: `1px solid ${colors.border}` }}>
            <div className="p-1">
              <div className="h-2 w-8 rounded-sm" style={{ background: colors.text, opacity: 0.3 }}></div>
              <div className="mt-1 h-2 w-6 rounded-sm" style={{ background: colors.text, opacity: 0.3 }}></div>
            </div>
          </div>
          
          <div className="mt-2 flex space-x-1">
            <div className="h-3 w-3 rounded-sm" style={{ background: colors.accent }}></div>
            <div className="h-3 w-3 rounded-sm" style={{ background: colors.text, opacity: 0.4 }}></div>
            <div className="h-3 w-3 rounded-sm" style={{ background: colors.text, opacity: 0.4 }}></div>
          </div>
        </div>
      </div>
      <div className="p-2 text-center text-sm text-theme-text-primary bg-theme-bg border-t border-theme-border">
        {label}
      </div>
    </button>
  );
};

export default OnboardingChat;
