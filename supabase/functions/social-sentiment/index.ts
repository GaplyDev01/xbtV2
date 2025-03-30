// Follow the edge_runtime_node18 pattern
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { token_id } = await req.json();

    if (!token_id) {
      throw new Error('token_id is required');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch social data from multiple sources
    const [twitterData, redditData] = await Promise.all([
      // Twitter sentiment analysis
      fetch(`https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(`$${token_id} OR #${token_id}`)}`, {
        headers: {
          'Authorization': `Bearer ${Deno.env.get('TWITTER_BEARER_TOKEN')}`
        }
      }).then(res => res.json()),

      // Reddit sentiment analysis
      fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(token_id)}&sort=new&limit=100`)
        .then(res => res.json())
    ]);

    // Process Twitter data
    const twitterSentiment = await analyzeSentiment(twitterData.data || []);
    
    // Process Reddit data
    const redditSentiment = await analyzeSentiment(redditData.data?.children || []);

    // Calculate overall sentiment
    const overallSentiment = {
      score: (twitterSentiment.score + redditSentiment.score) / 2,
      magnitude: (twitterSentiment.magnitude + redditSentiment.magnitude) / 2,
      mentions: twitterSentiment.mentions + redditSentiment.mentions,
      positive_percentage: (twitterSentiment.positive_percentage + redditSentiment.positive_percentage) / 2,
      negative_percentage: (twitterSentiment.negative_percentage + redditSentiment.negative_percentage) / 2,
      neutral_percentage: (twitterSentiment.neutral_percentage + redditSentiment.neutral_percentage) / 2
    };

    // Store sentiment data
    const { error: storageError } = await supabaseClient
      .from('token_sentiment')
      .upsert({
        token_id,
        twitter_sentiment: twitterSentiment,
        reddit_sentiment: redditSentiment,
        overall_sentiment: overallSentiment,
        updated_at: new Date().toISOString()
      });

    if (storageError) throw storageError;

    return new Response(
      JSON.stringify({
        token_id,
        twitter: twitterSentiment,
        reddit: redditSentiment,
        overall: overallSentiment
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});

// Simple sentiment analysis function
async function analyzeSentiment(posts: any[]) {
  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;
  let totalScore = 0;
  let totalMagnitude = 0;

  // Load sentiment words
  const positiveWords = new Set(['bullish', 'moon', 'pump', 'buy', 'long', 'good', 'great', 'excellent']);
  const negativeWords = new Set(['bearish', 'dump', 'sell', 'short', 'bad', 'poor', 'terrible']);

  for (const post of posts) {
    const text = post.text || post.title || post.body || '';
    const words = text.toLowerCase().split(/\s+/);
    
    let postScore = 0;
    let wordCount = 0;
    
    for (const word of words) {
      if (positiveWords.has(word)) postScore++;
      if (negativeWords.has(word)) postScore--;
      wordCount++;
    }

    const magnitude = Math.abs(postScore);
    totalMagnitude += magnitude;
    totalScore += postScore;

    if (postScore > 0) positiveCount++;
    else if (postScore < 0) negativeCount++;
    else neutralCount++;
  }

  const total = posts.length || 1;
  
  return {
    score: totalScore / total,
    magnitude: totalMagnitude / total,
    mentions: total,
    positive_percentage: (positiveCount / total) * 100,
    negative_percentage: (negativeCount / total) * 100,
    neutral_percentage: (neutralCount / total) * 100
  };
}