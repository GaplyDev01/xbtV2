/**
 * Social Sharing Utilities
 * This file contains utilities for generating consistent metadata for social sharing
 */

// Default app metadata
export const defaultShareMetadata = {
  title: 'TradesXBT - AI-Powered Crypto Analysis Platform',
  description: 'Advanced cryptocurrency analysis platform with AI-powered insights, real-time market data, and social sentiment tracking.',
  image: 'https://tradesxbt.com/og-image.jpg',
  url: 'https://tradesxbt.com',
  siteName: 'TradesXBT',
  twitterHandle: '@tradesxbt',
  defaultHashtags: ['crypto', 'trading', 'blockchain', 'analysis']
};

// Helper to generate token-specific share metadata
export const generateTokenShareMetadata = (
  tokenName: string,
  tokenSymbol: string,
  currentPrice: string,
  marketCap: string,
  priceChange24h?: string
) => {
  const title = `${tokenName} (${tokenSymbol.toUpperCase()}) - Current Price: ${currentPrice}`;
  
  let description = `Check out ${tokenName} with market cap of ${marketCap}.`;
  if (priceChange24h) {
    description += ` 24h change: ${priceChange24h}`;
  }
  
  return {
    title,
    description,
    hashtags: ['crypto', 'trading', tokenSymbol.toLowerCase()],
  };
};

// Helper to dynamically update document metadata
export const updateDocumentSocialMetadata = (
  title: string,
  description: string,
  imageUrl: string = defaultShareMetadata.image,
  url: string = window.location.href
) => {
  // Update document title
  document.title = title;
  
  // Update meta tags
  const updateMetaTag = (selector: string, attribute: string, content: string) => {
    let tag = document.querySelector(selector);
    if (!tag) {
      tag = document.createElement('meta');
      if (selector.includes('property=')) {
        tag.setAttribute('property', selector.split('"')[1]);
      } else if (selector.includes('name=')) {
        tag.setAttribute('name', selector.split('"')[1]);
      }
      document.head.appendChild(tag);
    }
    tag.setAttribute(attribute, content);
  };
  
  // OpenGraph tags
  updateMetaTag('meta[property="og:title"]', 'content', title);
  updateMetaTag('meta[property="og:description"]', 'content', description);
  updateMetaTag('meta[property="og:image"]', 'content', imageUrl);
  updateMetaTag('meta[property="og:url"]', 'content', url);
  updateMetaTag('meta[property="og:site_name"]', 'content', defaultShareMetadata.siteName);
  
  // Twitter Card tags
  updateMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image');
  updateMetaTag('meta[name="twitter:title"]', 'content', title);
  updateMetaTag('meta[name="twitter:description"]', 'content', description);
  updateMetaTag('meta[name="twitter:image"]', 'content', imageUrl);
  updateMetaTag('meta[name="twitter:site"]', 'content', defaultShareMetadata.twitterHandle);
};
