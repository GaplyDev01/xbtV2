import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, CandlestickChart, LineChart as LineChartIcon } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/chartUtils';

interface PriceChartProps {
  tokenId?: string;
  symbol?: string;
  currentPrice?: number;
  priceChange24h?: number;
  timeframe?: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
  chartType?: 'line' | 'candlestick';
  showControls?: boolean;
  height?: number | string;
  className?: string;
}

const PriceChart: React.FC<PriceChartProps> = ({
  tokenId,
  symbol = 'BTC',
  currentPrice,
  priceChange24h,
  timeframe = '1D',
  chartType = 'line',
  showControls = true,
  height = 300,
  className = ''
}) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const [selectedChartType, setSelectedChartType] = useState(chartType);
  const [currentPriceValue, setCurrentPriceValue] = useState<number | undefined>(currentPrice);
  const [validTokenId, setValidTokenId] = useState<string | null>(null);

  // Convert token symbol to CoinGecko ID format
  const getTokenId = (id?: string): string => {
    // Common token symbol to ID mapping
    const symbolToId: Record<string, string> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'SOL': 'solana',
      'BNB': 'binancecoin',
      'XRP': 'ripple',
      'ADA': 'cardano',
      'DOGE': 'dogecoin',
      'DOT': 'polkadot',
      'MATIC': 'polygon',
      'LINK': 'chainlink'
    };

    if (!id) return 'bitcoin';
    
    // Check if we have a direct mapping for this symbol
    const upperSymbol = id.toUpperCase();
    if (symbolToId[upperSymbol]) {
      return symbolToId[upperSymbol];
    }
    
    // Remove any special characters and convert to lowercase
    return id.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  };

  // Validate and set token ID when prop changes
  useEffect(() => {
    if (tokenId) {
      const validId = getTokenId(tokenId);
      setValidTokenId(validId);
    } else {
      setValidTokenId(null);
    }
  }, [tokenId]);
  // Convert timeframe to days for API
  const getTimeframeDays = (tf: string) => {
    const mapping: Record<string, number | string> = {
      '1D': 1,
      '1W': 7,
      '1M': 30,
      '3M': 90,
      '1Y': 365,
      'ALL': 'max'
    };
    return mapping[tf] || 1;
  };

  useEffect(() => {
    // Don't fetch if no valid token ID
    if (!validTokenId) {
      setChartData([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const fetchChartData = async () => {
      console.log('Fetching chart data for token:', { tokenId, validTokenId });
      
      setIsLoading(true);
      setError(null);

      // Update current price state
      setCurrentPriceValue(currentPrice);

      try {
        const days = getTimeframeDays(selectedTimeframe);

        // Validate token ID
        if (!validTokenId) {
          setError('Invalid token ID');
          return;
        }

        const options = {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'x-cg-pro-api-key': import.meta.env.VITE_COINGECKO_API_KEY || 'CG-qsva2ctaarLBpZ3KDqYmzu6p'
          }
        };

        const baseUrl = 'https://pro-api.coingecko.com/api/v3';
        const endpoint = selectedChartType === 'candlestick'
          ? `${baseUrl}/coins/${validTokenId}/ohlc?vs_currency=usd&days=${days}`
          : `${baseUrl}/coins/${validTokenId}/market_chart?vs_currency=usd&days=${days}`;

        console.log('Fetching from endpoint:', endpoint);

        const response = await fetch(endpoint, options);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`Token "${validTokenId}" not found`);
          }
          throw new Error(`API returned ${response.status}`);
        }

        // Handle rate limit error
        if (response.status === 429) {
          console.warn('Rate limit exceeded, using mock data');
          setChartData(generateMockChartData(selectedTimeframe));
          return;
        }

        // Handle rate limit error
        if (response.status === 429) {
          console.warn('Rate limit exceeded, using mock data');
          return setChartData(generateMockChartData(selectedTimeframe));
        }

        const data = await response.json();

        // Transform data based on chart type
        const transformedData = selectedChartType === 'candlestick'
          ? data.map((item: any[]) => ({
              time: new Date(item[0]).toLocaleString(),
              open: item[1],
              high: item[2],
              low: item[3],
              close: item[4]
            }))
          : data.prices.map((item: any[]) => ({
              time: new Date(item[0]).toLocaleString(),
              value: item[1]
            }));

        setChartData(transformedData);
      } catch (err) {
        console.error('Error fetching chart data:', err);
        if (err instanceof Error && err.message.includes('not found')) {
          setError(`Token not found. Using sample data.`);
          setChartData(generateMockChartData(selectedTimeframe));
        } else {
          setError('Failed to load chart data. Using mock data.');
          setChartData(generateMockChartData(selectedTimeframe));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [validTokenId, selectedTimeframe, selectedChartType, currentPrice]);

  // Generate mock data for fallback
  const generateMockChartData = (timeframe: string) => {
    const now = Date.now();
    const points = 100;
    const days = getTimeframeDays(timeframe);
    const interval = typeof days === 'number' ? (days * 24 * 60 * 60 * 1000) / points : (30 * 24 * 60 * 60 * 1000);
    
    let basePrice = currentPriceValue ?? 50000;
    const volatility = 0.02; // 2% volatility
    
    if (selectedChartType === 'candlestick') {
      return Array.from({ length: points }, (_, i) => {
        const time = new Date(now - (points - i) * interval);
        const open = basePrice * (1 + (Math.random() - 0.5) * volatility);
        const close = basePrice * (1 + (Math.random() - 0.5) * volatility);
        const high = Math.max(open, close) * (1 + Math.random() * volatility);
        const low = Math.min(open, close) * (1 - Math.random() * volatility);
        
        basePrice = close; // Use close as next base price
        
        return {
          time: time.toLocaleString(),
          open,
          high,
          low,
          close
        };
      });
    }
    
    return Array.from({ length: points }, (_, i) => ({
      time: new Date(now - (points - i) * interval).toLocaleString(),
      value: basePrice * (1 + (Math.random() - 0.5) * volatility)
    }));
  };

  const timeframes = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {showControls && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <button
              className={`p-1.5 rounded ${selectedChartType === 'line' ? 'bg-theme-accent text-theme-bg' : 'bg-theme-accent/10 text-theme-accent'}`}
              onClick={() => setSelectedChartType('line')}
              title="Line Chart"
            >
              <LineChartIcon size={16} />
            </button>
            <button
              className={`p-1.5 rounded ${selectedChartType === 'candlestick' ? 'bg-theme-accent text-theme-bg' : 'bg-theme-bg text-theme-accent'}`}
              onClick={() => setSelectedChartType('candlestick')}
              title="Candlestick Chart"
            >
              <CandlestickChart size={16} />
            </button>
          </div>

          <div className="flex space-x-1">
            {timeframes.map((tf) => (
              <button
                key={tf}
                className={`px-2 py-1 text-xs rounded ${
                  selectedTimeframe === tf 
                    ? 'bg-theme-accent text-theme-bg' 
                    : 'bg-theme-bg text-theme-accent hover:bg-theme-accent/10'
                }`}
                onClick={() => setSelectedTimeframe(tf as typeof timeframe)}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-grow relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-theme-accent border-t-transparent" />
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center text-theme-text-secondary">
            {error}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--theme-border) / 0.2)" />
              <XAxis 
                dataKey="time" 
                stroke="rgb(var(--theme-text-secondary))"
                fontSize={10}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return selectedTimeframe === '1D' 
                    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : date.toLocaleDateString();
                }}
              /> 
              <YAxis 
                stroke="rgb(var(--theme-text-secondary))"
                fontSize={10}
                tickFormatter={(value) => formatCurrency(value, 'USD', true)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(var(--theme-bg))',
                  border: '1px solid rgb(var(--theme-border))',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: 'rgb(var(--theme-text-secondary))' }}
                formatter={(value: number) => [formatCurrency(value, 'USD'), 'Price']}
              />
              <Line 
                type="monotone" 
                dataKey={selectedChartType === 'candlestick' ? 'close' : 'value'}
                stroke="rgb(var(--theme-accent))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {currentPrice && (
        <div className="mt-4 flex justify-between items-center">
          <div>
            <div className="text-sm text-theme-text-secondary">Current Price</div>
            <div className="text-lg font-bold text-theme-text-primary">
              {formatCurrency(currentPriceValue || 0)}
            </div>
          </div>
          {priceChange24h !== undefined && (
            <div className={`flex items-center ${priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {priceChange24h >= 0 ? (
                <TrendingUp size={16} className="mr-1" />
              ) : (
                <TrendingDown size={16} className="mr-1" />
              )}
              <span>{formatPercentage(priceChange24h)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PriceChart;