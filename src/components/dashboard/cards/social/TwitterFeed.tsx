import React, { useState, useEffect } from 'react';
import { useTwitter } from '../../../../context/TwitterContext';
import { useToken } from '../../../../context/TokenContext';
import { Loader2, ExternalLink, AlertTriangle, Twitter, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatTimeAgo } from '../../../../utils/formatters';
import { searchTokenOnTwitter } from '../../../../services/twitterApi';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../ui/tabs';

const TwitterFeed: React.FC = () => {
  const { listTimeline, searchResults, isLoading, error, setSearchResults, setIsLoading, setError } = useTwitter();
  const { selectedToken } = useToken();
  const [currentGeneralIndex, setCurrentGeneralIndex] = useState(0);
  const [currentTokenIndex, setCurrentTokenIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('general');

  // Search for token-related tweets when token changes
  useEffect(() => {
    const searchTweets = async () => {
      if (!selectedToken) return;
      
      setIsLoading(true);
      try {
        const results = await searchTokenOnTwitter(
          selectedToken.symbol,
          selectedToken.name
        );
        setSearchResults(results);
        setActiveTab('token'); // Switch to token tab when new search results arrive
      } catch (error) {
        console.error('Error searching tweets:', error);
        setError(error instanceof Error ? error.message : 'Failed to search tweets');
      } finally {
        setIsLoading(false);
      }
    };

    searchTweets();
  }, [selectedToken, setSearchResults, setIsLoading, setError]);

  // Auto-cycle through tweets
  useEffect(() => {
    if (!listTimeline?.length && !searchResults?.result?.length) return;

    const intervalId = setInterval(() => {
      if (activeTab === 'general' && listTimeline?.length) {
        setCurrentGeneralIndex(prev => (prev + 1) % listTimeline.length);
      } else if (activeTab === 'token' && searchResults?.result?.length) {
        setCurrentTokenIndex(prev => (prev + 1) % searchResults.result.length);
      }
    }, 8000); // Change tweet every 8 seconds

    return () => clearInterval(intervalId);
  }, [listTimeline, searchResults, activeTab]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderTweetSlider = (tweets: any[], currentIndex: number, setIndex: (index: number) => void) => {
    if (!tweets.length) {
      return (
        <div className="flex flex-col items-center justify-center p-4">
          <Twitter size={24} className="text-theme-accent mb-2" />
          <p className="text-sm text-theme-text-secondary">No tweets found</p>
        </div>
      );
    }

    const tweet = tweets[currentIndex];
    const totalTweets = tweets.length;

    const handlePrevTweet = () => {
      setIndex((prev) => (prev - 1 + totalTweets) % totalTweets);
    };

    const handleNextTweet = () => {
      setIndex((prev) => (prev + 1) % totalTweets);
    };

    // Transform tweet data based on whether it's from search or timeline
    const tweetData = {
      tweet_id: tweet.tweet_id || tweet.rest_id || tweet.id_str,
      text: tweet.text || tweet.full_text || tweet.legacy?.full_text,
      created_at: tweet.creation_date || tweet.created_at || new Date().toISOString(),
      author: {
        name: tweet.user?.name || tweet.author?.name,
        screen_name: tweet.user?.username || tweet.user?.screen_name || tweet.author?.screen_name,
        avatar: tweet.user?.profile_pic_url || tweet.user?.profile_image_url_https || tweet.author?.avatar,
        blue_verified: tweet.user?.is_verified || tweet.user?.is_blue_verified || tweet.user?.verified || tweet.author?.blue_verified
      },
      replies: tweet.reply_count || tweet.replies || tweet.legacy?.reply_count || 0,
      retweets: tweet.retweet_count || tweet.retweets || tweet.legacy?.retweet_count || 0,
      favorites: tweet.favorite_count || tweet.favorites || tweet.legacy?.favorite_count || 0,
      views: tweet.views || tweet.view_count || tweet.legacy?.view_count,
      media: tweet.media || null,
      media_url: tweet.media_url || null,
      video_url: tweet.video_url || null
    };

    return (
      <div className="relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
          <button
            onClick={handlePrevTweet}
            className="p-1 bg-theme-bg/80 hover:bg-theme-bg border border-theme-border rounded-full text-theme-text-secondary hover:text-theme-text-primary transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
          <button
            onClick={handleNextTweet}
            className="p-1 bg-theme-bg/80 hover:bg-theme-bg border border-theme-border rounded-full text-theme-text-secondary hover:text-theme-text-primary transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="px-6">
          <div className="p-3 bg-theme-accent/5 rounded-lg border border-theme-border">
            <div className="flex items-center mb-2">
              <img 
                src={tweetData.author.avatar}
                alt={tweetData.author.name}
                className="w-8 h-8 rounded-full mr-2"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(tweetData.author.name)}&background=random`;
                }}
              />
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="font-medium text-sm text-theme-text-primary">
                    {tweetData.author.name}
                  </span>
                  {tweetData.author.blue_verified && (
                    <span className="ml-1 text-[10px] bg-theme-accent/20 text-theme-accent px-1.5 py-0.5 rounded-full">
                      Verified
                    </span>
                  )}
                </div>
                <div className="text-xs text-theme-text-secondary">
                  @{tweetData.author.screen_name}
                </div>
              </div>
              <a
                href={`https://twitter.com/${tweetData.author.screen_name}/status/${tweetData.tweet_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-theme-accent hover:text-theme-accent-dark"
              >
                <ExternalLink size={14} />
              </a>
            </div>
            
            <p className="text-sm text-theme-text-primary whitespace-pre-wrap mb-2">
              {tweetData.text}
            </p>

            {/* Handle media from new API structure */}
            {tweetData.media_url && Array.isArray(tweetData.media_url) && tweetData.media_url.length > 0 && (
              <div className="mt-2 rounded-lg overflow-hidden">
                <img
                  src={tweetData.media_url[0]}
                  alt="Tweet media"
                  className="w-full h-auto"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Handle media from old API structure */}
            {!tweetData.media_url && tweetData.media?.photo && tweetData.media.photo.length > 0 && (
              <div className="mt-2 rounded-lg overflow-hidden">
                <img
                  src={tweetData.media.photo[0].media_url_https}
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
                <span>{formatNumber(tweetData.replies)} replies</span>
                <span>{formatNumber(tweetData.retweets)} retweets</span>
                <span>{formatNumber(tweetData.favorites)} likes</span>
                {tweetData.views && <span>{formatNumber(tweetData.views)} views</span>}
              </div>
              <span>
                {formatTimeAgo(new Date(tweetData.created_at).getTime())}
              </span>
            </div>
          </div>

          <div className="flex justify-center mt-2">
            {Array.from({ length: totalTweets }).map((_, index) => (
              <button
                key={index}
                onClick={() => setIndex(index)}
                className={`w-1.5 h-1.5 rounded-full mx-0.5 transition-colors ${
                  index === currentIndex 
                    ? 'bg-theme-accent' 
                    : 'bg-theme-accent/20 hover:bg-theme-accent/40'
                }`}
                aria-label={`Go to tweet ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
      <TabsList className="mb-4">
        <TabsTrigger value="general" className="text-xs">
          Crypto News
        </TabsTrigger>
        {selectedToken && (
          <TabsTrigger value="token" className="text-xs">
            {selectedToken.symbol.toUpperCase()} Tweets
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="general" className="h-full">
        {renderTweetSlider(listTimeline || [], currentGeneralIndex, setCurrentGeneralIndex)}
      </TabsContent>

      {selectedToken && (
        <TabsContent value="token" className="h-full">
          {renderTweetSlider(
            searchResults?.result || [], 
            currentTokenIndex, 
            setCurrentTokenIndex
          )}
        </TabsContent>
      )}
    </Tabs>
  );
};

export default TwitterFeed;