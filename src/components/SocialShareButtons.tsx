import React, { useEffect, useState } from 'react';
import { Share2 } from 'lucide-react';

interface SocialShareButtonsProps {
  url?: string;
  title?: string;
  description?: string;
  hashtags?: string[];
  image?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({
  url,
  title = 'TradesXBT - AI-Powered Crypto Analysis Platform',
  description = 'Advanced cryptocurrency analysis platform with AI-powered insights, real-time market data, and social sentiment tracking.',
  hashtags = ['crypto', 'trading', 'analysis'],
  image,
  size = 'md',
  showLabel = true,
  className = '',
}) => {
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    // Get the current URL if not provided
    setCurrentUrl(url || window.location.href);
    
    // The image prop can be used to set meta tags or in the future
    // for social sharing platforms that support image sharing
  }, [url, image]);

  // Size utility for button sizing
  const sizeClasses = {
    sm: 'p-1.5 text-sm',
    md: 'p-2 text-base',
    lg: 'p-3 text-lg',
  };
  
  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  // Share functions
  const shareOnFacebook = () => {
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(fbShareUrl, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = () => {
    const twitterText = `${title}\n\n${description}`;
    const hashtagsString = hashtags.join(',');
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(currentUrl)}&hashtags=${encodeURIComponent(hashtagsString)}`;
    window.open(twitterShareUrl, '_blank', 'width=600,height=400');
  };

  const shareOnLinkedIn = () => {
    const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
    window.open(linkedInShareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Facebook Share Button */}
      <button
        onClick={shareOnFacebook}
        className={`flex items-center gap-2 rounded-lg ${sizeClasses[size]} bg-theme-bg border border-theme-border text-theme-accent hover:bg-theme-accent/10 transition-all`}
        aria-label="Share on Facebook"
      >
        <FacebookIcon size={iconSizes[size]} />
        {showLabel && <span>Facebook</span>}
      </button>

      {/* Twitter/X Share Button */}
      <button
        onClick={shareOnTwitter}
        className={`flex items-center gap-2 rounded-lg ${sizeClasses[size]} bg-theme-bg border border-theme-border text-theme-accent hover:bg-theme-accent/10 transition-all`}
        aria-label="Share on X"
      >
        <XTwitterIcon size={iconSizes[size]} />
        {showLabel && <span>X</span>}
      </button>

      {/* LinkedIn Share Button */}
      <button
        onClick={shareOnLinkedIn}
        className={`flex items-center gap-2 rounded-lg ${sizeClasses[size]} bg-theme-bg border border-theme-border text-theme-accent hover:bg-theme-accent/10 transition-all`}
        aria-label="Share on LinkedIn"
      >
        <LinkedInIcon size={iconSizes[size]} />
        {showLabel && <span>LinkedIn</span>}
      </button>

      {/* Share button with dropdown option - can be implemented if needed */}
      <button
        className={`flex items-center gap-2 rounded-lg ${sizeClasses[size]} bg-theme-accent/90 text-theme-bg hover:bg-theme-accent transition-all`}
        aria-label="More sharing options"
        onClick={() => {
          if (navigator.share) {
            navigator.share({
              title: title,
              text: description,
              url: currentUrl,
            }).catch(console.error);
          }
        }}
      >
        <Share2 size={iconSizes[size]} />
        {showLabel && <span>Share</span>}
      </button>
    </div>
  );
};

// Facebook Icon SVG
const FacebookIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-current">
    <path d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 17.9895 4.38823 22.954 10.125 23.8542V15.4688H7.07812V12H10.125V9.35625C10.125 6.34875 11.9166 4.6875 14.6576 4.6875C15.9701 4.6875 17.3438 4.92188 17.3438 4.92188V7.875H15.8306C14.34 7.875 13.875 8.80008 13.875 9.75V12H17.2031L16.6711 15.4688H13.875V23.8542C19.6118 22.954 24 17.9895 24 12Z" fill="currentColor"/>
  </svg>
);

// X (Twitter) Icon SVG
const XTwitterIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-current">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" fill="currentColor"/>
  </svg>
);

// LinkedIn Icon SVG
const LinkedInIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-current">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="currentColor"/>
  </svg>
);

export default SocialShareButtons;
