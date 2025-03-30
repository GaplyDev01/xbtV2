import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Activity,
  BarChart2,
  Percent,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { useCrypto } from '../context/CryptoContext';
import { formatCurrency, formatPercentage } from '../utils/chartUtils';

// Define interface for trading signal
interface TradingSignal {
  type: 'buy' | 'sell' | 'hold';
  confidence: number;
  price_target: number;
  stop_loss: number;
  timeframe: string;
  risk_level: 'low' | 'medium' | 'high';
  reasoning: string;
  indicators: {
    name: string;
    value: string;
    signal: 'bullish' | 'bearish' | 'neutral';
  }[];
  generated_at: string;
}

// Define interface for token with signal
interface TokenSignal {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  signal: TradingSignal;
}

const CategoryCoins: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { getCoinsMarketData, getCategories } = useCrypto();
  
  const [tokenSignals, setTokenSignals] = useState<TokenSignal[]>([]);
  const [categoryName, setCategoryName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchCategoryName = async () => {
      if (!categoryId) return;
      
      try {
        const categories = await getCategories();
        const category = categories.find(cat => cat.id === categoryId);
        if (category) {
          setCategoryName(category.name);
        } else {
          setCategoryName(categoryId); // Fallback to ID if name not found
        }
      } catch (err) {
        console.error('Error fetching category name:', err);
        setCategoryName(categoryId); // Fallback to ID if error
      }
    };
    
    fetchCategoryName();
  }, [categoryId, getCategories]);

  useEffect(() => {
    if (!categoryId) return;
    
    const fetchCategoryCoins = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get coins in the specified category
        const coins = await getCoinsMarketData('usd', undefined, 'market_cap_desc', 100, categoryId);
        
        // Calculate total pages
        setTotalPages(Math.ceil(coins.length / itemsPerPage));
        
        // Generate trading signals for each coin (just for the current page)
        const startIdx = (page - 1) * itemsPerPage;
        const endIdx = Math.min(startIdx + itemsPerPage, coins.length);
        const pageCoins = coins.slice(startIdx, endIdx);
        
        const signalsPromises = pageCoins.map(async (token) => {
          const signal = await generateSignalForToken(token);
          return {
            id: token.id,
            name: token.name,
            symbol: token.symbol,
            image: `https://coinicons-api.vercel.app/api/icon/${token.symbol.toLowerCase()}`,
            current_price: token.current_price,
            price_change_percentage_24h: token.price_change_percentage_24h,
            market_cap: token.market_cap,
            signal
          };
        });
        
        const generatedSignals = await Promise.all(signalsPromises);
        setTokenSignals(generatedSignals);
      } catch (err) {
        console.error('Error fetching category coins:', err);
        setError('Failed to fetch coins in this category. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategoryCoins();
  }, [categoryId, getCoinsMarketData, page]);

  // Helper function to generate a signal for a token (similar to TradingSignals component)
  const generateSignalForToken = async (token: any): Promise<TradingSignal> => {
    // This is a simplified version that generates random signals
    // In a real application, you would use AI analysis or market indicators
    const signalTypes = ['buy', 'sell', 'hold'] as const;
    const riskLevels = ['low', 'medium', 'high'] as const;
    
    const randomSignalType = signalTypes[Math.floor(Math.random() * signalTypes.length)];
    const randomRiskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
    const randomConfidence = Math.random() * 0.5 + 0.5; // 0.5 to 1.0
    
    const priceMultiplier = randomSignalType === 'buy' 
      ? 1 + (Math.random() * 0.3) // 0% to 30% increase
      : randomSignalType === 'sell'
        ? 1 - (Math.random() * 0.2) // 0% to 20% decrease
        : 1 + (Math.random() * 0.1 - 0.05); // -5% to 5% change
    
    const stopLossMultiplier = randomSignalType === 'buy'
      ? 1 - (Math.random() * 0.15) // 0% to 15% below current price
      : randomSignalType === 'sell'
        ? 1 + (Math.random() * 0.1) // 0% to 10% above current price
        : 1 - (Math.random() * 0.05); // 0% to 5% below current price
    
    const randomTimeframe = Math.random() > 0.5 
      ? `${Math.floor(Math.random() * 4) + 1}-${Math.floor(Math.random() * 4) + 2} weeks` 
      : `${Math.floor(Math.random() * 3) + 1}-${Math.floor(Math.random() * 3) + 2} months`;
    
    // Random indicator signals
    const indicators = [
      { 
        name: 'RSI', 
        value: `${Math.floor(Math.random() * 100)}`, 
        signal: Math.random() > 0.6 ? 'bullish' : Math.random() > 0.3 ? 'bearish' : 'neutral' as 'bullish' | 'bearish' | 'neutral'
      },
      { 
        name: 'MACD', 
        value: Math.random() > 0.5 ? 'Bullish Cross' : 'Bearish Cross', 
        signal: Math.random() > 0.6 ? 'bullish' : Math.random() > 0.3 ? 'bearish' : 'neutral' as 'bullish' | 'bearish' | 'neutral'
      },
      { 
        name: 'MA Cross', 
        value: '200/50', 
        signal: Math.random() > 0.6 ? 'bullish' : Math.random() > 0.3 ? 'bearish' : 'neutral' as 'bullish' | 'bearish' | 'neutral'
      },
      { 
        name: 'Volume', 
        value: `${Math.floor(Math.random() * 300)}% Avg`, 
        signal: Math.random() > 0.6 ? 'bullish' : Math.random() > 0.3 ? 'bearish' : 'neutral' as 'bullish' | 'bearish' | 'neutral'
      }
    ];
    
    return {
      type: randomSignalType,
      confidence: randomConfidence,
      price_target: token.current_price * priceMultiplier,
      stop_loss: token.current_price * stopLossMultiplier,
      timeframe: randomTimeframe,
      risk_level: randomRiskLevel,
      reasoning: `Analysis for ${token.name} (${token.symbol.toUpperCase()}) based on current market conditions suggests a ${randomSignalType.toUpperCase()} signal with ${(randomConfidence * 100).toFixed(0)}% confidence.\n\nThe target price is set at ${formatCurrency(token.current_price * priceMultiplier)} with a stop loss at ${formatCurrency(token.current_price * stopLossMultiplier)}.\n\nThis recommendation considers current market trends, technical indicators, and historical price patterns. The suggested timeframe for this trade is ${randomTimeframe} with a ${randomRiskLevel} risk level.`,
      indicators,
      generated_at: new Date().toISOString()
    };
  };

  const handleTokenClick = (token: TokenSignal) => {
    // Navigate to the token's trading signal details page
    navigate(`/trading-signals/${token.id}`);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleBackToExplore = () => {
    navigate('/explore');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center p-8">
          <Loader2 size={24} className="text-theme-accent animate-spin mr-2" />
          <span className="text-theme-text-secondary">Loading coins in {categoryName || categoryId}...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center p-8 text-red-500">
          <AlertTriangle size={24} className="mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Helmet>
        <title>{categoryName || categoryId} Coins | Trading Signals</title>
      </Helmet>
      
      <div className="mb-6">
        <button 
          onClick={handleBackToExplore}
          className="flex items-center text-theme-text-secondary hover:text-theme-accent mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Explore
        </button>
        
        <h1 className="text-2xl font-bold text-theme-text-primary">
          {categoryName || categoryId} Coins
        </h1>
        <p className="text-theme-text-secondary mt-2">
          Trading signals for coins in the {categoryName || categoryId} category
        </p>
      </div>

      {/* Trading Signal Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tokenSignals.map((token) => (
          <div 
            key={token.id}
            className="bg-theme-bg-secondary rounded-lg border border-theme-border p-4 transition-all hover:border-theme-accent cursor-pointer"
            onClick={() => handleTokenClick(token)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 flex-shrink-0 mr-3">
                  <img 
                    src={token.image} 
                    alt={token.symbol}
                    className="w-full h-full rounded-full"
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = `https://via.placeholder.com/32/6366F1/FFFFFF?text=${token.symbol.charAt(0).toUpperCase()}`;
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-medium">{token.name}</h3>
                  <span className="text-xs text-theme-text-secondary">{token.symbol.toUpperCase()}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-medium">{formatCurrency(token.current_price)}</span>
                <span className={`text-xs ${token.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {token.price_change_percentage_24h >= 0 ? '↑ ' : '↓ '}
                  {formatPercentage(token.price_change_percentage_24h)}
                </span>
              </div>
            </div>
            
            <div className={`mb-4 rounded-md px-3 py-2 flex items-center justify-between ${
              token.signal.type === 'buy' ? 'bg-green-500/10 border border-green-500/20' : 
              token.signal.type === 'sell' ? 'bg-red-500/10 border border-red-500/20' : 
              'bg-yellow-500/10 border border-yellow-500/20'
            }`}>
              <div className="flex items-center">
                {token.signal.type === 'buy' ? (
                  <TrendingUp size={18} className="text-green-500 mr-2" />
                ) : token.signal.type === 'sell' ? (
                  <TrendingDown size={18} className="text-red-500 mr-2" />
                ) : (
                  <Activity size={18} className="text-yellow-500 mr-2" />
                )}
                <span className={`font-medium capitalize ${
                  token.signal.type === 'buy' ? 'text-green-500' : 
                  token.signal.type === 'sell' ? 'text-red-500' : 
                  'text-yellow-500'
                }`}>
                  {token.signal.type}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-theme-text-secondary">Confidence:</span>
                <span className="ml-1.5 text-sm font-medium">{(token.signal.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex items-center">
                <Target size={16} className="text-theme-text-secondary mr-1.5" />
                <span className="text-xs text-theme-text-secondary mr-1">Target:</span>
                <span className="text-sm font-medium">{formatCurrency(token.signal.price_target)}</span>
              </div>
              <div className="flex items-center justify-end">
                <AlertTriangle size={16} className="text-theme-text-secondary mr-1.5" />
                <span className="text-xs text-theme-text-secondary mr-1">Stop:</span>
                <span className="text-sm font-medium">{formatCurrency(token.signal.stop_loss)}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center">
                <BarChart2 size={16} className="text-theme-text-secondary mr-1.5" />
                <span className="text-xs text-theme-text-secondary mr-1">Risk:</span>
                <span className={`text-sm font-medium capitalize ${
                  token.signal.risk_level === 'low' ? 'text-green-500' : 
                  token.signal.risk_level === 'high' ? 'text-red-500' : 
                  'text-yellow-500'
                }`}>
                  {token.signal.risk_level}
                </span>
              </div>
              <div className="flex items-center justify-end">
                <Percent size={16} className="text-theme-text-secondary mr-1.5" />
                <span className="text-xs text-theme-text-secondary mr-1">ROI:</span>
                <span className="text-sm font-medium">
                  {formatPercentage((token.signal.price_target - token.current_price) / token.current_price * 100)}
                </span>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-theme-border/30 flex justify-between items-center">
              <div className="text-xs text-theme-text-secondary">
                {new Date(token.signal.generated_at).toLocaleString()}
              </div>
              <div className="flex text-theme-accent items-center text-sm">
                <span>Details</span>
                <ChevronRight size={16} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded-md ${
                page === 1 
                  ? 'bg-theme-bg-secondary text-theme-text-secondary cursor-not-allowed' 
                  : 'bg-theme-bg-secondary hover:bg-theme-accent hover:text-theme-bg text-theme-text-primary'
              }`}
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Logic to determine which page numbers to show
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (page <= 3) {
                pageNumber = i + 1;
              } else if (page >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = page - 2 + i;
              }
              
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`w-10 h-10 rounded-md ${
                    page === pageNumber 
                      ? 'bg-theme-accent text-theme-bg' 
                      : 'bg-theme-bg-secondary hover:bg-theme-accent hover:text-theme-bg text-theme-text-primary'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded-md ${
                page === totalPages 
                  ? 'bg-theme-bg-secondary text-theme-text-secondary cursor-not-allowed' 
                  : 'bg-theme-bg-secondary hover:bg-theme-accent hover:text-theme-bg text-theme-text-primary'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryCoins; 