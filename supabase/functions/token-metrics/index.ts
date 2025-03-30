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

    // Fetch data from multiple sources
    const [
      marketData,
      onChainData,
      socialData,
      tradingSignals,
      developerData
    ] = await Promise.all([
      // Market data
      fetch(
        `https://pro-api.coingecko.com/api/v3/coins/${token_id}?localization=false&tickers=true&market_data=true&community_data=true&developer_data=true`,
        {
          headers: {
            'x-cg-pro-api-key': Deno.env.get('COINGECKO_API_KEY') ?? ''
          }
        }
      ).then(res => res.json()),

      // On-chain data
      supabaseClient
        .from('onchain_analytics')
        .select('*')
        .eq('token_id', token_id)
        .single()
        .then(({ data }) => data),

      // Social sentiment data
      supabaseClient
        .from('token_sentiment')
        .select('*')
        .eq('token_id', token_id)
        .single()
        .then(({ data }) => data),

      // Trading signals
      supabaseClient
        .from('trading_signals')
        .select('*')
        .eq('token_id', token_id)
        .single()
        .then(({ data }) => data),

      // Developer activity
      fetch(
        `https://api.github.com/search/repositories?q=${token_id}+cryptocurrency`,
        {
          headers: {
            'Authorization': `token ${Deno.env.get('GITHUB_TOKEN')}`
          }
        }
      ).then(res => res.json())
    ]);

    // Calculate composite metrics
    const metrics = calculateCompositeMetrics(
      marketData,
      onChainData,
      socialData,
      tradingSignals,
      developerData
    );

    // Store metrics
    const { error: storageError } = await supabaseClient
      .from('token_metrics')
      .upsert({
        token_id,
        metrics,
        updated_at: new Date().toISOString()
      });

    if (storageError) throw storageError;

    return new Response(
      JSON.stringify(metrics),
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

function calculateCompositeMetrics(
  marketData: any,
  onChainData: any,
  socialData: any,
  tradingSignals: any,
  developerData: any
) {
  return {
    market_metrics: calculateMarketMetrics(marketData),
    technical_metrics: calculateTechnicalMetrics(marketData, tradingSignals),
    fundamental_metrics: calculateFundamentalMetrics(marketData, onChainData),
    social_metrics: calculateSocialMetrics(socialData),
    developer_metrics: calculateDeveloperMetrics(developerData),
    risk_metrics: calculateRiskMetrics(marketData, onChainData, socialData),
    composite_score: calculateCompositeScore(
      marketData,
      onChainData,
      socialData,
      tradingSignals,
      developerData
    )
  };
}

function calculateMarketMetrics(marketData: any) {
  const data = marketData.market_data || {};
  
  return {
    price_usd: data.current_price?.usd,
    market_cap_usd: data.market_cap?.usd,
    volume_24h_usd: data.total_volume?.usd,
    price_change_24h: data.price_change_percentage_24h,
    market_cap_rank: data.market_cap_rank,
    volume_to_market_cap: data.total_volume?.usd / data.market_cap?.usd,
    circulating_supply: data.circulating_supply,
    max_supply: data.max_supply,
    supply_ratio: data.circulating_supply / (data.max_supply || data.total_supply || data.circulating_supply)
  };
}

function calculateTechnicalMetrics(marketData: any, tradingSignals: any) {
  const signals = tradingSignals?.signals || {};
  const technicalScore = signals.technical_score || 0;

  return {
    trend: determineTrend(marketData),
    momentum: calculateMomentum(marketData),
    volatility: calculateVolatility(marketData),
    relative_strength: calculateRelativeStrength(marketData),
    technical_score: technicalScore,
    signal_strength: signals.confidence || 0,
    trading_recommendation: signals.overall_signal || 'neutral'
  };
}

function calculateFundamentalMetrics(marketData: any, onChainData: any) {
  const metrics = onChainData?.metrics || {};
  
  return {
    network_value: calculateNetworkValue(marketData, metrics),
    active_addresses: metrics.active_addresses_24h,
    transaction_volume: metrics.transaction_count_24h,
    average_transaction_value: metrics.average_transaction_value,
    network_utilization: calculateNetworkUtilization(metrics),
    value_locked: calculateValueLocked(marketData, metrics),
    token_velocity: calculateTokenVelocity(marketData, metrics)
  };
}

function calculateSocialMetrics(socialData: any) {
  const sentiment = socialData?.overall_sentiment || {};
  
  return {
    sentiment_score: sentiment.score || 0,
    sentiment_magnitude: sentiment.magnitude || 0,
    social_volume: sentiment.mentions || 0,
    positive_mentions_ratio: sentiment.positive_percentage || 0,
    negative_mentions_ratio: sentiment.negative_percentage || 0,
    social_dominance: calculateSocialDominance(sentiment),
    trend_strength: calculateTrendStrength(sentiment)
  };
}

function calculateDeveloperMetrics(developerData: any) {
  const repos = developerData.items || [];
  
  return {
    active_repositories: repos.length,
    total_stars: repos.reduce((sum: number, repo: any) => sum + repo.stargazers_count, 0),
    total_forks: repos.reduce((sum: number, repo: any) => sum + repo.forks_count, 0),
    recent_commits: calculateRecentCommits(repos),
    contributor_count: calculateContributors(repos),
    development_activity: calculateDevelopmentActivity(repos)
  };
}

function calculateRiskMetrics(marketData: any, onChainData: any, socialData: any) {
  return {
    volatility_risk: calculateVolatilityRisk(marketData),
    liquidity_risk: calculateLiquidityRisk(marketData),
    concentration_risk: calculateConcentrationRisk(onChainData),
    sentiment_risk: calculateSentimentRisk(socialData),
    market_risk: calculateMarketRisk(marketData),
    overall_risk_score: calculateOverallRisk(marketData, onChainData, socialData)
  };
}

function calculateCompositeScore(
  marketData: any,
  onChainData: any,
  socialData: any,
  tradingSignals: any,
  developerData: any
) {
  const weights = {
    market: 0.25,
    technical: 0.20,
    fundamental: 0.20,
    social: 0.15,
    developer: 0.10,
    risk: 0.10
  };

  const scores = {
    market_score: calculateMarketScore(marketData),
    technical_score: tradingSignals?.signals?.technical_score || 0,
    fundamental_score: calculateFundamentalScore(onChainData),
    social_score: socialData?.overall_sentiment?.score || 0,
    developer_score: calculateDeveloperScore(developerData),
    risk_score: calculateRiskScore(marketData, onChainData, socialData)
  };

  return {
    total_score: Object.entries(scores).reduce(
      (total, [key, score]) => total + score * weights[key.split('_')[0] as keyof typeof weights],
      0
    ),
    component_scores: scores,
    confidence: calculateConfidenceScore(scores),
    rating: assignRating(scores),
    trend: determineTrend(scores)
  };
}

// Helper functions for metric calculations
function determineTrend(marketData: any) {
  const priceChanges = {
    '1h': marketData.market_data?.price_change_percentage_1h_in_currency?.usd,
    '24h': marketData.market_data?.price_change_percentage_24h,
    '7d': marketData.market_data?.price_change_percentage_7d
  };

  if (!priceChanges['24h']) return 'neutral';

  const strength = Math.abs(priceChanges['24h']);
  const direction = priceChanges['24h'] > 0;

  if (strength > 10) return direction ? 'strong_uptrend' : 'strong_downtrend';
  if (strength > 5) return direction ? 'uptrend' : 'downtrend';
  return 'neutral';
}

function calculateMomentum(marketData: any) {
  const changes = [
    marketData.market_data?.price_change_percentage_24h,
    marketData.market_data?.price_change_percentage_7d,
    marketData.market_data?.price_change_percentage_14d,
    marketData.market_data?.price_change_percentage_30d
  ].filter(Boolean);

  if (changes.length === 0) return 0;

  return changes.reduce((sum, change) => sum + change, 0) / changes.length;
}

function calculateVolatility(marketData: any) {
  const prices = marketData.market_data?.sparkline_7d?.price;
  if (!prices || prices.length < 2) return 0;

  const returns = prices.slice(1).map((price: number, i: number) => 
    (price - prices[i]) / prices[i]
  );

  const mean = returns.reduce((sum: number, ret: number) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum: number, ret: number) => 
    sum + Math.pow(ret - mean, 2), 0
  ) / returns.length;

  return Math.sqrt(variance * 365); // Annualized volatility
}

function calculateRelativeStrength(marketData: any) {
  const priceChange = marketData.market_data?.price_change_percentage_24h;
  const marketCapRank = marketData.market_cap_rank;
  
  if (!priceChange || !marketCapRank) return 0;

  // Higher score for better performing high-ranked tokens
  return (priceChange / 10) * (1 + (100 - Math.min(marketCapRank, 100)) / 100);
}

function calculateNetworkValue(marketData: any, metrics: any) {
  const marketCap = marketData.market_data?.market_cap?.usd;
  const activeAddresses = metrics.active_addresses_24h;
  
  if (!marketCap || !activeAddresses) return 0;

  return marketCap / activeAddresses; // Network value per active user
}

function calculateNetworkUtilization(metrics: any) {
  const {
    transaction_count_24h,
    network_capacity_24h,
    active_addresses_24h,
    total_addresses
  } = metrics;

  if (!transaction_count_24h || !network_capacity_24h) return 0;

  const txUtilization = transaction_count_24h / network_capacity_24h;
  const addressUtilization = active_addresses_24h / total_addresses;

  return (txUtilization + addressUtilization) / 2;
}

function calculateValueLocked(marketData: any, metrics: any) {
  const marketCap = marketData.market_data?.market_cap?.usd;
  const stakedAmount = metrics.staked_amount;
  const lockedAmount = metrics.locked_amount;

  if (!marketCap) return 0;

  return ((stakedAmount || 0) + (lockedAmount || 0)) / marketCap;
}

function calculateTokenVelocity(marketData: any, metrics: any) {
  const volume24h = marketData.market_data?.total_volume?.usd;
  const marketCap = marketData.market_data?.market_cap?.usd;

  if (!volume24h || !marketCap) return 0;

  return volume24h / marketCap; // Daily token velocity
}

function calculateSocialDominance(sentiment: any) {
  const mentions = sentiment.mentions || 0;
  const totalMentions = sentiment.total_market_mentions || 1;

  return mentions / totalMentions;
}

function calculateTrendStrength(sentiment: any) {
  const score = sentiment.score || 0;
  const magnitude = sentiment.magnitude || 0;
  const mentions = sentiment.mentions || 0;

  return Math.abs(score) * magnitude * Math.log10(mentions + 1);
}

function calculateRecentCommits(repos: any[]) {
  return repos.reduce((sum: number, repo: any) => {
    const weeksSinceLastCommit = (Date.now() - new Date(repo.pushed_at).getTime()) / (7 * 24 * 60 * 60 * 1000);
    return sum + (weeksSinceLastCommit < 1 ? 2 : weeksSinceLastCommit < 4 ? 1 : 0);
  }, 0);
}

function calculateContributors(repos: any[]) {
  return repos.reduce((sum: number, repo: any) => sum + (repo.contributors_count || 0), 0);
}

function calculateDevelopmentActivity(repos: any[]) {
  return repos.reduce((score: number, repo: any) => {
    const baseScore = (repo.stargazers_count || 0) * 0.3 +
                     (repo.forks_count || 0) * 0.3 +
                     (repo.open_issues_count || 0) * 0.2 +
                     (repo.watchers_count || 0) * 0.2;
    
    const daysSinceLastUpdate = (Date.now() - new Date(repo.updated_at).getTime()) / (24 * 60 * 60 * 1000);
    const recencyMultiplier = Math.exp(-daysSinceLastUpdate / 30); // Exponential decay over 30 days
    
    return score + (baseScore * recencyMultiplier);
  }, 0);
}

function calculateMarketScore(marketData: any) {
  const metrics = marketData.market_data || {};
  
  const marketCapScore = Math.min(Math.log10(metrics.market_cap?.usd || 0) / 11, 1);
  const volumeScore = Math.min(Math.log10(metrics.total_volume?.usd || 0) / 10, 1);
  const liquidityScore = calculateLiquidityScore(metrics);
  
  return (marketCapScore * 0.4 + volumeScore * 0.3 + liquidityScore * 0.3);
}

function calculateFundamentalScore(onChainData: any) {
  const metrics = onChainData?.metrics || {};
  
  const activityScore = Math.min(Math.log10(metrics.active_addresses_24h || 0) / 6, 1);
  const transactionScore = Math.min(Math.log10(metrics.transaction_count_24h || 0) / 6, 1);
  const valueLockedScore = Math.min((metrics.value_locked || 0) / 0.5, 1);
  
  return (activityScore * 0.4 + transactionScore * 0.3 + valueLockedScore * 0.3);
}

function calculateDeveloperScore(developerData: any) {
  const repos = developerData.items || [];
  
  const totalStars = repos.reduce((sum: number, repo: any) => sum + (repo.stargazers_count || 0), 0);
  const totalForks = repos.reduce((sum: number, repo: any) => sum + (repo.forks_count || 0), 0);
  
  const starsScore = Math.min(Math.log10(totalStars + 1) / 4, 1);
  const forksScore = Math.min(Math.log10(totalForks + 1) / 3, 1);
  const activityScore = calculateDevelopmentActivity(repos) / 1000;
  
  return (starsScore * 0.4 + forksScore * 0.3 + activityScore * 0.3);
}

function calculateRiskScore(marketData: any, onChainData: any, socialData: any) {
  const volatilityRisk = calculateVolatilityRisk(marketData);
  const liquidityRisk = calculateLiquidityRisk(marketData);
  const concentrationRisk = calculateConcentrationRisk(onChainData);
  const sentimentRisk = calculateSentimentRisk(socialData);
  
  // Lower score means higher risk
  return 1 - (
    volatilityRisk * 0.3 +
    liquidityRisk * 0.3 +
    concentrationRisk * 0.2 +
    sentimentRisk * 0.2
  );
}

function calculateVolatilityRisk(marketData: any) {
  const volatility = calculateVolatility(marketData);
  return Math.max(0, 1 - volatility / 2); // Normalize to 0-1, higher volatility = higher risk
}

function calculateLiquidityRisk(marketData: any) {
  const metrics = marketData.market_data || {};
  const volumeToMcap = (metrics.total_volume?.usd || 0) / (metrics.market_cap?.usd || 1);
  return Math.min(volumeToMcap * 2, 1); // Higher ratio = lower risk
}

function calculateConcentrationRisk(onChainData: any) {
  const metrics = onChainData?.metrics || {};
  const topHoldersPercentage = metrics.top_10_percentage || 0;
  return Math.max(0, 1 - topHoldersPercentage / 100); // Higher concentration = higher risk
}

function calculateSentimentRisk(socialData: any) {
  const sentiment = socialData?.overall_sentiment || {};
  const volatility = Math.abs(sentiment.positive_percentage - sentiment.negative_percentage) / 100;
  return Math.max(0, 1 - volatility); // Higher sentiment volatility = higher risk
}

function calculateMarketRisk(marketData: any) {
  const metrics = marketData.market_data || {};
  
  const marketCapRisk = 1 - Math.min(Math.log10(metrics.market_cap?.usd || 0) / 11, 1);
  const volumeRisk = 1 - Math.min(Math.log10(metrics.total_volume?.usd || 0) / 10, 1);
  const volatilityRisk = calculateVolatilityRisk(marketData);
  
  return (marketCapRisk * 0.4 + volumeRisk * 0.3 + volatilityRisk * 0.3);
}

function calculateOverallRisk(marketData: any, onChainData: any, socialData: any) {
  const marketRisk = calculateMarketRisk(marketData);
  const concentrationRisk = calculateConcentrationRisk(onChainData);
  const sentimentRisk = calculateSentimentRisk(socialData);
  
  return (marketRisk * 0.5 + concentrationRisk * 0.3 + sentimentRisk * 0.2);
}

function calculateLiquidityScore(metrics: any) {
  const volume = metrics.total_volume?.usd || 0;
  const marketCap = metrics.market_cap?.usd || 1;
  
  return Math.min(volume / marketCap * 5, 1); // Normalize to 0-1
}

function calculateConfidenceScore(scores: any) {
  const variance = Object.values(scores).reduce((sum: number, score: any) => 
    sum + Math.pow(score - 0.5, 2), 0
  ) / Object.keys(scores).length;
  
  return Math.max(0, 1 - Math.sqrt(variance) * 2);
}

function assignRating(scores: any) {
  const totalScore = Object.values(scores).reduce((sum: number, score: any) => sum + score, 0) / 
                    Object.keys(scores).length;
  
  if (totalScore > 0.8) return 'A+';
  if (totalScore > 0.7) return 'A';
  if (totalScore > 0.6) return 'B+';
  if (totalScore > 0.5) return 'B';
  if (totalScore > 0.4) return 'C+';
  if (totalScore > 0.3) return 'C';
  return 'D';
}

function determineTrend(scores: any) {
  const recentScore = Object.values(scores).reduce((sum: number, score: any) => sum + score, 0) / 
                     Object.keys(scores).length;
  
  if (recentScore > 0.7) return 'strongly_bullish';
  if (recentScore > 0.6) return 'bullish';
  if (recentScore > 0.4) return 'neutral';
  if (recentScore > 0.3) return 'bearish';
  return 'strongly_bearish';
}