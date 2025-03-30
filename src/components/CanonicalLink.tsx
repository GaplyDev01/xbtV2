import React, { useEffect } from 'react';
import { getCanonicalUrl, normalizePath } from '../utils/canonicalUrl';

interface CanonicalLinkProps {
  path?: string;
}

const CanonicalLink: React.FC<CanonicalLinkProps> = ({ path }) => {
  useEffect(() => {
    // Remove any existing canonical links
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Create and insert the new canonical link
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = getCanonicalUrl(path || window.location.pathname);
    document.head.appendChild(link);

    // Cleanup on unmount
    return () => {
      const canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) {
        canonicalLink.remove();
      }
    };
  }, [path]);

  return null;
};

export default CanonicalLink;