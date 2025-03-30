import { CoinSearchResult } from '../services/cryptoApi';

/**
 * Utility functions for token data propagation and manipulation
 */

/**
 * Formats token price for display
 * @param price Token price in number
 * @returns Formatted price string
 */
export const formatTokenPrice = (price: number | undefined): string => {
  if (price === undefined) return 'N/A';
  
  // Format based on price range
  if (price < 0.000001) {
    return price.toExponential(4);
  } else if (price < 0.001) {
    return price.toFixed(8);
  } else if (price < 1) {
    return price.toFixed(6);
  } else if (price < 1000) {
    return price.toFixed(2);
  } else {
    return price.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }
};

/**
 * Constructs a token search URL for various platforms
 * @param token Token data
 * @param platform Platform name ('coingecko', 'solscan', 'twitter', etc.)
 * @returns URL string
 */
export const getTokenExternalUrl = (token: CoinSearchResult, platform: string): string => {
  switch (platform.toLowerCase()) {
    case 'coingecko': {
      return `https://www.coingecko.com/en/coins/${token.id}`;
    }
    case 'solscan': {
      const solanaPlatforms = Object.entries(token.platforms || {})
        .find(([key]) => key.toLowerCase().includes('sol'));
      
      if (solanaPlatforms) {
        return `https://solscan.io/token/${solanaPlatforms[1]}`;
      }
      return `https://solscan.io/search?q=${token.symbol}`;
    }
    case 'twitter': {
      return `https://twitter.com/search?q=%24${encodeURIComponent(token.symbol.toUpperCase())}`;
    }
    case 'binance': {
      return `https://www.binance.com/en/trade/${token.symbol.toUpperCase()}_USDT`;
    }
    default: {
      return `https://www.google.com/search?q=${encodeURIComponent(token.name)}+crypto`;
    }
  }
};

/**
 * Determines if a component needs to update based on token selection
 * @param componentType Type of the component
 * @param selectedToken Current selected token
 * @returns Boolean indicating if component needs token-based updates
 */
export const shouldComponentUpdate = (
  componentType: string, 
  selectedToken: CoinSearchResult | null
): boolean => {
  if (!selectedToken) return false;
  
  // List of components that should update when a token is selected
  const tokenAwareComponents = [
    'price-chart',
    'token-search',
    'token-social',
    'social-sentiment',
    'market-overview',
    'volume-volatility',
    'news-feed',
    'ai-insights'
  ];
  
  return tokenAwareComponents.includes(componentType);
};

// Define interface for token details
export interface TokenDetails {
  id: string;
  name: string;
  symbol?: string;
  market_data?: {
    current_price?: {
      usd?: number;
    };
    price_change_percentage_24h?: number;
    price_change_percentage_30d_in_currency?: {
      usd?: number;
    };
    market_cap?: {
      usd?: number;
    };
    market_cap_rank?: number;
    total_volume?: {
      usd?: number;
    };
  };
  tickers?: Array<{
    market: {
      name: string;
    };
    volume: number;
    converted_volume: {
      usd: number;
    };
  }>;
  links?: {
    twitter_screen_name?: string;
    subreddit_url?: string;
  };
  community_score?: number;
  developer_score?: number;
  sentiment_votes_up_percentage?: number;
}

/**
 * Gets component-specific token data
 * @param componentType Type of component
 * @param tokenDetails Token details
 * @returns Component-specific data
 */
export const getComponentTokenData = (componentType: string, tokenDetails: TokenDetails | null) => {
  if (!tokenDetails) return null;
  
  switch (componentType) {
    case 'price-chart':
      return {
        symbol: tokenDetails.symbol?.toUpperCase(),
        name: tokenDetails.name,
        currentPrice: tokenDetails.market_data?.current_price?.usd,
        priceChange24h: tokenDetails.market_data?.price_change_percentage_24h,
        marketCap: tokenDetails.market_data?.market_cap?.usd,
        volume: tokenDetails.market_data?.total_volume?.usd,
      };
    case 'market-overview':
      return {
        name: tokenDetails.name,
        symbol: tokenDetails.symbol?.toUpperCase(),
        currentPrice: tokenDetails.market_data?.current_price?.usd,
        priceChange24h: tokenDetails.market_data?.price_change_percentage_24h,
        marketCap: tokenDetails.market_data?.market_cap?.usd,
        volume: tokenDetails.market_data?.total_volume?.usd,
        rank: tokenDetails.market_data?.market_cap_rank,
      };
    case 'volume-volatility':
      return {
        name: tokenDetails.name,
        symbol: tokenDetails.symbol?.toUpperCase(),
        tickers: tokenDetails.tickers,
        totalVolume: tokenDetails.market_data?.total_volume?.usd,
        volatility30d: Math.abs(tokenDetails.market_data?.price_change_percentage_30d_in_currency?.usd),
      };
    case 'social-sentiment':
      return {
        name: tokenDetails.name,
        symbol: tokenDetails.symbol?.toUpperCase(),
        twitterUrl: tokenDetails.links?.twitter_screen_name ? 
          `https://twitter.com/${tokenDetails.links.twitter_screen_name}` : null,
        redditUrl: tokenDetails.links?.subreddit_url || null,
        communityScore: tokenDetails.community_score,
        developerScore: tokenDetails.developer_score,
        sentimentVotes: tokenDetails.sentiment_votes_up_percentage,
      };
    case 'news-feed':
      return {
        name: tokenDetails.name,
        symbol: tokenDetails.symbol?.toUpperCase(),
        searchTerms: [
          tokenDetails.name,
          tokenDetails.symbol?.toUpperCase(),
          tokenDetails.id
        ],
      };
    case 'top-movers':
      return {
        id: tokenDetails.id,
        name: tokenDetails.name,
        symbol: tokenDetails.symbol?.toUpperCase(),
        currentPrice: tokenDetails.market_data?.current_price?.usd,
        priceChange24h: tokenDetails.market_data?.price_change_percentage_24h,
      };
    default:
      return {
        name: tokenDetails.name,
        symbol: tokenDetails.symbol?.toUpperCase(),
        id: tokenDetails.id
      };
  }
};

/**
 * Creates a formatted token detail text for notifications or displays
 * @param token Token data
 * @param tokenDetails Extended token details
 * @returns Formatted string with token information
 */
export const getTokenDisplaySummary = (
  token: CoinSearchResult | null, 
  tokenDetails: TokenDetails | null
): string => {
  if (!token) return '';
  
  const price = tokenDetails?.market_data?.current_price?.usd 
    ? formatTokenPrice(tokenDetails.market_data.current_price.usd)
    : 'Unknown';
    
  const change = tokenDetails?.market_data?.price_change_percentage_24h
    ? (tokenDetails.market_data.price_change_percentage_24h > 0 ? '+' : '') + 
      tokenDetails.market_data.price_change_percentage_24h.toFixed(2) + '%'
    : '';

  const marketCap = tokenDetails?.market_data?.market_cap?.usd
    ? `Mkt Cap: $${(tokenDetails.market_data.market_cap.usd / 1000000000).toFixed(2)}B`
    : '';
    
  return `${token.symbol.toUpperCase()} ${price} ${change} ${marketCap}`.trim();
};