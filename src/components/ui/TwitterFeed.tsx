import React from 'react';
import { useTwitter } from '../../context/TwitterContext';
import { Loader2, ExternalLink, AlertTriangle, Twitter } from 'lucide-react';

interface Tweet {
  tweet_id: string;
  text: string;
  created_at: string;
  bookmarks?: number;
  favorites: number;
  quotes?: number;
  replies: number;
  retweets: number;
  views?: number | string | null;
  media_url?: string[];
  video_url?: string | null;
  user: {
    name: string;
    screen_name: string;
    profile_image_url_https: string;
    verified: boolean;
  };
  // Keep compatibility with existing structure
  media?: {
    photo?: Array<{
      media_url_https: string;
      id: string;
    }>;
    video?: Array<{
      media_url_https: string;
      variants: Array<{
        content_type: string;
        url: string;
        bitrate?: number;
      }>;
    }>;
  };
  author?: {
    rest_id: string;
    name: string;
    followers: number;
    screen_name: string;
    avatar: string;
    blue_verified: boolean;
  };
}

const TwitterFeed: React.FC = () => {
  const { listTimeline, isLoading, error } = useTwitter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 size={20} className="text-theme-accent animate-spin mr-2" />
        <span className="text-sm text-theme-text-secondary">Loading tweets...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-4 text-theme-text-secondary">
        <AlertTriangle size={20} className="text-theme-accent mr-2" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  if (!listTimeline?.length) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <Twitter size={24} className="text-theme-accent mb-2" />
        <p className="text-sm text-theme-text-secondary">No tweets found</p>
      </div>
    );
  }

  const formatNumber = (num: number | string | null | undefined): string => {
    if (num === null || num === undefined) return '0';
    const numValue = typeof num === 'string' ? parseInt(num, 10) : num;
    if (isNaN(numValue)) return '0';
    
    if (numValue >= 1000000) return `${(numValue / 1000000).toFixed(1)}M`;
    if (numValue >= 1000) return `${(numValue / 1000).toFixed(1)}K`;
    return numValue.toString();
  };

  return (
    <div className="space-y-2">
      {listTimeline.map((tweet: Tweet) => {
        // Get the user info from either format
        const userInfo = tweet.author || tweet.user;
        const userName = userInfo?.name || 'Unknown';
        const userScreenName = tweet.author?.screen_name || tweet.user?.screen_name || 'unknown';
        const userAvatar = tweet.author?.avatar || tweet.user?.profile_image_url_https || '';
        const isVerified = tweet.author?.blue_verified || tweet.user?.verified || false;
        
        return (
          <div 
            key={tweet.tweet_id} 
            className="p-3 bg-theme-accent/5 rounded-lg border border-theme-border"
          >
            <div className="flex items-center mb-2">
              <img 
                src={userAvatar}
                alt={userName}
                className="w-8 h-8 rounded-full mr-2"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;
                }}
              />
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="font-medium text-sm text-theme-text-primary">
                    {userName}
                  </span>
                  {isVerified && (
                    <span className="ml-1 text-[10px] bg-theme-accent/20 text-theme-accent px-1.5 py-0.5 rounded-full">
                      Verified
                    </span>
                  )}
                </div>
                <div className="text-xs text-theme-text-secondary">
                  @{userScreenName}
                </div>
              </div>
              <a
                href={`https://twitter.com/${userScreenName}/status/${tweet.tweet_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-theme-accent hover:text-theme-accent-dark"
              >
                <ExternalLink size={14} />
              </a>
            </div>
            <p className="text-sm text-theme-text-primary whitespace-pre-wrap mb-2">
              {tweet.text}
            </p>
            
            {/* Handle media from new API structure */}
            {tweet.media_url && tweet.media_url.length > 0 && (
              <div className="mt-2 rounded-lg overflow-hidden">
                <img
                  src={tweet.media_url[0]}
                  alt="Tweet media"
                  className="w-full h-auto"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            {/* Handle media from old API structure for backward compatibility */}
            {!tweet.media_url && tweet.media?.photo && tweet.media.photo.length > 0 && (
              <div className="mt-2 rounded-lg overflow-hidden">
                <img
                  src={tweet.media.photo[0].media_url_https}
                  alt="Tweet media"
                  className="w-full h-auto"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs text-theme-text-secondary mt-2">
              <div className="flex items-center space-x-4">
                <span>{formatNumber(tweet.replies)} replies</span>
                <span>{formatNumber(tweet.retweets)} retweets</span>
                <span>{formatNumber(tweet.favorites)} likes</span>
                {tweet.views && <span>{formatNumber(tweet.views)} views</span>}
              </div>
              <span>
                {new Date(tweet.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TwitterFeed;