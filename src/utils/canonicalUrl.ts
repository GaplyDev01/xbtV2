/**
 * Utility functions for managing canonical URLs
 */

// Get the base URL for the application
export const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://tradesxbt.com'; // Replace with your production domain
};

// Generate canonical URL for a specific path
export const getCanonicalUrl = (path: string = ''): string => {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

// Clean and normalize URL paths
export const normalizePath = (path: string): string => {
  // Remove trailing slashes
  let normalizedPath = path.replace(/\/+$/, '');
  
  // Remove query parameters
  normalizedPath = normalizedPath.split('?')[0];
  
  // Remove hash fragments
  normalizedPath = normalizedPath.split('#')[0];
  
  // Ensure path starts with /
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = `/${normalizedPath}`;
  }
  
  return normalizedPath.toLowerCase();
};