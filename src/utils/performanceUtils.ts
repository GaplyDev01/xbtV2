/**
 * Performance optimization utilities
 */

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last time it was invoked.
 * 
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @param immediate Whether to invoke the function on the leading edge instead of trailing edge
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: Parameters<T>): void {
    const context = this;
    
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func.apply(context, args);
  };
}

/**
 * A specialized debounce function specifically for localStorage operations
 * to prevent excessive writes which can impact performance.
 * 
 * @param key The localStorage key to write to
 * @param wait The number of milliseconds to delay the writes
 * @returns A function that debounces writes to localStorage for the specified key
 */
export function debounceLocalStorage<T>(
  key: string,
  wait: number = 500
): (data: T) => void {
  const saveToLocalStorage = debounce((data: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving to localStorage (key: ${key}):`, error);
    }
  }, wait);
  
  return saveToLocalStorage;
}

/**
 * Creates a memoized version of a function that caches its results
 * based on the input arguments.
 * 
 * @param func The function to memoize
 * @returns A memoized version of the function
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map<string, ReturnType<T>>();
  
  return function(this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func.apply(this, args);
    cache.set(key, result);
    
    return result;
  };
}

/**
 * Creates a simple timer for performance measurements.
 * 
 * @returns An object with start and stop methods for timing operations
 */
export function createTimer(label: string = 'Operation') {
  const start = performance.now();
  
  return {
    stop: () => {
      const end = performance.now();
      const duration = end - start;
      console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
      return duration;
    }
  };
}

/**
 * Utility to track component render counts for debugging performance issues.
 * Use in development only.
 * 
 * @param componentName The name of the component to track
 * @returns The current render count
 */
export function useRenderCount(componentName: string): number {
  if (process.env.NODE_ENV === 'production') {
    return 0;
  }
  
  // Use a ref to store render count
  const renderCountRef = React.useRef(0);
  renderCountRef.current += 1;
  
  // Log on each render
  React.useEffect(() => {
    console.log(`[Render] ${componentName}: ${renderCountRef.current}`);
  });
  
  return renderCountRef.current;
}

// Add React import at the top
import React from 'react'; 