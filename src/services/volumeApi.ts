import { z } from 'zod';

export interface ExchangeVolume {
  exchange: string;
  volume: number;
  percentage: number;
  volume_formatted: string;
}

export interface TokenVolatility {
  symbol: string;
  value: number;
  formatted: string;
}

export interface VolumeVolatilityResponse {
  exchange_data: ExchangeVolume[];
  total_volume_formatted: string;
  token_volatility: TokenVolatility;
}

export const getTokenId = (symbol: string): string => {
  const symbolMap: Record<string, string> = {
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

  return symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
};

const volumeApi = {
  getVolumeVolatilityData: async (tokenId: string): Promise<VolumeVolatilityResponse> => {
    const apiKey = import.meta.env.VITE_COINGECKO_API_KEY;
    if (!apiKey) {
      throw new Error('CoinGecko API key is missing. Please set VITE_COINGECKO_API_KEY in your .env file.');
    }

    try {
      const response = await fetch(
        `/api/coingecko/coins/${tokenId}/market_chart?vs_currency=usd&days=1&interval=hourly`,
        {
          headers: {
            'accept': 'application/json',
            'x-cg-pro-api-key': apiKey
          }
        }
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid CoinGecko API key. Please check your API key and try again.');
        }
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      
      // Calculate total volume
      const totalVolume = data.total_volumes[data.total_volumes.length - 1][1];
      
      // Calculate price change percentage
      const firstPrice = data.prices[0][1];
      const lastPrice = data.prices[data.prices.length - 1][1];
      const priceChangePercentage = ((lastPrice - firstPrice) / firstPrice) * 100;
      
      // Create exchange data from volumes
      const exchangeData: ExchangeVolume[] = data.total_volumes.slice(-5).map((volume: [number, number]) => ({
        exchange: 'All Exchanges',
        volume: volume[1],
        percentage: (volume[1] / totalVolume) * 100,
        volume_formatted: `$${(volume[1] / 1000000000).toFixed(1)}B`
      }));
    
      return {
        exchange_data: exchangeData,
        total_volume_formatted: `$${(totalVolume / 1000000000).toFixed(1)}B`,
        token_volatility: {
          symbol: tokenId.toUpperCase(),
          value: Math.abs(priceChangePercentage),
          formatted: `${Math.abs(priceChangePercentage).toFixed(1)}%`
        }
      };
    } catch (error) {
      console.error('Failed to fetch volume/volatility data:', error);
      let errorMessage = 'Failed to load volume data. Using default values.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Return mock data
      return {
        exchange_data: [
          {
            exchange: 'All Exchanges',
            volume: 1000000000,
            percentage: 100,
            volume_formatted: '$1.0B'
          }
        ],
        total_volume_formatted: '$1.0B',
        token_volatility: {
          symbol: tokenId.toUpperCase(),
          value: 5,
          formatted: '5.0%'
        }
      };
    }
  },

  getComparisonVolatilityData: async (): Promise<TokenVolatility[]> => {
    const apiKey = import.meta.env.VITE_COINGECKO_API_KEY;
    if (!apiKey) {
      throw new Error('CoinGecko API key is missing. Please set VITE_COINGECKO_API_KEY in your .env file.');
    }

    try {
      const [btcResponse, ethResponse, globalResponse] = await Promise.all([
        fetch('/api/coingecko/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true', {
          headers: {
            'accept': 'application/json',
            'x-cg-pro-api-key': apiKey
          }
        }),
        fetch('/api/coingecko/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true', {
          headers: {
            'accept': 'application/json',
            'x-cg-pro-api-key': apiKey
          }
        }),
        fetch('/api/coingecko/global', {
          headers: {
            'accept': 'application/json',
            'x-cg-pro-api-key': apiKey
          }
        })
      ]);

      if (!btcResponse.ok || !ethResponse.ok || !globalResponse.ok) {
        throw new Error('Failed to fetch comparison data');
      }

      const [btcData, ethData, globalData] = await Promise.all([
        btcResponse.json(),
        ethResponse.json(),
        globalResponse.json()
      ]);

      return [
        {
          symbol: 'BTC',
          value: Math.abs(btcData.bitcoin.usd_24h_change || 0),
          formatted: `${Math.abs(btcData.bitcoin.usd_24h_change || 0).toFixed(1)}%`
        },
        {
          symbol: 'ETH',
          value: Math.abs(ethData.ethereum.usd_24h_change || 0),
          formatted: `${Math.abs(ethData.ethereum.usd_24h_change || 0).toFixed(1)}%`
        },
        {
          symbol: 'Market',
          value: Math.abs(globalData.data?.market_cap_change_percentage_24h_usd || 0),
          formatted: `${Math.abs(globalData.data?.market_cap_change_percentage_24h_usd || 0).toFixed(1)}%`
        }
      ];
    } catch (error) {
      console.error('Failed to fetch comparison data:', error);
      return [
        { symbol: 'BTC', value: 4.2, formatted: '4.2%' },
        { symbol: 'ETH', value: 5.7, formatted: '5.7%' },
        { symbol: 'Market', value: 6.8, formatted: '6.8%' }
      ];
    }
  }
};

export default volumeApi;