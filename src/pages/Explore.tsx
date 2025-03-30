import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { useCrypto } from '../context/CryptoContext';
import { useToken } from '../context/TokenContext';
import { useAlerts } from '../context/AlertContext';
import { useGroqAI, TokenData } from '../context/GroqAIContext';
import { CoinSearchResult, Category } from '../services/cryptoApi';
import TokenSearch from '../components/common/TokenSearch/TokenSearch';
import TwitterFeed from '../components/dashboard/cards/social/TwitterFeed';
import SecondaryTwitterFeed from '../components/ui/SecondaryTwitterFeed';
import PriceChart from '../components/charts/PriceChart';
import { DeveloperActivity, SocialSentiment, NewsFeed } from '../components/ui';
import TradingSignals from '../components/ui/TradingSignals';
import { useNavigate } from 'react-router-dom';
import { 
  Loader2, 
  Star, 
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowRight
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/chartUtils';

// Add ImportMeta interface extension for TypeScript
declare global {
  interface ImportMeta {
    env: Record<string, string>;
  }
}

interface CategoryToken {
  id: string;
  name: string;
  symbol: string;
  market_cap: number;
  price_change_24h: number;
  current_price: number;
  volume_24h: number;
}

interface EnhancedCategory extends Category {
  top_tokens: CategoryToken[];
}

// Define a TokenDetails interface for the API response
interface TokenDetails {
  id: string;
  name: string;
  symbol: string;
  image?: {
    thumb?: string;
    small?: string;
    large?: string;
  };
  market_data?: {
    current_price?: {
      usd?: number;
      [key: string]: number | undefined;
    };
    market_cap?: {
      usd?: number;
      [key: string]: number | undefined;
    };
    total_volume?: {
      usd?: number;
      [key: string]: number | undefined;
    };
    price_change_percentage_24h?: number;
    market_cap_rank?: number;
    circulating_supply?: number;
    max_supply?: number | null;
    ath?: {
      usd?: number;
      [key: string]: number | undefined;
    };
    atl?: {
      usd?: number;
      [key: string]: number | undefined;
    };
  };
  description?: {
    en?: string;
    [key: string]: string | undefined;
  };
}

const Explore: React.FC = () => {
  const { getCoinsMarketData, getCategories } = useCrypto();
  const { selectedToken, setSelectedToken, tokenDetails, setTokenDetails } = useToken();
  const { addAlert } = useAlerts();
  const { generateInsights, navigateToChat } = useGroqAI();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState<EnhancedCategory[]>([]);
  const [displayedCategories, setDisplayedCategories] = useState<EnhancedCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('search');
  const [categorySearch, setCategorySearch] = useState('');
  const [currentCategoryPage, setCurrentCategoryPage] = useState(0);
  const [categoriesPerPage] = useState(6);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof EnhancedCategory;
    direction: 'asc' | 'desc';
  }>({
    key: 'market_cap',
    direction: 'desc'
  });
  const [autoScroll, setAutoScroll] = useState(true);
  const [tokenInsights, setTokenInsights] = useState<string | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  useEffect(() => {
    if (!autoScroll || categories.length === 0) return;

    const interval = setInterval(() => {
      setCurrentCategoryPage(prev => 
        prev >= Math.ceil(categories.length / categoriesPerPage) - 1 ? 0 : prev + 1
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [autoScroll, categories.length, categoriesPerPage]);

  const fetchCategoryData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const categoryData = await getCategories();
      
      const enhancedCategories = await Promise.all(
        categoryData.map(async (category) => {
          try {
            const tokens = await getCoinsMarketData('usd', undefined, 'market_cap_desc', 10, category.id);
            return {
              ...category,
              top_tokens: tokens.map(token => ({
                id: token.id,
                name: token.name,
                symbol: token.symbol,
                market_cap: token.market_cap,
                price_change_24h: token.price_change_percentage_24h,
                current_price: token.current_price,
                volume_24h: token.total_volume
              }))
            };
          } catch (err) {
            console.error(`Error fetching tokens for category ${category.id}:`, err);
            return {
              ...category,
              top_tokens: []
            };
          }
        })
      );

      setCategories(enhancedCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  }, [getCategories, getCoinsMarketData]);

  useEffect(() => {
    fetchCategoryData();
  }, [fetchCategoryData]);

  useEffect(() => {
    let filtered = [...categories];
    
    if (categorySearch) {
      const searchLower = categorySearch.toLowerCase();
      filtered = filtered.filter(category => 
        category.name.toLowerCase().includes(searchLower) ||
        category.top_tokens.some(token => 
          token.name.toLowerCase().includes(searchLower) ||
          token.symbol.toLowerCase().includes(searchLower)
        )
      );
    }
    
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
    
    setDisplayedCategories(filtered);
  }, [categories, categorySearch, sortConfig]);

  const handleSort = (key: keyof Category) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleTokenSelect = async (token: CoinSearchResult) => {
    setSelectedToken(token);
    setIsLoading(true);
    setTokenInsights(null);
    
    try {
      const response = await fetch(
        `https://pro-api.coingecko.com/api/v3/coins/${token.id}?localization=false&tickers=true&market_data=true&community_data=true&developer_data=true&sparkline=true`,
        {
          headers: { 
            'accept': 'application/json', 
            'x-cg-pro-api-key': import.meta.env.VITE_COINGECKO_API_KEY || 'CG-gTgiBRydF4PqMfgYZ4Wr6fxB'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const details = await response.json();
      setTokenDetails(details);
      
      fetchTokenInsights(token, details);
    } catch (err) {
      console.error('Error fetching token details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch token details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTokenInsights = async (token: CoinSearchResult, details: TokenDetails) => {
    setIsLoadingInsights(true);
    setInsightsError(null);
    
    try {
      const tokenData: TokenData = {
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        price: details.market_data?.current_price?.usd,
        market_cap: details.market_data?.market_cap?.usd,
        volume_24h: details.market_data?.total_volume?.usd,
        price_change_24h: details.market_data?.price_change_percentage_24h,
        ath: details.market_data?.ath?.usd,
        atl: details.market_data?.atl?.usd,
        description: details.description?.en
      };
      
      const insights = await generateInsights(tokenData);
      setTokenInsights(insights);
    } catch (err) {
      console.error('Error generating token insights:', err);
      setInsightsError('Failed to generate insights. Please try again later.');
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const handleContinueInChat = () => {
    if (selectedToken) {
      navigateToChat(selectedToken);
    }
  };

  const handleAddToWatchlist = () => {
    console.log('Add to watchlist:', selectedToken?.symbol);
  };

  const handleCreateAlert = () => {
    if (!selectedToken) return;

    addAlert({
      asset: selectedToken.id,
      condition: 'above',
      value: tokenDetails?.market_data?.current_price?.usd || 0,
      active: true,
      repeat: false,
      notificationType: 'app',
      notes: `Price alert for ${selectedToken.symbol.toUpperCase()}`
    });
  };

  const handlePageChange = (direction: 'prev' | 'next') => {
    setCurrentCategoryPage(prev => {
      const maxPage = Math.ceil(displayedCategories.length / categoriesPerPage) - 1;
      if (direction === 'prev') {
        return prev <= 0 ? maxPage : prev - 1;
      } else {
        return prev >= maxPage ? 0 : prev + 1;
      }
    });
  };

  const paginatedCategories = displayedCategories.slice(
    currentCategoryPage * categoriesPerPage,
    (currentCategoryPage + 1) * categoriesPerPage
  );

  const handleViewAllCoins = (categoryId: string) => {
    navigate(`/category/${categoryId}`);
  };

  return (
    <div className="space-y-4">
      <div className="bg-theme-bg bg-opacity-70 backdrop-blur-sm rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div className="mb-4 sm:mb-0">
            <h2 className="text-xl font-bold text-theme-text-primary">Explore Crypto</h2>
            <p className="text-sm text-theme-accent">Discover and analyze tokens</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="search">Token Search</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="signals">Trading Signals</TabsTrigger>
            {selectedToken && (
              <TabsTrigger value="analysis">Details</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="search">
            <div className="space-y-4">
              <div>
                <TokenSearch 
                  platform="all" 
                  onSelectToken={handleTokenSelect}
                  placeholder="Search for any token (e.g., BTC, ETH, SOL)..."
                />
              </div>
              
              {selectedToken && tokenDetails && (
                <div className="bg-theme-bg border border-theme-border rounded-lg p-4 mt-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      {tokenDetails.image?.thumb ? (
                        <img 
                          src={tokenDetails.image.thumb} 
                          alt={tokenDetails.name} 
                          className="w-10 h-10 rounded-full mr-3" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-theme-accent/20 flex items-center justify-center mr-3">
                          <span className="text-lg font-bold text-theme-accent">
                            {selectedToken.symbol.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <h2 className="text-xl font-bold text-theme-text-primary flex items-center">
                          {selectedToken.name}
                          <span className="ml-2 text-sm bg-theme-accent/10 text-theme-accent px-2 py-0.5 rounded-md">
                            {selectedToken.symbol.toUpperCase()}
                          </span>
                        </h2>
                        {tokenDetails.market_data?.market_cap_rank && (
                          <div className="text-sm text-theme-text-secondary">
                            Rank #{tokenDetails.market_data.market_cap_rank}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleAddToWatchlist}
                        className="p-2 bg-theme-bg border border-theme-border rounded-md text-theme-text-secondary hover:text-theme-accent transition-colors"
                        title="Add to Watchlist"
                      >
                        <Star size={16} />
                      </button>
                      <button
                        onClick={handleCreateAlert}
                        className="p-2 bg-theme-bg border border-theme-border rounded-md text-theme-text-secondary hover:text-theme-accent transition-colors"
                        title="Create Price Alert"
                      >
                        <Bell size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-theme-text-secondary mb-1">Price</div>
                      <div className="text-2xl font-bold text-theme-text-primary">
                        {formatCurrency(tokenDetails.market_data?.current_price?.usd)}
                      </div>
                      <div className={`text-sm font-medium ${
                        (tokenDetails.market_data?.price_change_percentage_24h || 0) >= 0 
                          ? 'text-green-500' 
                          : 'text-red-500'
                      }`}>
                        {formatPercentage(tokenDetails.market_data?.price_change_percentage_24h || 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-theme-text-secondary mb-1">Market Cap</div>
                      <div className="text-2xl font-bold text-theme-text-primary">
                        {formatCurrency(tokenDetails.market_data?.market_cap?.usd)}
                      </div>
                      <div className="text-sm text-theme-text-secondary">
                        Rank #{tokenDetails.market_data?.market_cap_rank || 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-80 mb-12 pb-4 relative">
                    <PriceChart tokenId={selectedToken.id} />
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
                    <div className="bg-theme-bg border border-theme-border rounded-md p-3">
                      <div className="text-xs text-theme-text-secondary">Circulating Supply</div>
                      <div className="text-sm font-medium text-theme-text-primary mt-1">
                        {tokenDetails.market_data?.circulating_supply?.toLocaleString()} {selectedToken.symbol.toUpperCase()}
                      </div>
                    </div>
                    <div className="bg-theme-bg border border-theme-border rounded-md p-3">
                      <div className="text-xs text-theme-text-secondary">Max Supply</div>
                      <div className="text-sm font-medium text-theme-text-primary mt-1">
                        {tokenDetails.market_data?.max_supply
                          ? tokenDetails.market_data.max_supply.toLocaleString()
                          : 'Unlimited'} {selectedToken.symbol.toUpperCase()}
                      </div>
                    </div>
                    <div className="bg-theme-bg border border-theme-border rounded-md p-3">
                      <div className="text-xs text-theme-text-secondary">ATH</div>
                      <div className="text-sm font-medium text-theme-text-primary mt-1">
                        {formatCurrency(tokenDetails.market_data?.ath?.usd)}
                      </div>
                    </div>
                    <div className="bg-theme-bg border border-theme-border rounded-md p-3">
                      <div className="text-xs text-theme-text-secondary">ATL</div>
                      <div className="text-sm font-medium text-theme-text-primary mt-1">
                        {formatCurrency(tokenDetails.market_data?.atl?.usd)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      onClick={() => setActiveTab('analysis')}
                      className="text-theme-accent hover:text-theme-accent-dark text-sm flex items-center"
                    >
                      View details
                      <ChevronRight size={16} className="ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="w-full sm:w-1/2 md:w-1/3">
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-secondary" />
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="w-full bg-theme-bg border border-theme-border rounded-md pl-10 pr-4 py-2 text-theme-text-primary"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSort('market_cap')}
                    className="flex items-center text-sm text-theme-text-secondary hover:text-theme-accent"
                  >
                    <ArrowUpDown size={14} className="mr-1" />
                    Market Cap
                  </button>
                  <div className="flex items-center space-x-2">
                    <button
                      className="p-1.5 bg-theme-bg border border-theme-border rounded-md text-theme-text-secondary hover:text-theme-accent"
                      onClick={() => handlePageChange('prev')}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      className="p-1.5 bg-theme-bg border border-theme-border rounded-md text-theme-text-secondary hover:text-theme-accent"
                      onClick={() => handlePageChange('next')}
                    >
                      <ChevronRight size={16} />
                    </button>
                    <button
                      onClick={() => setAutoScroll(!autoScroll)}
                      className={`text-xs py-1 px-2 rounded ${
                        autoScroll ? 'bg-theme-accent text-theme-bg' : 'bg-theme-bg border border-theme-border text-theme-text-secondary'
                      }`}
                    >
                      {autoScroll ? 'Auto-Scroll: On' : 'Auto-Scroll: Off'}
                    </button>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={32} className="animate-spin text-theme-accent" />
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-4">
                  {error}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedCategories.map((category) => (
                    <div
                      key={category.id}
                      className="bg-theme-bg border border-theme-border rounded-lg shadow-sm p-4 transition-all duration-200 hover:border-theme-accent/50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-theme-text-primary">
                          {category.name}
                        </h3>
                        <div className={`text-xs px-2 py-1 rounded ${
                          category.market_cap_change_24h >= 0 
                            ? 'bg-green-500/10 text-green-500' 
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {formatPercentage(category.market_cap_change_24h)}
                        </div>
                      </div>
                      <div className="mb-2 text-xs text-theme-text-secondary">
                        Market Cap: {formatCurrency(category.market_cap)}
                      </div>
                      
                      <div className="space-y-2 mt-3">
                        {category.top_tokens.slice(0, 3).map((token) => (
                          <div 
                            key={token.id} 
                            className="flex items-center justify-between p-2 bg-theme-bg hover:bg-theme-accent/5 rounded-md cursor-pointer transition-colors"
                            onClick={() => {
                              setSelectedToken({
                                id: token.id,
                                name: token.name,
                                symbol: token.symbol,
                                api_symbol: token.symbol,
                                platforms: {}
                              });
                              handleTokenSelect({
                                id: token.id,
                                name: token.name,
                                symbol: token.symbol,
                                api_symbol: token.symbol,
                                platforms: {}
                              });
                            }}
                          >
                            <div className="flex items-center">
                              <div className="font-medium text-theme-text-primary text-sm">
                                {token.symbol.toUpperCase()}
                              </div>
                              <div className="text-xs text-theme-text-secondary ml-2">
                                {token.name}
                              </div>
                            </div>
                            <div className={`text-xs font-medium ${
                              token.price_change_24h >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {formatPercentage(token.price_change_24h)}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => handleViewAllCoins(category.id)}
                        className="mt-3 w-full flex items-center justify-center bg-theme-bg border border-theme-border hover:border-theme-accent/50 rounded-md p-2 text-xs text-theme-text-secondary hover:text-theme-accent transition-colors"
                      >
                        View All <ArrowRight size={12} className="ml-1" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="signals">
            <TradingSignals />
          </TabsContent>

          <TabsContent value="analysis">
            {selectedToken ? (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 bg-theme-bg border border-theme-border rounded-lg shadow-sm p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-theme-text-primary flex items-center">
                          {selectedToken.name}
                          <span className="ml-2 text-sm bg-theme-accent/10 text-theme-accent px-2 py-0.5 rounded-md">
                            {selectedToken.symbol.toUpperCase()}
                          </span>
                        </h2>
                        {tokenDetails && (
                          <div className="mt-1 flex items-center space-x-4">
                            <div className="text-2xl font-bold text-theme-text-primary">
                              {formatCurrency(tokenDetails.market_data?.current_price?.usd)}
                            </div>
                            <div className={`text-sm font-medium px-2 py-0.5 rounded ${
                              (tokenDetails.market_data?.price_change_percentage_24h || 0) >= 0
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-red-500/10 text-red-500'
                            }`}>
                              {formatPercentage(tokenDetails.market_data?.price_change_percentage_24h || 0)}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleAddToWatchlist}
                          className="p-2 bg-theme-bg border border-theme-border rounded-md text-theme-text-secondary hover:text-theme-accent transition-colors"
                          title="Add to Watchlist"
                        >
                          <Star size={16} />
                        </button>
                        <button
                          onClick={handleCreateAlert}
                          className="p-2 bg-theme-bg border border-theme-border rounded-md text-theme-text-secondary hover:text-theme-accent transition-colors"
                          title="Create Price Alert"
                        >
                          <Bell size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Market Data */}
                    {tokenDetails && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                        <div className="bg-theme-bg border border-theme-border rounded-md p-3">
                          <div className="text-xs text-theme-text-secondary">Market Cap</div>
                          <div className="text-sm font-medium text-theme-text-primary mt-1">
                            {formatCurrency(tokenDetails.market_data?.market_cap?.usd)}
                          </div>
                        </div>
                        <div className="bg-theme-bg border border-theme-border rounded-md p-3">
                          <div className="text-xs text-theme-text-secondary">24h Volume</div>
                          <div className="text-sm font-medium text-theme-text-primary mt-1">
                            {formatCurrency(tokenDetails.market_data?.total_volume?.usd)}
                          </div>
                        </div>
                        <div className="bg-theme-bg border border-theme-border rounded-md p-3">
                          <div className="text-xs text-theme-text-secondary">Circulating Supply</div>
                          <div className="text-sm font-medium text-theme-text-primary mt-1">
                            {tokenDetails.market_data?.circulating_supply?.toLocaleString()} {selectedToken.symbol.toUpperCase()}
                          </div>
                        </div>
                        <div className="bg-theme-bg border border-theme-border rounded-md p-3">
                          <div className="text-xs text-theme-text-secondary">Max Supply</div>
                          <div className="text-sm font-medium text-theme-text-primary mt-1">
                            {tokenDetails.market_data?.max_supply
                              ? tokenDetails.market_data.max_supply.toLocaleString()
                              : 'Unlimited'} {selectedToken.symbol.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Price Chart */}
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-theme-text-primary mb-3">Price Chart</h3>
                      <div className="h-80 mb-12 pb-4 relative">
                        {selectedToken && <PriceChart tokenId={selectedToken.id} />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs for different data */}
                <Tabs defaultValue="overview">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="social">Social</TabsTrigger>
                    <TabsTrigger value="developer">Developer</TabsTrigger>
                    <TabsTrigger value="signals">Trading Signals</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4 mt-4">
                    {tokenDetails && (
                      <div className="bg-theme-bg border border-theme-border rounded-lg shadow-sm p-4">
                        <h3 className="text-lg font-medium text-theme-text-primary mb-3">About {selectedToken.name}</h3>
                        <div 
                          className="text-sm text-theme-text-secondary prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ 
                            __html: tokenDetails.description?.en || 'No description available.' 
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="bg-theme-bg border border-theme-border rounded-lg shadow-sm p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-medium text-theme-text-primary">AI Insights</h3>
                        {tokenInsights && !isLoadingInsights && (
                          <button
                            onClick={handleContinueInChat}
                            className="text-sm bg-theme-accent text-theme-bg px-3 py-1 rounded-md hover:bg-theme-accent/90 transition-colors"
                          >
                            Continue in Chat
                          </button>
                        )}
                      </div>
                      
                      <div className="text-sm text-theme-text-secondary">
                        {isLoadingInsights ? (
                          <div className="flex items-center space-x-2 py-4">
                            <Loader2 size={18} className="animate-spin text-theme-accent" />
                            <p>Generating AI insights for {selectedToken?.symbol.toUpperCase()}...</p>
                          </div>
                        ) : insightsError ? (
                          <div className="text-red-500 py-2">
                            {insightsError}
                          </div>
                        ) : tokenInsights ? (
                          <div className="prose prose-sm max-w-none">
                            {tokenInsights.split('\n').map((paragraph, idx) => (
                              <p key={idx} className="mb-2">{paragraph}</p>
                            ))}
                          </div>
                        ) : (
                          <p>Select a token to see AI-powered insights.</p>
                        )}
                      </div>
                    </div>
                    
                    <NewsFeed />
                  </TabsContent>
                  
                  <TabsContent value="social" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TwitterFeed />
                      <SocialSentiment />
                    </div>
                    <SecondaryTwitterFeed 
                      listId="1880591496266551304"
                      continuationToken="DAABCgABGhF81FZ__6YKAAIaCdAnRlqQOAgAAwAAAAIAAA"
                      title="AI & Solana Projects"
                    />
                  </TabsContent>
                  
                  <TabsContent value="developer" className="mt-4">
                    <DeveloperActivity />
                  </TabsContent>
                  
                  <TabsContent value="signals" className="mt-4">
                    <TradingSignals />
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="text-center py-10">
                <Search size={48} className="mx-auto text-theme-text-secondary opacity-30 mb-4" />
                <h3 className="text-lg font-medium text-theme-text-primary">Select a token to view analysis</h3>
                <p className="text-sm text-theme-text-secondary mt-2">Use the search tab to find a token</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Explore;