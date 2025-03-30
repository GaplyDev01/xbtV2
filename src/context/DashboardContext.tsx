import React, { createContext, useContext, useState, useEffect } from 'react';
import { useOnboarding } from './OnboardingContext';

export interface CardConfig {
  id: string;
  title: string;
  type: 'market' | 'portfolio' | 'social' | 'tools';
  component: string;
  gridArea?: string;
  settings?: Record<string, any>;
}

interface DashboardContextType {
  cards: CardConfig[];
  addCard: (card: CardConfig) => void;
  removeCard: (id: string) => void;
  updateCardSettings: (id: string, settings: Record<string, any>) => void;
  selectedToken: string | null;
  setSelectedToken: (token: string | null) => void;
  dashboardType: 'trading' | 'investing' | 'research';
  setDashboardType: (type: 'trading' | 'investing' | 'research') => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

// Default layouts for different dashboard types
const tradingCards: CardConfig[] = [
  {
    id: 'market-overview',
    title: 'Market Overview',
    type: 'market',
    component: 'MarketOverview',
    gridArea: '1 / 1 / 2 / 3'
  },
  {
    id: 'twitter-feed',
    title: 'Twitter Feed',
    type: 'social',
    component: 'TwitterFeed',
    gridArea: '2 / 1 / 3 / 2'
  },
  {
    id: 'alerts',
    title: 'Alerts',
    type: 'tools',
    component: 'Alerts',
    gridArea: '2 / 3 / 3 / 4'
  }
];

const investingCards: CardConfig[] = [
  {
    id: 'portfolio-overview',
    title: 'Portfolio Overview',
    type: 'portfolio',
    component: 'PortfolioOverview',
    gridArea: '1 / 1 / 2 / 3'
  },
  {
    id: 'watchlist',
    title: 'Watchlist',
    type: 'portfolio',
    component: 'Watchlist',
    gridArea: '1 / 3 / 2 / 4'
  },
  {
    id: 'news-feed',
    title: 'News Feed',
    type: 'social',
    component: 'NewsFeed',
    gridArea: '2 / 1 / 3 / 2'
  },
  {
    id: 'social-sentiment',
    title: 'Social Sentiment',
    type: 'social',
    component: 'SocialSentiment',
    gridArea: '2 / 2 / 3 / 3'
  },
  {
    id: 'alerts',
    title: 'Price Alerts',
    type: 'tools',
    component: 'Alerts',
    gridArea: '2 / 3 / 3 / 4'
  }
];

const researchCards: CardConfig[] = [
  {
    id: 'token-metrics',
    title: 'Token Metrics',
    type: 'market',
    component: 'TokenMetrics',
    gridArea: '1 / 1 / 2 / 2'
  },
  {
    id: 'developer-activity',
    title: 'Developer Activity',
    type: 'social',
    component: 'DeveloperActivity',
    gridArea: '1 / 2 / 2 / 3'
  },
  {
    id: 'social-sentiment',
    title: 'Social Sentiment',
    type: 'social',
    component: 'SocialSentiment',
    gridArea: '1 / 3 / 2 / 4'
  },
  {
    id: 'news-feed',
    title: 'Research & Analysis',
    type: 'social',
    component: 'NewsFeed',
    gridArea: '2 / 1 / 3 / 3'
  }
];

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userPreferences } = useOnboarding();
  const [dashboardType, setDashboardType] = useState<'trading' | 'investing' | 'research'>('trading');
  const [cards, setCards] = useState<CardConfig[]>([]);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);

  // Load saved dashboard type and cards from localStorage
  useEffect(() => {
    const savedType = localStorage.getItem('dashboardType');
    const savedCards = localStorage.getItem('dashboardCards');

    if (savedType) {
      setDashboardType(savedType as 'trading' | 'investing' | 'research');
    }

    if (savedCards) {
      try {
        setCards(JSON.parse(savedCards));
      } catch (error) {
        console.error('Error loading saved cards:', error);
        // Use default cards based on type
        setCards(getDefaultCards(dashboardType));
      }
    } else {
      // Use default cards based on type
      setCards(getDefaultCards(dashboardType));
    }
  }, []);

  // Update cards when dashboard type changes
  useEffect(() => {
    setCards(getDefaultCards(dashboardType));
    localStorage.setItem('dashboardType', dashboardType);
  }, [dashboardType]);

  // Save cards to localStorage when they change
  useEffect(() => {
    localStorage.setItem('dashboardCards', JSON.stringify(cards));
  }, [cards]);

  // Set default token from user preferences
  useEffect(() => {
    if (userPreferences?.defaultToken) {
      setSelectedToken(userPreferences.defaultToken);
    }
  }, [userPreferences]);

  const getDefaultCards = (type: 'trading' | 'investing' | 'research'): CardConfig[] => {
    switch (type) {
      case 'trading':
        return tradingCards;
      case 'investing':
        return investingCards;
      case 'research':
        return researchCards;
      default:
        return tradingCards;
    }
  };

  const addCard = (card: CardConfig) => {
    setCards(prev => [...prev, card]);
  };

  const removeCard = (id: string) => {
    setCards(prev => prev.filter(card => card.id !== id));
  };

  const updateCardSettings = (id: string, settings: Record<string, any>) => {
    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, settings: { ...card.settings, ...settings } } : card
    ));
  };

  return (
    <DashboardContext.Provider value={{
      cards,
      addCard,
      removeCard,
      updateCardSettings,
      selectedToken,
      setSelectedToken,
      dashboardType,
      setDashboardType
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export default DashboardProvider;