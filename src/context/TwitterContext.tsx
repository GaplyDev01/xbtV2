import React, { createContext, useContext, useState, useEffect } from 'react';
import { TwitterSearchResponse, Tweet, getTwitterListTimeline } from '../services/twitterApi';

interface TwitterContextType {
  searchResults: TwitterSearchResponse | null;
  listTimeline: Tweet[] | null;
  setSearchResults: (results: TwitterSearchResponse | null) => void;
  setListTimeline: (timeline: Tweet[] | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  refreshTwitterData: () => Promise<void>;
}

const TwitterContext = createContext<TwitterContextType | undefined>(undefined);

export const useTwitter = () => {
  const context = useContext(TwitterContext);
  if (!context) {
    throw new Error('useTwitter must be used within a TwitterProvider');
  }
  return context;
};

export const TwitterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchResults, setSearchResults] = useState<TwitterSearchResponse | null>(null);
  const [listTimeline, setListTimeline] = useState<Tweet[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTwitterData = async () => {
    try {
      setIsLoading(true);
      const timeline = await getTwitterListTimeline();
      setListTimeline(timeline);
    } catch (err) {
      console.error('Error fetching Twitter timeline:', err);
      setError(err instanceof Error ? err.message : 'Failed to load Twitter timeline');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Twitter timeline on component mount
  useEffect(() => {
    fetchTwitterData();

    // Refresh timeline every 5 minutes
    const refreshInterval = setInterval(fetchTwitterData, 300000);
    return () => clearInterval(refreshInterval);
  }, []);

  const refreshTwitterData = async () => {
    await fetchTwitterData();
  };

  return (
    <TwitterContext.Provider value={{
      searchResults,
      listTimeline,
      setSearchResults,
      setListTimeline,
      isLoading,
      setIsLoading,
      error,
      setError,
      refreshTwitterData
    }}>
      {children}
    </TwitterContext.Provider>
  );
};