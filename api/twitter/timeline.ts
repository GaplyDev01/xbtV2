import { corsHeaders } from '../coingecko/_utils';

export const config = {
  runtime: 'edge'
};

// Sample tweets as fallback data
const SAMPLE_TWEETS = [
  {
    tweet_id: '1565246572489728001',
    text: 'Bitcoin just broke $70K! This rally is just getting started. #BTC #Bitcoin',
    created_at: new Date().toISOString(),
    user: {
      name: 'Crypto Bull',
      screen_name: 'cryptobull',
      profile_image_url_https: 'https://pbs.twimg.com/profile_images/1234567890123456789/abcdefgh_400x400.jpg',
      verified: true
    },
    replies: 24,
    retweets: 78,
    favorites: 135,
    views: 12500,
    media_url: [],
    video_url: null
  },
  {
    tweet_id: '1565246572489728002',
    text: 'Ethereum merge successful - this is a game changer for scalability. $ETH to $5K soon?',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    user: {
      name: 'ETH Maxi',
      screen_name: 'ethmaxi',
      profile_image_url_https: 'https://pbs.twimg.com/profile_images/1234567890123456789/defghijk_400x400.jpg',
      verified: true
    },
    replies: 15,
    retweets: 42,
    favorites: 98,
    views: 8700,
    media_url: [],
    video_url: null
  },
  {
    tweet_id: '1565246572489728003',
    text: 'BREAKING: SEC approves spot Bitcoin ETFs. This is huge for institutional adoption! #Crypto $BTC',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    user: {
      name: 'Crypto News',
      screen_name: 'cryptonews',
      profile_image_url_https: 'https://pbs.twimg.com/profile_images/1234567890123456789/ghijklmn_400x400.jpg',
      verified: false
    },
    replies: 32,
    retweets: 89,
    favorites: 204,
    views: 24000,
    media_url: [],
    video_url: null
  }
];

export default async function handler(req: Request) {
  // Set up CORS headers
  const headers = {
    ...corsHeaders(),
    'Content-Type': 'application/json',
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
  };

  try {
    // In a real implementation, you would fetch data from Twitter API here
    // For now, just return sample data
    return new Response(JSON.stringify(SAMPLE_TWEETS), {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Error in Twitter timeline handler:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch Twitter timeline',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers
      }
    );
  }
} 