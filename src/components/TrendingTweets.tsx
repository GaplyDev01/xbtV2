import React, { useState, useEffect } from 'react';
import TwitterIcon from './ui/icons/TwitterIcon';

interface TrendingTweet {
  name: string;
  description: string | null;
  context: string | null;
}

const TrendingTweets: React.FC = () => {
  const [trends, setTrends] = useState<TrendingTweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchTrendingTweets = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch('/api/twitter/trends', {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API returned ${response.status} ${response.statusText}: ${errorText}`);
        }

        const data = await response.json();
        
        if (!data.trends || !Array.isArray(data.trends)) {
          throw new Error('Invalid response format');
        }

        setTrends(data.trends);
      } catch (err) {
        console.error('Error fetching trending tweets:', err);
        
        // Set a user-friendly error message
        const errorMessage = err instanceof Error ? err.message : 'Failed to load trending tweets';
        setError(errorMessage);
        
        // Set fallback data
        setTrends([
          {
            name: '#Crypto',
            description: 'Cryptocurrency market updates',
            context: null
          },
          {
            name: '#Bitcoin',
            description: 'BTC price movement',
            context: null
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingTweets();

    // Refresh trends every 5 minutes
    const refreshInterval = setInterval(fetchTrendingTweets, 300000);
    return () => clearInterval(refreshInterval);
  }, []);

  useEffect(() => {
    if (trends.length === 0) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % trends.length);
    }, 5000); // Change tweet every 5 seconds

    return () => clearInterval(intervalId);
  }, [trends]);

  if (isLoading) {
    return (
      <div className="flex items-center text-theme-text-secondary">
        <TwitterIcon className="mr-1 animate-pulse" />
        <span>Loading trends...</span>
      </div>
    );
  }

  if (error && trends.length === 0) {
    return (
      <div className="flex items-center text-theme-text-secondary">
        <TwitterIcon className="mr-1" />
        <span>Unable to load trends</span>
      </div>
    );
  }

  if (trends.length === 0) {
    return (
      <div className="flex items-center text-theme-text-secondary">
        <TwitterIcon className="mr-1" />
        <span>No trends available</span>
      </div>
    );
  }

  const currentTrend = trends[currentIndex];

  return (
    <div className="flex items-center text-theme-text-secondary overflow-hidden">
      <TwitterIcon className="mr-1 flex-shrink-0" />
      <div className="truncate">
        <span className="text-theme-accent">{currentTrend.name}</span>
        {currentTrend.description && (
          <span className="ml-1 text-theme-text-secondary">
            {currentTrend.description}
          </span>
        )}
        {currentTrend.context && (
          <span className="ml-1 text-theme-text-secondary opacity-75">
            • {currentTrend.context}
          </span>
        )}
      </div>
    </div>
  );
};

export default TrendingTweets;