import React, { useState, useEffect } from 'react';
import { BarChart, Activity, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToken } from '../../context/TokenContext';
import volumeApi, { 
  VolumeVolatilityResponse, 
  ExchangeVolume, 
  TokenVolatility, 
  getTokenId 
} from '../../services/volumeApi';

const VolumeVolatility: React.FC = () => {
  const { selectedToken } = useToken();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [volumeData, setVolumeData] = useState<ExchangeVolume[]>([]);
  const [totalVolume, setTotalVolume] = useState<string>('$0.0B');
  const [tokenVolatility, setTokenVolatility] = useState<TokenVolatility | null>(null);
  const [comparisonVolatility, setComparisonVolatility] = useState<TokenVolatility[]>([]);
  const [marketAvgVolatility, setMarketAvgVolatility] = useState<number>(0);

  // Default volume data for when API fails or no token is selected
  const defaultVolumeData: ExchangeVolume[] = [
    { exchange: 'Binance', volume: 12400000000, percentage: 80, volume_formatted: '$12.4B' },
    { exchange: 'Coinbase', volume: 5700000000, percentage: 50, volume_formatted: '$5.7B' },
    { exchange: 'FTX', volume: 3200000000, percentage: 30, volume_formatted: '$3.2B' },
    { exchange: 'Kraken', volume: 1800000000, percentage: 20, volume_formatted: '$1.8B' },
  ];

  // Default volatility data
  const defaultComparisonVolatility: TokenVolatility[] = [
    { symbol: 'BTC', value: 4.2, formatted: '4.2%' },
    { symbol: 'ETH', value: 5.7, formatted: '5.7%' },
    { symbol: 'Market', value: 6.8, formatted: '6.8%' }
  ];

  // Fetch data for a specific token
  const fetchVolumeVolatilityData = async (symbol: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const tokenId = getTokenId(symbol);
      const data = await volumeApi.getVolumeVolatilityData(tokenId);
      
      // Update state with the retrieved data
      setVolumeData(data.exchange_data);
      setTotalVolume(data.total_volume_formatted);
      setTokenVolatility(data.token_volatility);
      
      // Also fetch comparison data for context
      const comparisonData = await volumeApi.getComparisonVolatilityData();
      setComparisonVolatility(comparisonData);
      
      // Extract market average from comparison data
      const marketData = comparisonData.find(item => item.symbol === 'Market');
      if (marketData) {
        setMarketAvgVolatility(marketData.value);
      }
    } catch (error) {
      console.error('Failed to fetch volume/volatility data:', error);
      let errorMessage = 'Failed to load volume data. Using default values.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setError(errorMessage);
      
      // Set default values on error
      setVolumeData(defaultVolumeData);
      setTotalVolume('$98.7B');
      setComparisonVolatility(defaultComparisonVolatility);
      setMarketAvgVolatility(6.8);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch default comparison data when no token is selected
  const fetchDefaultData = async () => {
    setIsLoading(true);
    try {
      const comparisonData = await volumeApi.getComparisonVolatilityData();
      setComparisonVolatility(comparisonData);
      
      const marketData = comparisonData.find(item => item.symbol === 'Market');
      if (marketData) {
        setMarketAvgVolatility(marketData.value);
      }
      
      // Set default volume data
      setVolumeData(defaultVolumeData);
      setTotalVolume('$98.7B');
      setTokenVolatility(null);
    } catch (error) {
      console.error('Failed to fetch comparison data:', error);
      setComparisonVolatility(defaultComparisonVolatility);
      setMarketAvgVolatility(6.8);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data on demand
  const handleRefresh = () => {
    if (selectedToken) {
      fetchVolumeVolatilityData(selectedToken.symbol);
    } else {
      fetchDefaultData();
    }
  };

  // When token changes, fetch new data
  useEffect(() => {
    if (selectedToken) {
      fetchVolumeVolatilityData(selectedToken.symbol);
    } else {
      fetchDefaultData();
    }
  }, [selectedToken]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <div className="text-[10px] font-medium text-theme-text-primary flex items-center">
          <BarChart size={12} className="mr-1 text-theme-accent" />
          {selectedToken ? `${selectedToken.symbol.toUpperCase()} 24h Trading Volume` : '24h Trading Volume'}
        </div>
        <button 
          onClick={handleRefresh} 
          disabled={isLoading}
          className="text-[9px] p-0.5 rounded-full text-theme-accent hover:bg-theme-accent/10"
        >
          <RefreshCw size={10} className={`${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {error && (
        <div className="text-[9px] text-theme-accent bg-theme-accent/10 p-1 rounded-md mb-1.5 flex items-center">
          <AlertTriangle size={10} className="mr-1" />
          {error} Please ensure the API key is set correctly.
        </div>
      )}
      
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <div className="text-[10px] font-medium text-theme-text-primary flex items-center">
            <BarChart size={12} className="mr-1 text-theme-accent" />
          </div>
          <div className="text-[9px] text-theme-accent">{totalVolume} Total</div>
        </div>
        
        <div className="space-y-1.5">
          {isLoading ? (
            // Loading skeleton
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="flex items-center animate-pulse">
                <div className="text-[9px] w-16 bg-theme-accent/10 h-3 rounded"></div>
                <div className="flex-grow mx-2">
                  <div className="h-1.5 bg-theme-accent/10 rounded-full overflow-hidden"></div>
                </div>
                <div className="text-[9px] bg-theme-accent/10 h-3 w-14 rounded"></div>
              </div>
            ))
          ) : (
            volumeData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="text-[9px] w-16 text-theme-text-secondary">{item.exchange}</div>
                <div className="flex-grow mx-2">
                  <div className="h-1.5 bg-theme-accent/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-theme-accent rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-[9px] text-theme-text-secondary">{item.volume_formatted}</div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-1">
          <div className="text-[10px] font-medium text-theme-text-primary flex items-center">
            <Activity size={12} className="mr-1 text-theme-accent" />
            Volatility Index
          </div>
          <div className="text-[9px] text-theme-accent">30-Day Average</div>
        </div>
        
        <div className="bg-theme-accent/10 p-2 rounded-md">
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-2">
              {Array(4).fill(0).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-[10px] bg-theme-accent/20 h-3 w-20 rounded"></div>
                    <div className="text-[9px] bg-theme-accent/20 h-3 w-10 rounded"></div>
                  </div>
                  <div className="h-1.5 bg-theme-accent/20 rounded-full overflow-hidden mb-2"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {selectedToken && tokenVolatility && (
                <>
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-[10px] font-medium text-theme-text-primary">{tokenVolatility.symbol} Volatility</div>
                    <div className="text-[9px] text-theme-text-secondary">{tokenVolatility.formatted}</div>
                  </div>
                  <div className="h-1.5 bg-theme-accent/20 rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full bg-theme-accent rounded-full" 
                      style={{ width: `${Math.min(100, tokenVolatility.value * 10)}%` }}
                    ></div>
                  </div>
                </>
              )}
              
              {comparisonVolatility.filter(item => item.symbol !== 'Market').map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-[10px] font-medium text-theme-text-primary">{item.symbol} Volatility</div>
                    <div className="text-[9px] text-theme-text-secondary">{item.formatted}</div>
                  </div>
                  <div className="h-1.5 bg-theme-accent/20 rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full bg-theme-accent rounded-full" 
                      style={{ width: `${Math.min(100, item.value * 10)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-between items-center mb-1">
                <div className="text-[10px] font-medium text-theme-text-primary">Market Average</div>
                <div className="text-[9px] text-theme-text-secondary">{marketAvgVolatility.toFixed(1)}%</div>
              </div>
              <div className="h-1.5 bg-theme-accent/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-theme-accent rounded-full" 
                  style={{ width: `${Math.min(100, marketAvgVolatility * 10)}%` }}
                ></div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolumeVolatility;