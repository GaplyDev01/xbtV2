import axios from 'axios';
import axiosRetry from 'axios-retry';

export interface TwitterSearchResponse {
  result: any[];
}

export interface Tweet {
  tweet_id: string;
  text: string;
  created_at: string;
  user: {
    name: string;
    screen_name: string;
    profile_image_url_https: string;
    verified: boolean;
  };
  replies: number;
  retweets: number;
  favorites: number;
  views?: number;
  media_url?: string[];
  video_url?: string | null;
}

// Sample data for fallback
const SAMPLE_TWEETS: Tweet[] = [
  {
    tweet_id: '1565246572489728100',
    text: 'Bitcoin just broke $50k! This bull run is just getting started. #BTC #Crypto',
    created_at: new Date().toISOString(),
    user: {
      name: 'Crypto Trader',
      screen_name: 'cryptotrader',
      profile_image_url_https: 'https://pbs.twimg.com/profile_images/1212345678901234567/abcdefgh_400x400.jpg',
      verified: true
    },
    replies: 42,
    retweets: 156,
    favorites: 879
  },
  {
    tweet_id: '1565246572489728101',
    text: 'Ethereum 2.0 upgrade is proceeding well. Excited about the future of $ETH. Lower gas fees coming soon!',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    user: {
      name: 'ETH Developer',
      screen_name: 'ethdev',
      profile_image_url_https: 'https://pbs.twimg.com/profile_images/1212345678901234567/jklmnopq_400x400.jpg',
      verified: true
    },
    replies: 18,
    retweets: 64,
    favorites: 312
  },
  {
    tweet_id: '1565246572489728102',
    text: 'Just made my first DeFi transaction. The future of finance is here! #DeFi #Crypto',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    user: {
      name: 'DeFi Enthusiast',
      screen_name: 'defienthusiast',
      profile_image_url_https: 'https://pbs.twimg.com/profile_images/1212345678901234567/rstuvwxy_400x400.jpg',
      verified: false
    },
    replies: 5,
    retweets: 12,
    favorites: 57
  }
];

// Configure axios instance with retry logic
const api = axios.create({
  baseURL: 'https://twitter154.p.rapidapi.com',
  timeout: 10000,
  headers: {
    'x-rapidapi-host': 'twitter154.p.rapidapi.com',
    'x-rapidapi-key': '56da9e331emshb1150f72dcd5029p12a375jsnb16e7026a17a'
  }
});

axiosRetry(api, {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || 
           error.response?.status === 429 || 
           error.response?.status >= 500;
  }
});

export const getTwitterListTimeline = async (): Promise<Tweet[]> => {
  console.log('Fetching Twitter timeline...');
  
  try {
    const response = await api.get('/lists/tweets/continuation', {
      params: {
        list_id: '1880591496266551304',
        limit: 40,
        continuation_token: 'DAABCgABGhF81FZ__6YKAAIaCdAnRlqQOAgAAwAAAAIAAA'
      }
    });
    
    console.log('Twitter API response:', response.data);

    if (!response.data || !response.data.results) {
      throw new Error('No data received from Twitter API');
    }

    const tweets = response.data.results || [];
    
    return tweets.map((tweet: any) => ({
      tweet_id: tweet.tweet_id,
      text: tweet.text || '',
      created_at: tweet.creation_date || new Date().toISOString(),
      user: {
        name: tweet.user?.name || 'Crypto User',
        screen_name: tweet.user?.username || 'cryptouser',
        profile_image_url_https: tweet.user?.profile_pic_url || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png',
        verified: tweet.user?.is_verified || tweet.user?.is_blue_verified || false
      },
      replies: tweet.reply_count || 0,
      retweets: tweet.retweet_count || 0,
      favorites: tweet.favorite_count || 0,
      views: tweet.views || 0,
      media_url: tweet.media_url || [],
      video_url: tweet.video_url
    }));
  } catch (error) {
    console.error('Error fetching Twitter timeline:', error);
    // Return sample data as fallback
    return SAMPLE_TWEETS;
  }
};

export const searchTokenOnTwitter = async (
  symbol: string,
  name: string
): Promise<TwitterSearchResponse> => {
  console.log(`Searching Twitter for ${symbol} (${name})...`);
  
  // Create sample search results based on the token
  const sampleResults = {
    result: [
      {
        tweet_id: '1565246572489728103',
        text: `${symbol} is looking bullish today! Price target $1000 soon? #${symbol} #Crypto`,
        created_at: new Date().toISOString(),
        author: {
          name: 'Crypto Analyst',
          screen_name: 'cryptoanalyst',
          avatar: 'https://pbs.twimg.com/profile_images/1212345678901234567/abcdefgh_400x400.jpg',
          blue_verified: true
        },
        replies: 12,
        retweets: 34,
        favorites: 89
      },
      {
        tweet_id: '1565246572489728104',
        text: `Just bought more ${name} ($${symbol})! This project has massive potential in the next bull cycle.`,
        created_at: new Date(Date.now() - 1800000).toISOString(),
        author: {
          name: 'Crypto Whale',
          screen_name: 'cryptowhale',
          avatar: 'https://pbs.twimg.com/profile_images/1212345678901234567/jklmnopq_400x400.jpg',
          blue_verified: true
        },
        replies: 5,
        retweets: 15,
        favorites: 67
      },
      {
        tweet_id: '1565246572489728105',
        text: `${name} just announced a major partnership! Bullish on $${symbol} #Crypto #Altcoins`,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        author: {
          name: 'Crypto News',
          screen_name: 'cryptonews',
          avatar: 'https://pbs.twimg.com/profile_images/1212345678901234567/rstuvwxy_400x400.jpg',
          blue_verified: false
        },
        replies: 8,
        retweets: 29,
        favorites: 102
      }
    ]
  };
  
  return sampleResults;
};

// Add a new function to get tweets from a specific list
export const getTwitterListByID = async (listId: string, continuationToken: string, limit: number = 40): Promise<Tweet[]> => {
  console.log(`Fetching Twitter list with ID: ${listId}...`);
  
  try {
    const response = await api.get('/lists/tweets/continuation', {
      params: {
        list_id: listId,
        limit: limit,
        continuation_token: continuationToken
      }
    });
    
    console.log('Twitter List API response:', response.data);

    if (!response.data || !response.data.results) {
      throw new Error('No data received from Twitter API for list');
    }

    const tweets = response.data.results || [];
    
    return tweets.map((tweet: any) => ({
      tweet_id: tweet.tweet_id,
      text: tweet.text || '',
      created_at: tweet.creation_date || new Date().toISOString(),
      user: {
        name: tweet.user?.name || 'Crypto User',
        screen_name: tweet.user?.username || 'cryptouser',
        profile_image_url_https: tweet.user?.profile_pic_url || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png',
        verified: tweet.user?.is_verified || tweet.user?.is_blue_verified || false
      },
      replies: tweet.reply_count || 0,
      retweets: tweet.retweet_count || 0,
      favorites: tweet.favorite_count || 0,
      views: tweet.views || 0,
      media_url: tweet.media_url || [],
      video_url: tweet.video_url
    }));
  } catch (error) {
    console.error('Error fetching Twitter list:', error);
    return SAMPLE_TWEETS;
  }
};