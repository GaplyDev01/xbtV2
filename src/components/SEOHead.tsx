import React from 'react';
import { getFullCanonicalUrl, isCanonicalUrl } from '../utils/canonicalUtils';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
  forceCanonical?: boolean; // Force this URL to be canonical even if it wouldn't normally be
  alternateUrls?: string[]; // Additional URLs that should point to this canonical URL
  domain?: string; // Optional domain override
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'TradesXBT - AI-Powered Crypto Analysis Platform',
  description = 'Advanced cryptocurrency analysis platform with AI-powered insights, real-time market data, and social sentiment tracking.',
  image = 'https://tradesxbt.com/og-image.jpg',
  type = 'website',
  forceCanonical = false,
  alternateUrls = [],
  domain = 'https://tradesxbt.com'
}) => {
  // Get current path without react-router
  const currentPath = window.location.pathname + window.location.search;
  const isCanonical = forceCanonical || isCanonicalUrl(currentPath);
  const canonicalUrl = getFullCanonicalUrl(currentPath, domain);

  React.useEffect(() => {
    // Update meta tags
    document.title = title;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Update OpenGraph tags
    const updateMetaTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('og:url', canonicalUrl);
    updateMetaTag('og:type', type);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);
    
    // If this page isn't the canonical version, add appropriate meta tags
    if (!isCanonical) {
      // Add a rel=canonical that points to the canonical version
      updateMetaTag('robots', 'noindex, follow');
    } else {
      // Ensure robots can index this page
      let robotsTag = document.querySelector('meta[name="robots"]');
      if (robotsTag) {
        document.head.removeChild(robotsTag);
      }
    }
    
    // Add alternate link tags for alternate URLs if provided and this is the canonical version
    if (isCanonical && alternateUrls.length > 0) {
      // Remove any existing alternate links first
      document.querySelectorAll('link[rel="alternate"]').forEach(el => {
        document.head.removeChild(el);
      });
      
      // Add new alternate links
      alternateUrls.forEach(altUrl => {
        const altLink = document.createElement('link');
        altLink.setAttribute('rel', 'alternate');
        altLink.setAttribute('href', `${domain}${altUrl.startsWith('/') ? '' : '/'}${altUrl}`);
        document.head.appendChild(altLink);
      });
    }

    return () => {
      // Cleanup is handled by the next page's SEOHead component
    };
  }, [title, description, image, canonicalUrl, isCanonical, alternateUrls, domain, type, forceCanonical]);

  return null;
};

export default SEOHead;