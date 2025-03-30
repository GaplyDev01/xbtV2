import React from 'react';

interface ThemePreviewProps {
  theme: string;
  label: string;
  onClick: () => void;
}

/**
 * Visual component showing dashboard theme previews
 * Used within chat messages for theme selection
 */
const ThemePreview: React.FC<ThemePreviewProps> = ({ theme, label, onClick }) => {
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

export default ThemePreview;
