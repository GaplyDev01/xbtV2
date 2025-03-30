import { useQuery } from '@tanstack/react-query';
import { cryptoApi } from '../services/api';

export function useMarketData(tokenId: string | null, timeframe: string = '24h') {
  return useQuery({
    queryKey: ['market-data', tokenId, timeframe],
    queryFn: async () => {
      if (!tokenId) return null;
      return cryptoApi.get(`/coins/${tokenId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: timeframe === '24h' ? 1 : 
                timeframe === '7d' ? 7 : 
                timeframe === '30d' ? 30 : 365
        }
      });
    },
    enabled: !!tokenId,
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Refetch every minute
    retry: 3
  });
}