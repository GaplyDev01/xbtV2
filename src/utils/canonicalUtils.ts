/**
 * Utility functions for managing canonical URLs and duplicate content detection
 */

// A mapping of path patterns that should be considered duplicates
type PathMapping = {
  pattern: RegExp; // Pattern to match duplicate paths
  canonical: (matches: string[]) => string; // Function to generate canonical URL from matches
  priority?: number; // Optional priority (higher number = higher priority)
};

// Configure path patterns that should map to the same canonical URL
const pathMappings: PathMapping[] = [
  // Product pages with different URL formats but same content
  {
    pattern: /^\/token\/([\w-]+)(?:\/details|\/overview|\/analytics)?$/,
    canonical: (matches) => `/token/${matches[1]}`,
    priority: 10
  },
  // Filter and sort variations for the same list view
  {
    pattern: /^\/tokens(?:\/list)?(?:\/(\?.*)?$)/,
    canonical: (matches) => `/tokens${matches[1] ? matches[1] : ''}`, 
    priority: 5
  },
  // User profile pages with various tabs
  {
    pattern: /^\/profile\/([\w-]+)(?:\/(?:assets|history|settings))?$/,
    canonical: (matches) => `/profile/${matches[1]}`,
    priority: 8
  },
  // Pagination handling - first page is canonical
  {
    pattern: /^(\/[\w-]+)(?:\/?\?(?:.*&)page=1(?:&.*)?)?$/,
    canonical: (matches) => matches[1],
    priority: 3
  },
  // Search results with various parameters
  {
    pattern: /^\/search\/(\?.*)?$/,
    canonical: (matches) => `/search${matches[1] ? matches[1] : ''}`,
    priority: 4
  }
];

/**
 * Normalize a URL by removing trailing slashes, default ports, etc.
 * @param url The URL to normalize
 * @returns Normalized URL
 */
export const normalizeUrl = (url: string): string => {
  try {
    // Create a URL object to handle parsing
    const parsedUrl = new URL(url, window.location.origin);
    
    // Normalize the pathname (remove trailing slash except for root)
    let pathname = parsedUrl.pathname;
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }
    
    // Normalize search parameters (sort them alphabetically)
    const searchParams = new URLSearchParams(parsedUrl.search);
    const sortedParams = Array.from(searchParams.entries())
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
    const normalizedSearch = new URLSearchParams(sortedParams).toString();
    
    // Reconstruct normalized URL
    return `${pathname}${normalizedSearch ? `?${normalizedSearch}` : ''}`;
  } catch (error) {
    console.error('Error normalizing URL:', error);
    return url;
  }
};

/**
 * Determine if the current URL is a duplicate and get its canonical URL
 * @param currentPath The current path to check
 * @returns The canonical URL or null if not a duplicate
 */
export const getCanonicalPath = (currentPath: string): string => {
  // First normalize the path
  const normalizedPath = normalizeUrl(currentPath);
  
  // Find all matching patterns
  const matches = pathMappings
    .map(mapping => {
      const match = normalizedPath.match(mapping.pattern);
      if (match) {
        return {
          canonical: mapping.canonical(match.slice(1)),
          priority: mapping.priority || 0
        };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => (b?.priority || 0) - (a?.priority || 0));
  
  // Return the highest priority canonical URL or the original if no matches
  return matches.length > 0 ? matches[0]?.canonical || normalizedPath : normalizedPath;
};

/**
 * Check if a URL should be the canonical version for its content
 * @param url The URL to check
 * @returns Boolean indicating if this URL should be canonical
 */
export const isCanonicalUrl = (url: string): boolean => {
  const canonicalPath = getCanonicalPath(url);
  return normalizeUrl(url) === canonicalPath;
};

/**
 * Get the full canonical URL including domain
 * @param path The path to convert to a canonical URL
 * @param domain Optional domain to use (defaults to current domain)
 * @returns Full canonical URL
 */
export const getFullCanonicalUrl = (path: string, domain?: string): string => {
  const canonicalPath = getCanonicalPath(path);
  const baseDomain = domain || window.location.origin;
  return `${baseDomain}${canonicalPath.startsWith('/') ? '' : '/'}${canonicalPath}`;
};
