import React, { useState } from 'react';
import Card from '../Card';
import TokenSearch from '../common/TokenSearch/TokenSearch';
import { useToken } from '../../context/TokenContext';
import { CoinSearchResult } from '../../services/cryptoApi';
import PriceChart from '../charts/PriceChart';
import { 
  Coins, 
  RefreshCw, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown,
  Sparkles,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../utils/chartUtils';

interface TokenSearchCardProps {
  onAnalyze?: () => void;
}

const TokenSearchCard: React.FC<TokenSearchCardProps> = ({ onAnalyze }) => {
  const { selectedToken, tokenDetails, setSelectedToken, setTokenDetails } = useToken();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleTokenSelect = async (token: CoinSearchResult) => {
    setSelectedToken(token);
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
      
      // Fetch current data
      const currentDataPromise = fetch(
        `https://pro-api.coingecko.com/api/v3/coins/${token.id}?localization=false&tickers=true&market_data=true&community_data=true&developer_data=true&sparkline=true`,
        options
      );

      // Fetch historical data
      const date = '30-12-2022'; // You can make this dynamic if needed
      const historicalDataPromise = fetch(
        `https://pro-api.coingecko.com/api/v3/coins/${token.id}/history?date=${date}&localization=false`,
        options
      );

      // Wait for both requests to complete
      const [currentResponse, historicalResponse] = await Promise.all([
        currentDataPromise,
        historicalDataPromise
      ]);

      if (!currentResponse.ok || !historicalResponse.ok) {
        throw new Error(`API returned ${currentResponse.status} or ${historicalResponse.status}`);
      }

      const [currentDetails, historicalDetails] = await Promise.all([
        currentResponse.json(),
        historicalResponse.json()
      ]);

      // Combine the data
      const combinedDetails = {
        ...currentDetails,
        historical_data: historicalDetails
      };

      setTokenDetails(combinedDetails);
    } catch (err) {
      console.error('Error fetching token details:', err);
      setError('Failed to load token details. Please try again later.');
      setTokenDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="Token Search" icon={<Coins size={14} />}>
      <div className="h-full flex flex-col">
        <div className="mb-3">
          <TokenSearch 
            onSelectToken={handleTokenSelect} 
            placeholder="Search for any token..." 
            className="max-w-full"
          />
          <p className="text-[10px] text-theme-text-secondary mt-1">
            Search for any cryptocurrency by name or symbol
          </p>
        </div>
        
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <RefreshCw size={20} className="text-theme-accent animate-spin" />
          </div>
        )}
        
        {error && (
          <div className="flex-1 p-3 bg-theme-accent/10 rounded-lg border border-theme-accent/20 text-center">
            <p className="text-xs text-theme-text-primary">{error}</p>
          </div>
        )}
        
        {!isLoading && !error && tokenDetails && (
          <div className="flex-1 flex flex-col">
            <div className="bg-theme-accent/10 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {tokenDetails.image?.thumb ? (
                    <img 
                      src={tokenDetails.image.thumb} 
                      alt={tokenDetails.name} 
                      className="w-6 h-6 rounded-full mr-2" 
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-theme-accent/20 flex items-center justify-center mr-2">
                      <span className="text-[10px] font-bold text-theme-accent">
                        {tokenDetails.symbol?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-medium text-theme-text-primary">
                      {tokenDetails.name}
                      <span className="ml-1 text-[10px] text-theme-text-secondary">
                        {tokenDetails.symbol?.toUpperCase()}
                      </span>
                    </h4>
                    
                    {tokenDetails.market_data?.market_cap_rank && (
                      <span className="text-[10px] text-theme-text-secondary">
                        Rank #{tokenDetails.market_data.market_cap_rank}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={onAnalyze}
                    className="flex items-center px-3 py-1.5 text-sm bg-theme-accent hover:bg-theme-accent-dark text-theme-bg rounded-lg transition-colors"
                  >
                    <Sparkles size={14} className="mr-2" />
                    Get AI Insights
                  </button>
                  
                  <a
                    href={`https://www.coingecko.com/en/coins/${tokenDetails.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-theme-accent hover:text-theme-accent-dark"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
              
              {tokenDetails.market_data?.current_price?.usd && (
                <div className="flex justify-between items-center">
                  <div className="text-sm font-bold text-theme-text-primary">
                    {formatCurrency(tokenDetails.market_data.current_price.usd)}
                  </div>
                  
                  {tokenDetails.market_data.price_change_percentage_24h && (
                    <div className={`flex items-center text-xs ${
                      tokenDetails.market_data.price_change_percentage_24h >= 0 
                        ? 'text-green-500' 
                        : 'text-red-500'
                    }`}>
                      {tokenDetails.market_data.price_change_percentage_24h >= 0 ? (
                        <TrendingUp size={12} className="mr-1" />
                      ) : (
                        <TrendingDown size={12} className="mr-1" />
                      )}
                      {formatPercentage(tokenDetails.market_data.price_change_percentage_24h)}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Price Chart */}
            <div className="mb-3">
              <PriceChart
                tokenId={tokenDetails.id}
                symbol={tokenDetails.symbol}
                currentPrice={tokenDetails.market_data?.current_price?.usd}
                priceChange24h={tokenDetails.market_data?.price_change_percentage_24h}
                height={200}
                showControls={false}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {/* Market Cap */}
              <div className="p-2 bg-theme-accent/5 rounded-lg">
                <div className="text-theme-text-secondary mb-1">Market Cap</div>
                <div className="font-medium text-theme-text-primary">
                  {tokenDetails.market_data?.market_cap?.usd 
                    ? formatCurrency(tokenDetails.market_data.market_cap.usd, 'USD', true)
                    : 'N/A'
                  }
                </div>
              </div>
              
              {/* 24h Volume */}
              <div className="p-2 bg-theme-accent/5 rounded-lg">
                <div className="text-theme-text-secondary mb-1">24h Volume</div>
                <div className="font-medium text-theme-text-primary">
                  {tokenDetails.market_data?.total_volume?.usd 
                    ? formatCurrency(tokenDetails.market_data.total_volume.usd, 'USD', true)
                    : 'N/A'
                  }
                </div>
              </div>
              
              {/* 7d Change */}
              <div className="p-2 bg-theme-accent/5 rounded-lg">
                <div className="text-theme-text-secondary mb-1">7d Change</div>
                <div className={`font-medium flex items-center ${
                  tokenDetails.market_data?.price_change_percentage_7d >= 0 
                    ? 'text-green-500' 
                    : tokenDetails.market_data?.price_change_percentage_7d < 0
                      ? 'text-red-500'
                      : 'text-theme-text-primary'
                }`}>
                  {tokenDetails.market_data?.price_change_percentage_7d 
                    ? formatPercentage(tokenDetails.market_data.price_change_percentage_7d) 
                    : 'N/A'
                  }
                </div>
              </div>
              
              {/* 30d Change */}
              <div className="p-2 bg-theme-accent/5 rounded-lg">
                <div className="text-theme-text-secondary mb-1">30d Change</div>
                <div className={`font-medium flex items-center ${
                  tokenDetails.market_data?.price_change_percentage_30d >= 0 
                    ? 'text-green-500' 
                    : tokenDetails.market_data?.price_change_percentage_30d < 0
                      ? 'text-red-500'
                      : 'text-theme-text-primary'
                }`}>
                  {tokenDetails.market_data?.price_change_percentage_30d 
                    ? formatPercentage(tokenDetails.market_data.price_change_percentage_30d)
                    : 'N/A'
                  }
                </div>
              </div>
            </div>
          </div>
        )}
        
        {!isLoading && !error && !tokenDetails && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <Coins size={24} className="text-theme-accent/30 mb-2" />
            <p className="text-xs text-theme-text-secondary">
              Search for a token to view its current price and market data
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TokenSearchCard;