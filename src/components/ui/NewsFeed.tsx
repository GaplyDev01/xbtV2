import React, { useState, useEffect, useMemo } from 'react';
import { ExternalLink, Clock, RefreshCw, AlertTriangle, Tag, Newspaper } from 'lucide-react';
import { getLatestNews, getNewsForToken, NewsArticle } from '../../services/newsApi';
import { useToken } from '../../context/TokenContext';

const NewsFeed: React.FC = () => {
  const { selectedToken } = useToken();
  const [newsItems, setNewsItems] = useState<NewsArticle[]>([]);
  const [allNewsItems, setAllNewsItems] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeFrame, setTimeFrame] = useState<'24h' | '7d' | '30d'>('24h');

  const fetchNews = async () => {
    setIsLoading(true);
    setError(null);
    let retryCount = 0;
    const maxRetries = 3;

    try {
      while (retryCount < maxRetries) {
        try {
          // If a token is selected, try to get specific news
          let articles: NewsArticle[] = [];
          if (selectedToken) {
            console.log(`Fetching news for token ${selectedToken.symbol}...`);
            articles = await getNewsForToken(selectedToken.symbol, 1, 20);
          }
          
          // If no token-specific news or no token selected, get general news
          if (!articles.length || !selectedToken) {
            console.log(`Fetching general crypto news...`);
            articles = await getLatestNews(1, 20, timeFrame);
          }
          
          console.log(`Fetched ${articles.length} news articles`);
          setAllNewsItems(articles);
          setNewsItems(articles);
          break;
        } catch (err) {
          console.error(`Attempt ${retryCount + 1} failed:`, err);
          retryCount++;
          if (retryCount === maxRetries) {
            throw err;
          }
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Unknown error';
      setError(`Failed to fetch news: ${errorMessage}`);
      console.error('Error fetching news:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter news based on selected token
  useEffect(() => {
    if (selectedToken && allNewsItems.length > 0) {
      const tokenSymbol = selectedToken.symbol.toLowerCase();
      const tokenName = selectedToken.name.toLowerCase();
      
      const filteredNews = allNewsItems.filter(article => {
        const title = article.title.toLowerCase();
        const summary = article.summary.toLowerCase();
        return title.includes(tokenSymbol) || title.includes(tokenName) || 
               summary.includes(tokenSymbol) || summary.includes(tokenName);
      });
      
      setNewsItems(filteredNews.length > 0 ? filteredNews : allNewsItems.slice(0, 10));
    } else {
      setNewsItems(allNewsItems.slice(0, 10));
    }
  }, [selectedToken, allNewsItems]);

  useEffect(() => {
    fetchNews();
    
    // Set up a refresh interval for the news (every 5 minutes)
    const intervalId = setInterval(fetchNews, 300000);
    
    // Clean up the interval when component unmounts
    return () => clearInterval(intervalId);
  }, [timeFrame, selectedToken]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };
  
  // Create a title that indicates if we're showing filtered results
  const feedTitle = useMemo(() => {
    if (selectedToken) {
      return `News${newsItems.length < allNewsItems.length ? ` • ${selectedToken.symbol.toUpperCase()}` : ''}`;
    }
    return 'Latest Crypto News';
  }, [selectedToken, newsItems.length, allNewsItems.length]);

  return (
    <div className="h-full">
      <div className="flex items-center mb-2">
        <div className="flex items-center">
          {selectedToken && newsItems.length < allNewsItems.length && (
            <Tag size={12} className="mr-1 text-theme-accent" />
          )}
          <span className="text-[10px] font-medium text-theme-text-primary mr-2">{feedTitle}</span>
        </div>
        <div className="flex space-x-1 ml-auto">
          <button
            className="text-[9px] px-2 py-0.5 rounded-full bg-theme-accent/10 text-theme-accent hover:bg-theme-accent/20"
            onClick={fetchNews}
            disabled={isLoading}
          >
            <RefreshCw size={12} className={`${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw size={24} className="text-theme-accent animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 text-theme-accent">
          <AlertTriangle size={24} className="mb-2" />
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchNews}
            className="mt-4 text-xs bg-theme-accent/10 hover:bg-theme-accent/20 text-theme-accent px-3 py-1.5 rounded-lg"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="space-y-3 overflow-auto max-h-[calc(100%-30px)]">
          {newsItems.length > 0 ? (
            newsItems.map((item, index) => (
              <div key={index} className="p-3 hover:bg-theme-accent/5 border-b border-theme-border last:border-b-0 rounded-lg transition-colors">
                <div className="flex items-start gap-3">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-theme-accent/10 rounded-md flex items-center justify-center flex-shrink-0">
                      <Newspaper size={24} className="text-theme-accent/40" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-[13px] font-medium text-theme-text-primary leading-tight mb-1">
                        {item.title}
                      </h4>
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-theme-accent hover:text-theme-accent-dark ml-2 flex-shrink-0"
                      >
                        <ExternalLink size={12} />
                      </a>
                    </div>
                    <div className="text-[10px] text-theme-text-secondary mb-2 line-clamp-2">
                      {item.summary}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-theme-accent">
                        {item.source || item.authors?.[0]?.name || 'Unknown'}
                      </span>
                      <span className="flex items-center text-[10px] text-theme-text-secondary">
                        <Clock size={10} className="mr-0.5" />
                        {formatTimeAgo(item.published)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-theme-text-secondary">No news articles found</p>
              <button
                onClick={fetchNews}
                className="mt-4 text-xs bg-theme-accent/10 hover:bg-theme-accent/20 text-theme-accent px-3 py-1.5 rounded-lg"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NewsFeed;