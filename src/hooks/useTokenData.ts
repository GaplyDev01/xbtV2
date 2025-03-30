import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cryptoApi } from '../services/api';
import type { CoinSearchResult } from '../services/cryptoApi';

export function useTokenData(token: CoinSearchResult | null) {
  const queryClient = useQueryClient();

  const {
    data: tokenDetails,
    error,
    isLoading
  } = useQuery({
    queryKey: ['token', token?.id],
    queryFn: async () => {
      if (!token?.id) return null;
      return cryptoApi.get(`/coins/${token.id}`);
    },
    enabled: !!token?.id,
    staleTime: 30000, // Consider data fresh for 30 seconds
    cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 3
  });

  // Prefetch data for related tokens
  const prefetchRelatedTokens = async (relatedIds: string[]) => {
    const promises = relatedIds.map(id =>
      queryClient.prefetchQuery({
        queryKey: ['token', id],
        queryFn: () => cryptoApi.get(`/coins/${id}`),
        staleTime: 30000
      })
    );
    await Promise.all(promises);
  };

  return {
    tokenDetails,
    error,
    isLoading,
    prefetchRelatedTokens
  };
}