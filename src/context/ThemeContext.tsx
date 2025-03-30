import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system' | 'high-contrast-light' | 'high-contrast-dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('system');
  const [isDark, setIsDark] = useState(false);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const applyTheme = (selectedTheme: Theme) => {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDarkMode = selectedTheme === 'dark' || selectedTheme === 'high-contrast-dark' || 
                      (selectedTheme === 'system' && systemDark);
    
    // Remove all theme classes first
    document.documentElement.classList.remove('dark', 'light', 'high-contrast-light', 'high-contrast-dark');
    
    // Apply the selected theme
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      if (selectedTheme === 'high-contrast-dark') {
        document.documentElement.classList.add('high-contrast-dark');
      }
    } else {
      if (selectedTheme === 'high-contrast-light') {
        document.documentElement.classList.add('high-contrast-light');
      }
    }
    
    setIsDark(isDarkMode);
  };

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    
    if (savedTheme) {
      setThemeState(savedTheme);
    }
    
    applyTheme(savedTheme || 'system');

    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};