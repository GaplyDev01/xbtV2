import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { CoinSearchResult } from '../../../services/cryptoApi';
import { searchTokenOnTwitter } from '../../../services/twitterApi';
import { useTwitter } from '../../../context/TwitterContext';
import { cn } from '../../../utils/cn';
import './styles.css';

interface TokenSearchProps {
  onSelectToken?: (token: CoinSearchResult) => void;
  platform?: 'all' | 'ethereum' | 'solana' | 'bitcoin';
  className?: string;
  placeholder?: string;
  variant?: 'default' | 'minimal' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  maxResults?: number;
  autoFocus?: boolean;
}

const TokenSearch: React.FC<TokenSearchProps> = ({
  onSelectToken,
  platform = 'all',
  className = '',
  placeholder = `Search ${platform !== 'all' ? platform + ' ' : ''}tokens...`,
  variant = 'default',
  size = 'md',
  maxResults = 7,
  autoFocus = false
}) => {
  const { setSearchResults, setIsLoading: setTwitterLoading, setError: setTwitterError } = useTwitter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CoinSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Search API
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
          'x-cg-pro-api-key': 'CG-gTgiBRydF4PqMfgYZ4Wr6fxB'
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

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, platform]);

  // Keyboard navigation
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

  const handleSelectToken = async (token: CoinSearchResult) => {
    if (onSelectToken) {
      onSelectToken(token);
      setTwitterLoading(true);
      
      try {
        // Search Twitter for token information
        const results = await searchTokenOnTwitter(token.symbol, token.name);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching Twitter:', error);
        setTwitterError(error instanceof Error ? error.message : 'Failed to fetch Twitter data');
      } finally {
        setTwitterLoading(false);
      }
    }
    
    setQuery('');
    setResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
  };

  // Style variants
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
    <div className={cn('token-search-container', className)} ref={searchRef}>
      <div className="token-search-input-wrapper">
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
            'token-search-input',
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
        <div className="token-search-results">
          {error ? (
            <div className="token-search-error">
              <AlertCircle className="w-6 h-6 text-theme-accent mx-auto mb-2" />
              <p>{error}</p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className={cn(
                    'token-search-result-item',
                    selectedIndex === index && 'selected'
                  )}
                  onClick={() => handleSelectToken(result)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  {result.thumb ? (
                    <img
                      src={result.thumb}
                      alt={result.name}
                      className="token-search-result-image"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        const nextElement = img.nextElementSibling as HTMLElement;
                        if (nextElement) {
                          nextElement.style.display = 'flex';
                        }
                      }}
                    />
                  ) : (
                    <div className="token-search-result-image flex items-center justify-center">
                      <span className="text-sm font-bold text-theme-accent">
                        {result.symbol.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  <div className="token-search-result-content">
                    <div className="token-search-result-name">{result.name}</div>
                    <div className="token-search-result-symbol">
                      <span>{result.symbol.toUpperCase()}</span>
                      {result.market_cap_rank && (
                        <span className="ml-2 text-xs bg-theme-accent/10 text-theme-accent px-1.5 py-0.5 rounded-full">
                          #{result.market_cap_rank}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {selectedIndex === index && (
                    <CheckCircle className="w-4 h-4 text-theme-accent" />
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="token-search-hint">
            <span>Navigate with</span>
            <span className="token-search-key">↑</span>
            <span className="token-search-key">↓</span>
            <span>and select with</span>
            <span className="token-search-key">Enter</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenSearch;