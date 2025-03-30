import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  getCoinDetails, 
  getTokenDeveloperData,
  getTokenRepoStats,
  getTokenStatusUpdates,
  getCoinOHLC,
  getCoinMarketChartRange 
} from '../services/cryptoApi';
import PriceChart from './charts/PriceChart';
import { VolumeVolatility, SocialSentiment, DeveloperActivity } from './ui';
import { Loader2, ExternalLink } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/chartUtils';

const TokenDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tokenData, setTokenData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokenData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);

      try {
        const [details, devData, repoStats, statusUpdates] = await Promise.all([
          getCoinDetails(id),
          getTokenDeveloperData(id),
          getTokenRepoStats(id),
          getTokenStatusUpdates(id)
        ]);

        setTokenData({
          ...details,
          developer_data: devData,
          repository_data: repoStats,
          status_updates: statusUpdates
        });
      } catch (err) {
        console.error('Error fetching token data:', err);
        setError('Failed to load token data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={40} className="text-theme-accent animate-spin" />
      </div>
    );
  }

  if (error || !tokenData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-theme-text-primary mb-4">{error || 'Token not found'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Token Header */}
      <div className="bg-theme-bg rounded-lg border border-theme-border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {tokenData.image?.large && (
              <img 
                src={tokenData.image.large} 
                alt={tokenData.name} 
                className="w-16 h-16 rounded-full mr-4"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-theme-text-primary">
                {tokenData.name}
                <span className="ml-2 text-theme-text-secondary">
                  {tokenData.symbol?.toUpperCase()}
                </span>
              </h1>
              <div className="flex items-center mt-1">
                {tokenData.market_data?.market_cap_rank && (
                  <span className="text-sm bg-theme-accent/10 text-theme-accent px-2 py-1 rounded-full mr-2">
                    Rank #{tokenData.market_data.market_cap_rank}
                  </span>
                )}
                <a 
                  href={tokenData.links?.homepage[0]} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-theme-accent hover:text-theme-accent-dark"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-theme-text-primary">
              {formatCurrency(tokenData.market_data?.current_price?.usd)}
            </div>
            <div className={`text-sm ${
              tokenData.market_data?.price_change_percentage_24h >= 0 
                ? 'text-green-500' 
                : 'text-red-500'
            }`}>
              {formatPercentage(tokenData.market_data?.price_change_percentage_24h)}
            </div>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="bg-theme-bg rounded-lg border border-theme-border p-6">
        <PriceChart
          tokenId={id}
          symbol={tokenData.symbol}
          currentPrice={tokenData.market_data?.current_price?.usd}
          priceChange24h={tokenData.market_data?.price_change_percentage_24h}
          height={400}
          showControls={true}
        />
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-theme-bg rounded-lg border border-theme-border p-4">
          <div className="text-sm text-theme-text-secondary mb-1">Market Cap</div>
          <div className="text-lg font-medium text-theme-text-primary">
            {formatCurrency(tokenData.market_data?.market_cap?.usd, 'USD', true)}
          </div>
        </div>
        
        <div className="bg-theme-bg rounded-lg border border-theme-border p-4">
          <div className="text-sm text-theme-text-secondary mb-1">24h Volume</div>
          <div className="text-lg font-medium text-theme-text-primary">
            {formatCurrency(tokenData.market_data?.total_volume?.usd, 'USD', true)}
          </div>
        </div>
        
        <div className="bg-theme-bg rounded-lg border border-theme-border p-4">
          <div className="text-sm text-theme-text-secondary mb-1">Circulating Supply</div>
          <div className="text-lg font-medium text-theme-text-primary">
            {tokenData.market_data?.circulating_supply?.toLocaleString()}
          </div>
        </div>
        
        <div className="bg-theme-bg rounded-lg border border-theme-border p-4">
          <div className="text-sm text-theme-text-secondary mb-1">Max Supply</div>
          <div className="text-lg font-medium text-theme-text-primary">
            {tokenData.market_data?.max_supply?.toLocaleString() || '∞'}
          </div>
        </div>
      </div>

      {/* Analysis Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-theme-bg rounded-lg border border-theme-border p-4">
          <h3 className="text-lg font-medium text-theme-text-primary mb-4">Volume & Volatility</h3>
          <VolumeVolatility />
        </div>
        
        <div className="bg-theme-bg rounded-lg border border-theme-border p-4">
          <h3 className="text-lg font-medium text-theme-text-primary mb-4">Social Sentiment</h3>
          <SocialSentiment />
        </div>
      </div>

      {/* Developer Activity */}
      <div className="bg-theme-bg rounded-lg border border-theme-border p-4">
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">Developer Activity</h3>
        <DeveloperActivity />
      </div>
    </div>
  );
};

export default TokenDetails;