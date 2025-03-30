import React, { useState, useEffect, useRef } from 'react';
import { Search, X, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { CoinSearchResult } from '../../services/cryptoApi';
import { cn } from '../../utils/cn';

interface BaseTokenSearchProps {
  onSelectToken?: (token: CoinSearchResult) => void;
  platform?: 'all' | 'ethereum' | 'solana' | 'bitcoin';
  className?: string;
  placeholder?: string;
  variant?: 'default' | 'minimal' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  maxResults?: number;
  autoFocus?: boolean;
}

const BaseTokenSearch: React.FC<BaseTokenSearchProps> = ({
  onSelectToken,
  platform = 'all',
  className = '',
  placeholder = 'Search tokens...',
  variant = 'default',
  size = 'md',
  maxResults = 7,
  autoFocus = false
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CoinSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSearch = async () => {
    if (!query || query.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const options = {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'x-cg-pro-api-key': 'CG-qsva2ctaarLBpZ3KDqYmzu6p'
        }
      };
      
      const response = await fetch(`https://pro-api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`, options);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filter results based on platform if specified
      let filteredResults = data.coins;
      if (platform !== 'all') {
        filteredResults = data.coins.filter((coin: any) => {
          return coin.platforms && Object.keys(coin.platforms).some(p => 
            p.toLowerCase().includes(platform.toLowerCase())
          );
        });
      }
      
      setResults(filteredResults.slice(0, maxResults));
      
      if (filteredResults.length === 0) {
        setError(`No ${platform !== 'all' ? platform + ' ' : ''}tokens found matching "${query}"`);
      }
    } catch (err) {
      console.error('Error searching tokens:', err);
      setError('Failed to search tokens. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, platform]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showResults) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelectToken(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        break;
    }
  };

  const handleSelectToken = (token: CoinSearchResult) => {
    if (onSelectToken) {
      onSelectToken(token);
    }
    setQuery('');
    setResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
  };

  const sizeClasses = {
    sm: 'text-sm py-1.5 px-3',
    md: 'text-base py-2 px-4',
    lg: 'text-lg py-3 px-5'
  };

  const variantClasses = {
    default: 'border border-theme-border rounded-lg',
    minimal: 'border-none bg-transparent',
    pill: 'rounded-full'
  };

  return (
    <div className={cn('relative', className)} ref={searchRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(e.target.value.length >= 2);
          }}
          onFocus={() => {
            if (query.length >= 2) {
              setShowResults(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'w-full bg-theme-bg text-theme-text-primary',
            'focus:outline-none focus:ring-2 focus:ring-theme-accent/50',
            sizeClasses[size],
            variantClasses[variant]
          )}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-theme-accent animate-spin" />
          ) : query ? (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                setShowResults(false);
              }}
              className="text-theme-text-secondary hover:text-theme-text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <Search className="w-4 h-4 text-theme-text-secondary" />
          )}
        </div>
      </div>

      {showResults && (results.length > 0 || error) && (
        <div className="absolute z-50 w-full mt-1 bg-theme-bg border border-theme-border rounded-lg shadow-lg overflow-hidden">
          {error ? (
            <div className="p-4 text-center">
              <AlertCircle className="w-6 h-6 text-theme-accent mx-auto mb-2" />
              <p className="text-sm text-theme-text-secondary">{error}</p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className={cn(
                    'p-3 flex items-center cursor-pointer',
                    'hover:bg-theme-accent/10',
                    selectedIndex === index && 'bg-theme-accent/5',
                    'border-b border-theme-border last:border-0'
                  )}
                  onClick={() => handleSelectToken(result)}
                >
                  {result.thumb ? (
                    <img
                      src={result.thumb}
                      alt={result.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-theme-accent/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-theme-accent">
                        {result.symbol.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-theme-text-primary">
                        {result.name}
                      </span>
                      {selectedIndex === index && (
                        <CheckCircle className="w-4 h-4 text-theme-accent" />
                      )}
                    </div>
                    <div className="text-sm text-theme-text-secondary">
                      {result.symbol.toUpperCase()}
                      {result.market_cap_rank && (
                        <span className="ml-2 text-xs bg-theme-accent/10 text-theme-accent px-1.5 py-0.5 rounded-full">
                          #{result.market_cap_rank}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BaseTokenSearch;