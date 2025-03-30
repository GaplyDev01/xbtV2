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
    const { token_id, timeframe = '24h' } = await req.json();

    if (!token_id) {
      throw new Error('token_id is required');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch data from multiple sources in parallel
    const [
      priceData,
      volumeData,
      developerData,
      socialData
    ] = await Promise.all([
      // Price and market data
      fetch(
        `https://pro-api.coingecko.com/api/v3/coins/${token_id}/market_chart?vs_currency=usd&days=${timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : 30}`,
        {
          headers: {
            'x-cg-pro-api-key': Deno.env.get('COINGECKO_API_KEY') ?? ''
          }
        }
      ).then(res => res.json()),

      // Volume data
      fetch(
        `https://pro-api.coingecko.com/api/v3/coins/${token_id}/market_chart?vs_currency=usd&days=1`,
        {
          headers: {
            'x-cg-pro-api-key': Deno.env.get('COINGECKO_API_KEY') ?? ''
          }
        }
      ).then(res => res.json()),

      // Developer activity
      fetch(
        `https://api.github.com/search/repositories?q=${token_id}+cryptocurrency`,
        {
          headers: {
            'Authorization': `token ${Deno.env.get('GITHUB_TOKEN')}`
          }
        }
      ).then(res => res.json()),

      // Get existing social sentiment data
      supabaseClient
        .from('token_sentiment')
        .select('*')
        .eq('token_id', token_id)
        .single()
        .then(({ data }) => data)
    ]);

    // Process and analyze the data
    const analysis = {
      price_analysis: analyzePriceData(priceData),
      volume_analysis: analyzeVolumeData(volumeData),
      developer_analysis: analyzeDeveloperData(developerData),
      social_analysis: analyzeSocialData(socialData),
      technical_indicators: calculateTechnicalIndicators(priceData)
    };

    // Store analysis results
    const { error: storageError } = await supabaseClient
      .from('token_analytics')
      .upsert({
        token_id,
        timeframe,
        analysis,
        updated_at: new Date().toISOString()
      });

    if (storageError) throw storageError;

    return new Response(
      JSON.stringify(analysis),
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

// Analysis helper functions
function analyzePriceData(data: any) {
  const prices = data.prices || [];
  if (prices.length < 2) return null;

  const firstPrice = prices[0][1];
  const lastPrice = prices[prices.length - 1][1];
  const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;

  // Calculate volatility
  const returns = prices.slice(1).map((price: number[], i: number) => {
    return (price[1] - prices[i][1]) / prices[i][1];
  });
  
  const volatility = calculateVolatility(returns);

  return {
    price_change_percentage: priceChange,
    volatility,
    current_price: lastPrice,
    price_trend: priceChange > 0 ? 'upward' : 'downward',
    trend_strength: Math.abs(priceChange) > 10 ? 'strong' : 'weak'
  };
}

function analyzeVolumeData(data: any) {
  const volumes = data.total_volumes || [];
  if (volumes.length < 2) return null;

  const recentVolumes = volumes.slice(-24); // Last 24 hours
  const averageVolume = recentVolumes.reduce((sum: number, vol: number[]) => sum + vol[1], 0) / recentVolumes.length;
  
  const volumeSpikes = recentVolumes.filter((vol: number[]) => vol[1] > averageVolume * 1.5).length;

  return {
    average_volume: averageVolume,
    volume_spikes,
    volume_trend: volumeSpikes > 3 ? 'increasing' : 'stable',
    unusual_activity: volumeSpikes > 5
  };
}

function analyzeDeveloperData(data: any) {
  const repos = data.items || [];
  
  const totalStars = repos.reduce((sum: number, repo: any) => sum + repo.stargazers_count, 0);
  const totalForks = repos.reduce((sum: number, repo: any) => sum + repo.forks_count, 0);
  const activeRepos = repos.filter((repo: any) => 
    new Date(repo.updated_at).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
  ).length;

  return {
    total_repositories: repos.length,
    total_stars: totalStars,
    total_forks: totalForks,
    active_repositories: activeRepos,
    development_score: calculateDevScore(totalStars, totalForks, activeRepos)
  };
}

function analyzeSocialData(data: any) {
  if (!data) return null;

  const { twitter_sentiment, reddit_sentiment, overall_sentiment } = data;

  return {
    sentiment_score: overall_sentiment?.score || 0,
    total_mentions: overall_sentiment?.mentions || 0,
    positive_percentage: overall_sentiment?.positive_percentage || 0,
    negative_percentage: overall_sentiment?.negative_percentage || 0,
    neutral_percentage: overall_sentiment?.neutral_percentage || 0,
    sentiment_trend: determineSentimentTrend(overall_sentiment)
  };
}

function calculateTechnicalIndicators(data: any) {
  const prices = data.prices || [];
  if (prices.length < 50) return null;

  const closePrices = prices.map((price: number[]) => price[1]);

  return {
    sma_20: calculateSMA(closePrices, 20),
    sma_50: calculateSMA(closePrices, 50),
    rsi_14: calculateRSI(closePrices, 14),
    macd: calculateMACD(closePrices),
    bollinger_bands: calculateBollingerBands(closePrices, 20)
  };
}

// Technical indicator calculations
function calculateSMA(prices: number[], period: number) {
  if (prices.length < period) return null;
  return prices.slice(-period).reduce((sum, price) => sum + price, 0) / period;
}

function calculateRSI(prices: number[], period: number) {
  if (prices.length < period + 1) return null;

  const changes = prices.slice(1).map((price, i) => price - prices[i]);
  const gains = changes.map(change => change > 0 ? change : 0);
  const losses = changes.map(change => change < 0 ? -change : 0);

  const avgGain = gains.slice(-period).reduce((sum, gain) => sum + gain, 0) / period;
  const avgLoss = losses.slice(-period).reduce((sum, loss) => sum + loss, 0) / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateMACD(prices: number[]) {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  if (!ema12 || !ema26) return null;

  const macdLine = ema12 - ema26;
  const signalLine = calculateEMA([macdLine], 9);

  return {
    macd_line: macdLine,
    signal_line: signalLine,
    histogram: macdLine - (signalLine || 0)
  };
}

function calculateEMA(prices: number[], period: number) {
  if (prices.length < period) return null;

  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;

  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }

  return ema;
}

function calculateBollingerBands(prices: number[], period: number) {
  const sma = calculateSMA(prices, period);
  if (!sma) return null;

  const recentPrices = prices.slice(-period);
  const standardDeviation = Math.sqrt(
    recentPrices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period
  );

  return {
    middle_band: sma,
    upper_band: sma + (standardDeviation * 2),
    lower_band: sma - (standardDeviation * 2)
  };
}

function calculateVolatility(returns: number[]) {
  const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const squaredDiffs = returns.map(ret => Math.pow(ret - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((sum, diff) => sum + diff, 0) / returns.length);
}

function calculateDevScore(stars: number, forks: number, activeRepos: number) {
  const maxScore = 100;
  const starWeight = 0.4;
  const forkWeight = 0.3;
  const activeWeight = 0.3;

  const normalizedStars = Math.min(stars / 1000, 1);
  const normalizedForks = Math.min(forks / 500, 1);
  const normalizedActive = Math.min(activeRepos / 10, 1);

  return Math.round(
    maxScore * (
      normalizedStars * starWeight +
      normalizedForks * forkWeight +
      normalizedActive * activeWeight
    )
  );
}

function determineSentimentTrend(sentiment: any) {
  if (!sentiment) return 'neutral';

  const score = sentiment.score || 0;
  const magnitude = sentiment.magnitude || 0;

  if (score > 0.2 && magnitude > 0.5) return 'bullish';
  if (score < -0.2 && magnitude > 0.5) return 'bearish';
  return 'neutral';
}