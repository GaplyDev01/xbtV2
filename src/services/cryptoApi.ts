import { z } from 'zod';
import axios from 'axios';
import axiosRetry from 'axios-retry';

export interface CoinSearchResult {
  id: string;
  name: string;
  symbol: string;
  api_symbol: string;
  market_cap_rank?: number;
  thumb?: string;
  large?: string;
  platforms: Record<string, string>;
}

export interface CryptoMarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  market_cap_change_percentage_24h: number;
}

export interface TopCoin extends CryptoMarketData {
  image: string;
  price_change_percentage: number;
}

export interface DeveloperData {
  forks: number;
  stars: number;
  subscribers: number;
  total_issues: number;
  closed_issues: number;
  pull_requests_merged: number;
  pull_request_contributors: number;
  code_additions_deletions_4_weeks: {
    additions: number;
    deletions: number;
  };
  commit_count_4_weeks: number;
  last_4_weeks_commit_activity_series: number[];
}

export interface RepoData {
  name: string;
  url: string;
  stars: number;
  forks: number;
  organization?: string;
}

export interface StatusUpdate {
  description: string;
  category: string;
  created_at: string;
  user: string;
  user_title?: string;
  pin: boolean;
  project: {
    type: string;
    id: string;
    name: string;
  };
}

export interface Category {
  id: string;
  name: string;
  market_cap: number;
  market_cap_change_24h: number;
  volume_24h: number;
  updated_at?: string;
}

export class CryptoAPIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'CryptoAPIError';
  }
}

// Configure axios with retry logic
const api = axios.create({
  baseURL: '/api/coingecko',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'x-cg-pro-api-key': import.meta.env.VITE_COINGECKO_API_KEY || 'CG-gTgiBRydF4PqMfgYZ4Wr6fxB'
  }
});

axiosRetry(api, { 
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           error.response?.status === 429 || // Rate limit
           error.response?.status === 500 || // Server error
           error.response?.status === 502 || // Bad gateway
           error.response?.status === 503 || // Service unavailable
           error.response?.status === 504;   // Gateway timeout
  }
});

// Base API call function with error handling
const fetchCoinGecko = async (endpoint: string, params: Record<string, string> = {}) => {
  try {
    const response = await api.get(endpoint, { params });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        console.warn(`Resource not found at ${endpoint}`);
        return null;
      }
      if (error.response?.status === 429) {
        throw new CryptoAPIError('Rate limit exceeded. Please try again later.', 429);
      }
      throw new CryptoAPIError(
        `API Error: ${error.response?.status} - ${error.response?.statusText}`,
        error.response?.status
      );
    }
    throw error;
  }
};

// Export all API functions
export const getCoinsMarketData = async (
  currency: string = 'usd',
  ids?: string[],
  order: string = 'market_cap_desc',
  limit: number = 100,
  category?: string
): Promise<CryptoMarketData[]> => {
  const params: Record<string, string> = {
    vs_currency: currency,
    order,
    per_page: limit.toString(),
    sparkline: 'false'
  };
  
  if (ids?.length) {
    params.ids = ids.join(',');
  }

  if (category) {
    params.category = category;
  }
  
  return await fetchCoinGecko('/coins/markets', params);
};

export const searchCrypto = async (query: string): Promise<{ coins: CoinSearchResult[] }> => {
  return await fetchCoinGecko('/search', { query });
};

export const getGlobalData = async () => {
  return await fetchCoinGecko('/global');
};

export const getTrendingCoins = async () => {
  return await fetchCoinGecko('/search/trending');
};

export const getCoinDetails = async (id: string) => {
  const params = {
    localization: 'false',
    tickers: 'true',
    market_data: 'true',
    community_data: 'true',
    developer_data: 'true',
    sparkline: 'true'
  };
  
  return await fetchCoinGecko(`/coins/${id}`, params);
};

export const getHistoricalMarketData = async (id: string, days: number | 'max', interval?: string) => {
  const params: Record<string, string> = {
    vs_currency: 'usd',
    days: days.toString()
  };
  if (interval) {
    params.interval = interval;
  }
  return await fetchCoinGecko(`/coins/${id}/market_chart`, params);
};

export const getCoinOHLC = async (id: string, days: number) => {
  return await fetchCoinGecko(`/coins/${id}/ohlc`, {
    vs_currency: 'usd',
    days: days.toString()
  });
};

export const getCoinMarketChartRange = async (
  id: string,
  currency: string,
  from: number,
  to: number
) => {
  return await fetchCoinGecko(`/coins/${id}/market_chart/range`, {
    vs_currency: currency,
    from: from.toString(),
    to: to.toString()
  });
};

export const getTopGainersLosers = async (
  currency: string = 'usd',
  timeframe: string = '24h',
  limit: number = 10
) => {
  return await fetchCoinGecko('/coins/top_gainers_losers', {
    vs_currency: currency,
    duration: timeframe,
    top: limit.toString()
  });
};

export const getGlobalMarketChart = async (days: string = '30') => {
  return await fetchCoinGecko('/global/market_cap_chart', { days });
};

export const getExchangeVolumeChart = async (exchangeId: string, days: number = 30) => {
  return await fetchCoinGecko(`/exchanges/${exchangeId}/volume_chart`, {
    days: days.toString()
  });
};

export const getTokenDeveloperData = async (id: string): Promise<DeveloperData> => {
  const response = await fetchCoinGecko(`/coins/${id}/developer_data`);
  if (!response) {
    console.warn(`No developer data available for token: ${id}`);
    return {
      forks: 0,
      stars: 0,
      subscribers: 0,
      total_issues: 0,
      closed_issues: 0,
      pull_requests_merged: 0,
      pull_request_contributors: 0,
      code_additions_deletions_4_weeks: {
        additions: 0,
        deletions: 0
      },
      commit_count_4_weeks: 0,
      last_4_weeks_commit_activity_series: []
    };
  }
  return response;
};

export const getTokenRepoStats = async (id: string): Promise<RepoData[]> => {
  const response = await fetchCoinGecko(`/coins/${id}/repositories`);
  return response || [];
};

export const getTokenStatusUpdates = async (
  id: string,
  page: number = 1,
  per_page: number = 10
): Promise<StatusUpdate[]> => {
  const response = await fetchCoinGecko(`/coins/${id}/status_updates`, {
    page: page.toString(),
    per_page: per_page.toString()
  });
  return response?.status_updates || [];
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await fetchCoinGecko('/coins/categories');
  
  // Transform the response to match our Category interface
  return response.map((category: any) => ({
    id: category.id,
    name: category.name,
    market_cap: category.market_cap,
    market_cap_change_24h: category.market_cap_change_24h,
    volume_24h: category.volume_24h,
    updated_at: new Date().toISOString()
  }));
};