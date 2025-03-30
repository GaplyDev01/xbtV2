import { useState, useEffect } from 'react';
import { ApiError, getCachedData } from '../services/api';

interface UseApiOptions<T> {
  initialData?: T;
  cacheKey?: string;
  cacheTTL?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  transform?: (data: any) => T;
}

export function useApi<T>(
  fetchFn: () => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | undefined>(options.initialData);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let result;
      if (options.cacheKey) {
        result = await getCachedData(
          options.cacheKey,
          fetchFn,
          options.cacheTTL
        );
      } else {
        result = await fetchFn();
      }

      const transformedData = options.transform ? options.transform(result) : result;
      setData(transformedData);
      options.onSuccess?.(transformedData);
    } catch (err) {
      console.error('API Error:', err);
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      options.onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    error,
    isLoading,
    refetch: fetchData
  };
}

export function usePollingApi<T>(
  fetchFn: () => Promise<T>,
  interval: number,
  options: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | undefined>(options.initialData);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    let timeoutId: number;

    const fetchData = async () => {
      if (!mounted) return;

      try {
        setIsLoading(true);
        setError(null);

        let result;
        if (options.cacheKey) {
          result = await getCachedData(
            options.cacheKey,
            fetchFn,
            options.cacheTTL
          );
        } else {
          result = await fetchFn();
        }

        if (!mounted) return;

        const transformedData = options.transform ? options.transform(result) : result;
        setData(transformedData);
        options.onSuccess?.(transformedData);
      } catch (err) {
        console.error('API Error:', err);
        if (!mounted) return;

        const error = err instanceof Error ? err : new Error('An unknown error occurred');
        setError(error);
        options.onError?.(error);
      } finally {
        if (mounted) {
          setIsLoading(false);
          timeoutId = setTimeout(fetchData, interval);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [interval]);

  return {
    data,
    error,
    isLoading
  };
}