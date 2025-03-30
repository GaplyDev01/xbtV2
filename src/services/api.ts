import axios from 'axios';
import axiosRetry from 'axios-retry';

// Create base API instance
const api = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Configure retry logic
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

// API endpoints configuration
const endpoints = {
  crypto: {
    base: '/api/coingecko',
    headers: {
      'x-cg-pro-api-key': import.meta.env.VITE_COINGECKO_API_KEY || 'CG-gTgiBRydF4PqMfgYZ4Wr6fxB'
    }
  },
  twitter: {
    base: '/api/twitter',
    headers: {
      'x-rapidapi-host': 'twitter-api45.p.rapidapi.com',
      'x-rapidapi-key': '56da9e331emshb1150f72dcd5029p12a375jsnb16e7026a17a'
    }
  }
};

// Create API instances for different services
export const cryptoApi = {
  instance: api.create({
    baseURL: endpoints.crypto.base,
    headers: endpoints.crypto.headers
  }),
  
  get: async (url: string, config = {}) => {
    try {
      const response = await cryptoApi.instance.get(url, config);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
  
  post: async (url: string, data = {}, config = {}) => {
    try {
      const response = await cryptoApi.instance.post(url, data, config);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }
};

export const twitterApi = {
  instance: api.create({
    baseURL: endpoints.twitter.base,
    headers: endpoints.twitter.headers
  }),
  
  get: async (url: string, config = {}) => {
    try {
      const response = await twitterApi.instance.get(url, config);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }
};

// Error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function handleApiError(error: any) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404) {
      console.warn(`Resource not found: ${error.config?.url}`);
      return null;
    }
    if (error.response?.status === 429) {
      throw new ApiError('Rate limit exceeded. Please try again later.', 429);
    }
    throw new ApiError(
      `API Error: ${error.response?.status} - ${error.response?.statusText}`,
      error.response?.status
    );
  }
  throw error;
}

// Response caching
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

export const getCachedData = async (
  key: string,
  fetchFn: () => Promise<any>,
  ttl: number = CACHE_TTL
) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  const data = await fetchFn();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
};

// Batch request handler
export const batchRequests = async <T>(
  requests: (() => Promise<T>)[],
  batchSize = 3,
  delayMs = 1000
): Promise<T[]> => {
  const results: T[] = [];
  
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(req => req()));
    results.push(...batchResults);
    
    if (i + batchSize < requests.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return results;
};