import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Laptop } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-1 bg-theme-bg border border-theme-border rounded-full p-1 relative z-50">
      <button
        className={`p-1.5 rounded-full ${theme === 'light' || theme === 'high-contrast-light' ? 'bg-theme-accent text-theme-bg' : 'text-theme-text-secondary hover:text-theme-text-primary'}`}
        onClick={() => setTheme(theme === 'light' ? 'high-contrast-light' : 'light')}
        title={theme === 'light' ? 'Switch to High Contrast Light' : 'Light mode'}
        type="button"
      >
        <Sun size={14} />
      </button>
      <button
        className={`p-1.5 rounded-full ${theme === 'dark' || theme === 'high-contrast-dark' ? 'bg-theme-accent text-theme-bg' : 'text-theme-text-secondary hover:text-theme-text-primary'}`}
        onClick={() => setTheme(theme === 'dark' ? 'high-contrast-dark' : 'dark')}
        title={theme === 'dark' ? 'Switch to High Contrast Dark' : 'Dark mode'}
        type="button"
      >
        <Moon size={14} />
      </button>
      <button
        className={`p-1.5 rounded-full ${theme === 'system' ? 'bg-theme-accent text-theme-bg' : 'text-theme-text-secondary hover:text-theme-text-primary'}`}
        onClick={() => setTheme('system')}
        title="System preference"
        type="button"
      >
        <Laptop size={14} />
      </button>
    </div>
  );
};

export default ThemeToggle;