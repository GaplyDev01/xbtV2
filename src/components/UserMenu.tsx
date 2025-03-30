import React, { useState, useRef, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  LogOut, 
  CreditCard, 
  HelpCircle, 
  ChevronDown, 
  Bell
} from 'lucide-react';

interface UserMenuProps {
  user: User;
  onLogout: () => void;
  onSettings: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout, onSettings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Safely get display name from user metadata or email
  const getDisplayName = () => {
    if (!user) return '';
    const metadata = user.user_metadata;
    return metadata?.name || user.email?.split('@')[0] || '';
  };

  // Get first letter for avatar
  const getAvatarLetter = () => {
    const displayName = getDisplayName();
    return displayName ? displayName.charAt(0).toUpperCase() : '?';
  };

  const handleMenuItemClick = (action: string) => {
    setIsOpen(false);
    switch (action) {
      case 'settings':
        navigate('/settings');
        break;
      case 'notifications':
        navigate('/settings?tab=notifications');
        break;
      case 'subscription':
        navigate('/settings?tab=subscription');
        break;
      case 'help':
        navigate('/help');
        break;
      case 'logout':
        onLogout();
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center space-x-1 text-xs bg-theme-bg hover:bg-theme-accent/10 text-theme-text-primary px-2 py-1 rounded-full border border-theme-border transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-theme-accent to-theme-accent-dark flex items-center justify-center text-theme-bg">
          {getAvatarLetter()}
        </div>
        <span className="max-w-[80px] truncate hidden sm:inline">{getDisplayName()}</span>
        <ChevronDown size={14} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-theme-bg rounded-lg shadow-lg z-50 border border-theme-border overflow-hidden">
          <div className="p-4 border-b border-theme-border">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-theme-accent to-theme-accent-dark flex items-center justify-center text-theme-bg text-lg font-semibold mr-3">
                {getAvatarLetter()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-theme-text-primary truncate">{getDisplayName()}</div>
                <div className="text-xs text-theme-text-secondary truncate">{user.email}</div>
              </div>
            </div>
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-theme-accent/20 text-theme-accent">
                Free Plan
              </span>
            </div>
          </div>

          <div className="py-2">
            <button
              onClick={() => handleMenuItemClick('settings')}
              className="w-full text-left px-4 py-2 text-sm text-theme-text-primary hover:bg-theme-accent/10 flex items-center"
            >
              <Settings size={16} className="mr-3 text-theme-text-secondary" />
              Account Settings
            </button>
            <button
              onClick={() => handleMenuItemClick('notifications')}
              className="w-full text-left px-4 py-2 text-sm text-theme-text-primary hover:bg-theme-accent/10 flex items-center"
            >
              <Bell size={16} className="mr-3 text-theme-text-secondary" />
              Notification Preferences
            </button>
            <button
              onClick={() => handleMenuItemClick('subscription')}
              className="w-full text-left px-4 py-2 text-sm text-theme-text-primary hover:bg-theme-accent/10 flex items-center"
            >
              <CreditCard size={16} className="mr-3 text-theme-text-secondary" />
              Subscription
            </button>
            <button
              onClick={() => handleMenuItemClick('help')}
              className="w-full text-left px-4 py-2 text-sm text-theme-text-primary hover:bg-theme-accent/10 flex items-center"
            >
              <HelpCircle size={16} className="mr-3 text-theme-text-secondary" />
              Help & Support
            </button>
          </div>

          <div className="py-2 border-t border-theme-border">
            <button
              onClick={() => handleMenuItemClick('logout')}
              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-theme-accent/10 flex items-center"
            >
              <LogOut size={16} className="mr-3 text-red-400" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;