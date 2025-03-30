import React, { createContext, useContext, useState, useEffect } from 'react';
import { CoinSearchResult } from '../services/cryptoApi';
import { useAlerts } from './AlertContext';

export interface TokenWithDetails {
  token: CoinSearchResult;
  details: any | null;
  addedAt: number;
  hasNotifications?: boolean;
}

interface TokenContextType {
  selectedToken: CoinSearchResult | null;
  tokenDetails: any | null;
  tokenHistory: TokenWithDetails[];
  setSelectedToken: (token: CoinSearchResult | null) => void;
  setTokenDetails: (details: any | null) => void;
  addTokenToHistory: (token: CoinSearchResult, details: any | null) => void;
  removeTokenFromHistory: (tokenId: string) => void;
  selectTokenFromHistory: (tokenId: string) => void;
  getTokenNotificationStatus: (tokenId: string) => boolean;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const useToken = () => {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useToken must be used within a TokenProvider');
  }
  return context;
};

export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedToken, setSelectedToken] = useState<CoinSearchResult | null>(null);
  const [tokenDetails, setTokenDetails] = useState<any | null>(null);
  const [tokenHistory, setTokenHistory] = useState<TokenWithDetails[]>([]);
  const { alerts } = useAlerts();
  
  // Load token history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('tokenHistory');
    if (savedHistory) {
      try {
        setTokenHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error loading token history:', e);
      }
    }
  }, []);
  
  // Save token history to localStorage when it changes
  useEffect(() => {
    if (tokenHistory.length > 0) {
      localStorage.setItem('tokenHistory', JSON.stringify(tokenHistory));
    }
  }, [tokenHistory]);

  // Update notification status for tokens when alerts change
  useEffect(() => {
    if (alerts.length > 0 && tokenHistory.length > 0) {
      setTokenHistory(prev => 
        prev.map(item => ({
          ...item,
          hasNotifications: alerts.some(alert => 
            alert.active && 
            alert.asset.toLowerCase() === item.token.id.toLowerCase())
        }))
      );
    }
  }, [alerts]);

  const addTokenToHistory = (token: CoinSearchResult, details: any | null) => {
    // First check if token already exists in history
    const existingIndex = tokenHistory.findIndex(item => item.token.id === token.id);
    
    if (existingIndex >= 0) {
      // Move to top of history if it exists
      const updatedHistory = [...tokenHistory];
      const existingItem = updatedHistory.splice(existingIndex, 1)[0];
      updatedHistory.unshift({
        ...existingItem,
        details: details || existingItem.details,
        addedAt: Date.now()
      });
      setTokenHistory(updatedHistory);
    } else {
      // Add new token to history
      const hasNotifications = alerts.some(alert => 
        alert.active && 
        alert.asset.toLowerCase() === token.id.toLowerCase());
        
      setTokenHistory(prev => [{
        token,
        details,
        addedAt: Date.now(),
        hasNotifications
      }, ...prev]);
    }
  };

  const removeTokenFromHistory = (tokenId: string) => {
    setTokenHistory(prev => prev.filter(item => item.token.id !== tokenId));
  };

  const selectTokenFromHistory = (tokenId: string) => {
    const historyItem = tokenHistory.find(item => item.token.id === tokenId);
    if (historyItem) {
      setSelectedToken(historyItem.token);
      setTokenDetails(historyItem.details);
    }
  };

  const getTokenNotificationStatus = (tokenId: string): boolean => {
    const historyItem = tokenHistory.find(item => item.token.id === tokenId);
    return historyItem?.hasNotifications || false;
  };

  return (
    <TokenContext.Provider value={{
      selectedToken,
      tokenDetails,
      tokenHistory,
      setSelectedToken,
      setTokenDetails,
      addTokenToHistory,
      removeTokenFromHistory,
      selectTokenFromHistory,
      getTokenNotificationStatus
    }}>
      {children}
    </TokenContext.Provider>
  );
};