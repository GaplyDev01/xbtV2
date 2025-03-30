import { useQuery } from '@tanstack/react-query';
import { twitterApi } from '../services/api';
import type { TwitterSearchResponse } from '../services/twitterApi';

export function useSocialData(token: string | null) {
  return useQuery<TwitterSearchResponse>({
    queryKey: ['social-data', token],
    queryFn: async () => {
      if (!token) return null;
      return twitterApi.get('/search', {
        params: {
          query: `${token} crypto`,
          search_type: 'Latest'
        }
      });
    },
    enabled: !!token,
    staleTime: 300000, // 5 minutes
    cacheTime: 600000, // 10 minutes
    retry: 2
  });
}