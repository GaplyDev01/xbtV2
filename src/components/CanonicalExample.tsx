import React from 'react';
import SEOHead from './SEOHead';

/**
 * Example component demonstrating canonical URL usage in different scenarios
 */
const CanonicalExample: React.FC = () => {
  // Determine the current page type based on the URL
  const pathname = window.location.pathname;
  const search = window.location.search;
  
  // Example of different page types and their canonical settings
  if (pathname.startsWith('/token/')) {
    // Token detail pages - ensure proper canonical URL
    const tokenSymbol = pathname.split('/')[2];
    
    // Define alternate URLs that should point to this canonical version
    const alternateUrls = [
      `/token/${tokenSymbol}/details`,
      `/token/${tokenSymbol}/overview`,
      `/token/${tokenSymbol}/analytics`
    ];
    
    return (
      <>
        <SEOHead 
          title={`${tokenSymbol.toUpperCase()} Token - TradesXBT`}
          description={`View detailed information, price charts, and analytics for ${tokenSymbol.toUpperCase()} token.`}
          // If we're on the main token page, force it to be canonical
          forceCanonical={pathname === `/token/${tokenSymbol}`}
          alternateUrls={alternateUrls}
        />
        {/* Your page content */}
      </>
    );
  }
  
  // For search results pages
  if (pathname === '/search') {
    return (
      <>
        <SEOHead 
          title="Search Results - TradesXBT"
          description="Search results for cryptocurrency tokens and projects."
          // Search pages should be indexed but have proper canonical links
        />
        {/* Your search results content */}
      </>
    );
  }
  
  // For paginated list views
  if (pathname === '/tokens' || pathname === '/tokens/list') {
    // Extract page number from search parameters if present
    const urlParams = new URLSearchParams(search);
    const page = urlParams.get('page');
    
    // If this is page 1 or no page specified, it should be canonical
    const isFirstPage = !page || page === '1';
    
    return (
      <>
        <SEOHead 
          title="Cryptocurrency Tokens - TradesXBT"
          description="Browse and explore the complete list of cryptocurrency tokens with price information and market data."
          forceCanonical={isFirstPage}
        />
        {/* Your tokens list content */}
      </>
    );
  }
  
  // Default case for other pages
  return (
    <>
      <SEOHead />
      {/* Your page content */}
    </>
  );
};

export default CanonicalExample;
