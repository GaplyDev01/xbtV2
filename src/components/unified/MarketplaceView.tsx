import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Loader2, TrendingUp, TrendingDown, RefreshCw, ArrowRightLeft } from 'lucide-react';

interface MarketItem {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  iconUrl?: string;
}

interface MarketplaceViewProps {
  className?: string;
  defaultTab?: string;
  limit?: number;
  onSelectToken?: (token: MarketItem) => void;
}

const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  className = '',
  defaultTab = 'top',
  limit = 10,
  onSelectToken
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [markets, setMarkets] = useState<Record<string, MarketItem[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof MarketItem>('marketCap');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const fetchMarketData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, we would call a market API
      // This is a mock implementation with dummy data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock market data
      const mockMarkets: Record<string, MarketItem[]> = {
        top: [
          { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', price: 52361.23, change24h: 2.53, volume24h: 28504123000, marketCap: 1027654000000 },
          { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', price: 2856.12, change24h: 3.21, volume24h: 14785230000, marketCap: 345278000000 },
          { id: 'solana', name: 'Solana', symbol: 'SOL', price: 101.85, change24h: 5.67, volume24h: 5623410000, marketCap: 45682000000 },
          { id: 'cardano', name: 'Cardano', symbol: 'ADA', price: 0.42, change24h: -1.25, volume24h: 896520000, marketCap: 15346000000 },
          { id: 'ripple', name: 'XRP', symbol: 'XRP', price: 0.56, change24h: 0.83, volume24h: 1852360000, marketCap: 30124000000 },
          { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', price: 6.87, change24h: 4.12, volume24h: 457830000, marketCap: 9854600000 },
          { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', price: 0.0823, change24h: -2.45, volume24h: 685210000, marketCap: 11652000000 },
          { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', price: 35.62, change24h: 8.23, volume24h: 986540000, marketCap: 12563000000 },
          { id: 'polygon', name: 'Polygon', symbol: 'MATIC', price: 0.52, change24h: -0.75, volume24h: 354280000, marketCap: 5123400000 },
          { id: 'binancecoin', name: 'Binance Coin', symbol: 'BNB', price: 325.48, change24h: 1.56, volume24h: 2145630000, marketCap: 50123000000 },
        ],
        trending: [
          { id: 'sui', name: 'Sui', symbol: 'SUI', price: 1.27, change24h: 15.42, volume24h: 745230000, marketCap: 2456300000 },
          { id: 'aptos', name: 'Aptos', symbol: 'APT', price: 8.45, change24h: 12.63, volume24h: 362140000, marketCap: 2123400000 },
          { id: 'arbitrum', name: 'Arbitrum', symbol: 'ARB', price: 0.83, change24h: 9.85, volume24h: 254180000, marketCap: 1856300000 },
          { id: 'immutablex', name: 'Immutable X', symbol: 'IMX', price: 2.12, change24h: 8.74, volume24h: 185230000, marketCap: 1452300000 },
          { id: 'optimism', name: 'Optimism', symbol: 'OP', price: 1.78, change24h: 7.65, volume24h: 156420000, marketCap: 1236500000 },
        ],
        gainers: [
          { id: 'sui', name: 'Sui', symbol: 'SUI', price: 1.27, change24h: 15.42, volume24h: 745230000, marketCap: 2456300000 },
          { id: 'aptos', name: 'Aptos', symbol: 'APT', price: 8.45, change24h: 12.63, volume24h: 362140000, marketCap: 2123400000 },
          { id: 'arbitrum', name: 'Arbitrum', symbol: 'ARB', price: 0.83, change24h: 9.85, volume24h: 254180000, marketCap: 1856300000 },
          { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', price: 35.62, change24h: 8.23, volume24h: 986540000, marketCap: 12563000000 },
          { id: 'immutablex', name: 'Immutable X', symbol: 'IMX', price: 2.12, change24h: 8.74, volume24h: 185230000, marketCap: 1452300000 },
        ],
        losers: [
          { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', price: 0.0823, change24h: -2.45, volume24h: 685210000, marketCap: 11652000000 },
          { id: 'cardano', name: 'Cardano', symbol: 'ADA', price: 0.42, change24h: -1.25, volume24h: 896520000, marketCap: 15346000000 },
          { id: 'polygon', name: 'Polygon', symbol: 'MATIC', price: 0.52, change24h: -0.75, volume24h: 354280000, marketCap: 5123400000 },
          { id: 'filecoin', name: 'Filecoin', symbol: 'FIL', price: 4.12, change24h: -0.65, volume24h: 245630000, marketCap: 2154300000 },
          { id: 'near', name: 'NEAR Protocol', symbol: 'NEAR', price: 2.32, change24h: -0.45, volume24h: 145230000, marketCap: 2452300000 },
        ],
      };

      setMarkets(mockMarkets);
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError('Failed to fetch market data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  const handleSort = (field: keyof MarketItem) => {
    if (sortField === field) {
      // Toggle sort direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to descending for most fields
      setSortField(field);
      setSortDirection(
        field === 'name' || field === 'symbol' ? 'asc' : 'desc'
      );
    }
  };

  const handleRefresh = () => {
    fetchMarketData();
  };

  const formatPrice = (price: number) => {
    if (price < 0.01) {
      return `$${price.toFixed(6)}`;
    } else if (price < 1) {
      return `$${price.toFixed(4)}`;
    } else if (price < 10) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) {
      return `$${(num / 1e12).toFixed(2)}T`;
    } else if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`;
    } else if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`;
    } else if (num >= 1e3) {
      return `$${(num / 1e3).toFixed(2)}K`;
    } else {
      return `$${num.toFixed(2)}`;
    }
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  // Sort the currently active tab's data
  const currentMarketData = markets[activeTab] || [];
  const sortedMarketData = [...currentMarketData].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a[sortField] > b[sortField] ? 1 : -1;
    } else {
      return a[sortField] < b[sortField] ? 1 : -1;
    }
  });

  // Limit the number of items shown
  const visibleMarketData = sortedMarketData.slice(0, limit);

  return (
    <div className={`bg-theme-bg border border-theme-border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Market Overview</h3>
        <button
          onClick={handleRefresh}
          className="p-2 bg-theme-accent/10 text-theme-accent hover:bg-theme-accent/20 rounded-lg"
          title="Refresh market data"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <Tabs defaultValue={defaultTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="top" className="text-sm">
            Top
          </TabsTrigger>
          <TabsTrigger value="trending" className="text-sm">
            Trending
          </TabsTrigger>
          <TabsTrigger value="gainers" className="text-sm">
            Gainers
          </TabsTrigger>
          <TabsTrigger value="losers" className="text-sm">
            Losers
          </TabsTrigger>
        </TabsList>
        
        {Object.keys(markets).map((tabKey) => (
          <TabsContent key={tabKey} value={tabKey} className="mt-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="text-theme-accent animate-spin" />
                <span className="ml-2 text-theme-text-secondary">Loading market data...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-theme-text-secondary">
                <p>{error}</p>
              </div>
            ) : visibleMarketData.length === 0 ? (
              <div className="text-center py-8 text-theme-text-secondary">
                <p>No market data available.</p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-theme-text-secondary mb-2 px-2">
                  <div className="col-span-4 flex items-center cursor-pointer" onClick={() => handleSort('name')}>
                    <span>Name</span>
                  </div>
                  <div className="col-span-2 text-right cursor-pointer" onClick={() => handleSort('price')}>
                    <span>Price</span>
                  </div>
                  <div className="col-span-2 text-right cursor-pointer" onClick={() => handleSort('change24h')}>
                    <span>24h %</span>
                  </div>
                  <div className="col-span-2 text-right cursor-pointer hidden sm:block" onClick={() => handleSort('volume24h')}>
                    <span>Volume</span>
                  </div>
                  <div className="col-span-2 text-right cursor-pointer hidden sm:block" onClick={() => handleSort('marketCap')}>
                    <span>Market Cap</span>
                  </div>
                </div>

                <div className="space-y-1">
                  {visibleMarketData.map((token) => (
                    <div 
                      key={token.id} 
                      className="grid grid-cols-12 gap-2 py-2 px-2 hover:bg-theme-accent/5 rounded-lg cursor-pointer items-center"
                      onClick={() => onSelectToken && onSelectToken(token)}
                    >
                      <div className="col-span-4 flex items-center">
                        <div className="w-8 h-8 rounded-full bg-theme-accent/20 flex items-center justify-center mr-2">
                          <span className="text-xs font-bold text-theme-accent">
                            {token.symbol.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-sm">{token.name}</div>
                          <div className="text-xs text-theme-text-secondary">{token.symbol.toUpperCase()}</div>
                        </div>
                      </div>
                      <div className="col-span-2 text-right">
                        <div className="text-sm">{formatPrice(token.price)}</div>
                      </div>
                      <div className="col-span-2 text-right">
                        <div className={`flex items-center justify-end ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {token.change24h >= 0 ? (
                            <TrendingUp size={14} className="mr-1" />
                          ) : (
                            <TrendingDown size={14} className="mr-1" />
                          )}
                          <span>{formatPercent(token.change24h)}</span>
                        </div>
                      </div>
                      <div className="col-span-2 text-right text-sm hidden sm:block">
                        {formatLargeNumber(token.volume24h)}
                      </div>
                      <div className="col-span-2 text-right text-sm hidden sm:block">
                        {formatLargeNumber(token.marketCap)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      
      <div className="mt-4 flex justify-center">
        <button 
          className="text-xs flex items-center text-theme-accent hover:text-theme-accent-hover"
          onClick={() => window.open('https://coingecko.com', '_blank')}
        >
          <ArrowRightLeft size={12} className="mr-1" />
          View all markets
        </button>
      </div>
    </div>
  );
};

export default MarketplaceView;
