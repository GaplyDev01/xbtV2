import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { Loader2, TrendingUp, TrendingDown, Star, ExternalLink } from 'lucide-react';
import { useCrypto } from '../../context/CryptoContext';
import { useToken } from '../../context/TokenContext';
import { formatCurrency, formatPercentage } from '../../utils/chartUtils';
import { CryptoMarketData } from '../../services/cryptoApi';

interface TokenCategory {
  id: string;
  name: string;
  description: string;
  coingeckoId: string;
  tokens: CryptoMarketData[];
}

const TokenViewer: React.FC = () => {
  const { getCoinsMarketData } = useCrypto();
  const { setSelectedToken, setTokenDetails } = useToken();
  const [categories, setCategories] = useState<TokenCategory[]>([
    {
      id: 'defi',
      name: 'DeFi',
      description: 'Decentralized Finance Protocols',
      coingeckoId: 'decentralized-finance-defi',
      tokens: []
    },
    {
      id: 'layer-1',
      name: 'Layer 1',
      description: 'Base Layer Blockchain Platforms',
      coingeckoId: 'layer-1',
      tokens: []
    },
    {
      id: 'gaming',
      name: 'Gaming & Metaverse',
      description: 'Gaming and Virtual World Tokens',
      coingeckoId: 'gaming',
      tokens: []
    },
    {
      id: 'infrastructure',
      name: 'Infrastructure',
      description: 'Blockchain Infrastructure & Tools',
      coingeckoId: 'infrastructure',
      tokens: []
    }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('defi');

  useEffect(() => {
    const fetchCategoryData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const categoryData = await Promise.all(
          categories.map(async (category) => {
            const tokens = await getCoinsMarketData('usd', undefined, 'market_cap_desc', 10, category.coingeckoId);
            return {
              ...category,
              tokens
            };
          })
        );

        setCategories(categoryData);
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError('Failed to load token data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryData();
  }, [getCoinsMarketData]);

  const handleTokenSelect = async (token: CryptoMarketData) => {
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
      setSelectedToken({
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        api_symbol: token.symbol,
        market_cap_rank: token.market_cap_rank,
        platforms: {}
      });
    } catch (err) {
      console.error('Error fetching token details:', err);
    }
  };

  return (
    <div className="h-full">
      <Tabs defaultValue={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid grid-cols-4 mb-4">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs">
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <div className="text-xs text-theme-text-secondary mb-4">
              {category.description}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="text-theme-accent animate-spin" />
                <span className="ml-2 text-theme-text-secondary">Loading {category.name} tokens...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-theme-text-secondary">
                <p>{error}</p>
              </div>
            ) : category.tokens.length === 0 ? (
              <div className="text-center py-8 text-theme-text-secondary">
                <p>No tokens found in this category</p>
              </div>
            ) : (
              <div className="space-y-2">
                {category.tokens.map((token) => (
                  <div
                    key={token.id}
                    className="flex items-center justify-between p-3 bg-theme-bg border border-theme-border rounded-lg hover:bg-theme-accent/5 cursor-pointer transition-colors"
                    onClick={() => handleTokenSelect(token)}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-theme-accent/10 flex items-center justify-center mr-3">
                        <span className="text-xs font-bold text-theme-accent">
                          {token.symbol.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium text-theme-text-primary">
                            {token.name}
                          </span>
                          {token.market_cap_rank && (
                            <span className="ml-2 text-[10px] bg-theme-accent/10 text-theme-accent px-1.5 py-0.5 rounded-full">
                              #{token.market_cap_rank}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-theme-text-secondary">
                          {token.symbol.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium text-theme-text-primary">
                        {formatCurrency(token.current_price)}
                      </div>
                      <div className={`flex items-center justify-end text-xs ${
                        token.price_change_percentage_24h >= 0 
                          ? 'text-green-500' 
                          : 'text-red-500'
                      }`}>
                        {token.price_change_percentage_24h >= 0 ? (
                          <TrendingUp size={12} className="mr-1" />
                        ) : (
                          <TrendingDown size={12} className="mr-1" />
                        )}
                        {formatPercentage(token.price_change_percentage_24h)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TokenViewer;