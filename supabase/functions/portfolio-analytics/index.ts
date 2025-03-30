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
    const { portfolio_id, timeframe = '30d' } = await req.json();

    if (!portfolio_id) {
      throw new Error('portfolio_id is required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get portfolio data
    const [portfolioData, transactionData] = await Promise.all([
      // Get portfolio assets
      supabaseClient
        .from('portfolio_assets')
        .select('*')
        .eq('portfolio_id', portfolio_id),
      
      // Get transactions
      supabaseClient
        .from('transactions')
        .select('*')
        .eq('portfolio_id', portfolio_id)
        .order('timestamp', { ascending: true })
    ]);

    if (portfolioData.error) throw portfolioData.error;
    if (transactionData.error) throw transactionData.error;

    const assets = portfolioData.data || [];
    const transactions = transactionData.data || [];

    // Get historical price data for assets
    const tokenIds = [...new Set(assets.map(asset => asset.token_id))];
    const pricePromises = tokenIds.map(async (token) => {
      const response = await fetch(
        `https://pro-api.coingecko.com/api/v3/coins/${token}/market_chart?vs_currency=usd&days=${timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365}`,
        {
          headers: {
            'x-cg-pro-api-key': Deno.env.get('COINGECKO_API_KEY') ?? ''
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      
      return { token, data: await response.json() };
    });

    const priceData = await Promise.all(pricePromises);
    const priceHistory = priceData.reduce((acc, { token, data }) => {
      acc[token] = data;
      return acc;
    }, {});

    // Calculate portfolio metrics
    const analysis = calculatePortfolioMetrics(assets, transactions, priceHistory);

    // Store analysis results
    const { error: storageError } = await supabaseClient
      .from('portfolio_analytics')
      .upsert({
        portfolio_id,
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

function calculatePortfolioMetrics(assets: any[], transactions: any[], priceHistory: any) {
  // Calculate current portfolio value
  const currentValue = assets.reduce((total, asset) => {
    const latestPrice = priceHistory[asset.token_id]?.prices?.slice(-1)[0]?.[1] || 0;
    return total + (asset.amount * latestPrice);
  }, 0);

  // Calculate historical portfolio values
  const dailyValues = calculateDailyPortfolioValues(assets, transactions, priceHistory);

  // Calculate returns
  const returns = calculateReturns(dailyValues);

  // Calculate risk metrics
  const riskMetrics = calculateRiskMetrics(returns);

  // Calculate asset allocation
  const allocation = calculateAssetAllocation(assets, priceHistory);

  // Calculate performance metrics
  const performance = calculatePerformanceMetrics(dailyValues, returns);

  return {
    current_value: currentValue,
    daily_values: dailyValues,
    returns,
    risk_metrics: riskMetrics,
    allocation,
    performance
  };
}

function calculateDailyPortfolioValues(assets: any[], transactions: any[], priceHistory: any) {
  const dailyValues: { timestamp: number; value: number }[] = [];
  const startTime = Math.min(...Object.values(priceHistory).map(data => data.prices[0][0]));
  const endTime = Date.now();

  for (let timestamp = startTime; timestamp <= endTime; timestamp += 86400000) {
    let portfolioValue = 0;

    // Calculate portfolio value for each asset at this timestamp
    for (const asset of assets) {
      const prices = priceHistory[asset.token_id]?.prices || [];
      const price = findNearestPrice(prices, timestamp);
      if (price) {
        portfolioValue += asset.amount * price;
      }
    }

    dailyValues.push({ timestamp, value: portfolioValue });
  }

  return dailyValues;
}

function findNearestPrice(prices: number[][], timestamp: number) {
  return prices.reduce((nearest, current) => {
    if (!nearest) return current[1];
    if (Math.abs(current[0] - timestamp) < Math.abs(nearest[0] - timestamp)) {
      return current[1];
    }
    return nearest;
  }, null);
}

function calculateReturns(dailyValues: { timestamp: number; value: number }[]) {
  const returns = [];
  
  for (let i = 1; i < dailyValues.length; i++) {
    const prevValue = dailyValues[i - 1].value;
    const currentValue = dailyValues[i].value;
    const dailyReturn = (currentValue - prevValue) / prevValue;
    returns.push(dailyReturn);
  }

  return {
    daily_returns: returns,
    total_return: (dailyValues[dailyValues.length - 1].value - dailyValues[0].value) / dailyValues[0].value,
    annualized_return: calculateAnnualizedReturn(returns)
  };
}

function calculateAnnualizedReturn(returns: number[]) {
  const totalReturn = returns.reduce((acc, ret) => (1 + acc) * (1 + ret) - 1, 0);
  const years = returns.length / 365;
  return Math.pow(1 + totalReturn, 1 / years) - 1;
}

function calculateRiskMetrics(returns: { daily_returns: number[] }) {
  const dailyReturns = returns.daily_returns;
  
  // Calculate volatility (standard deviation)
  const mean = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length;
  const variance = dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / dailyReturns.length;
  const volatility = Math.sqrt(variance);

  // Calculate Sharpe Ratio (assuming risk-free rate of 2%)
  const riskFreeRate = 0.02;
  const excessReturns = dailyReturns.map(ret => ret - (riskFreeRate / 365));
  const sharpeRatio = (mean * 365 - riskFreeRate) / (volatility * Math.sqrt(365));

  // Calculate maximum drawdown
  let maxDrawdown = 0;
  let peak = -Infinity;
  let value = 1;

  for (const ret of dailyReturns) {
    value *= (1 + ret);
    peak = Math.max(peak, value);
    const drawdown = (peak - value) / peak;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }

  return {
    volatility: volatility * Math.sqrt(365), // Annualized volatility
    sharpe_ratio: sharpeRatio,
    max_drawdown: maxDrawdown,
    var_95: calculateVaR(dailyReturns, 0.95),
    beta: calculateBeta(dailyReturns)
  };
}

function calculateVaR(returns: number[], confidence: number) {
  const sortedReturns = [...returns].sort((a, b) => a - b);
  const index = Math.floor((1 - confidence) * returns.length);
  return -sortedReturns[index];
}

function calculateBeta(returns: number[]) {
  // This would normally compare against market returns
  // For now, returning a placeholder value
  return 1.0;
}

function calculateAssetAllocation(assets: any[], priceHistory: any) {
  const allocation = assets.map(asset => {
    const latestPrice = priceHistory[asset.token_id]?.prices?.slice(-1)[0]?.[1] || 0;
    const value = asset.amount * latestPrice;
    
    return {
      token_id: asset.token_id,
      amount: asset.amount,
      value,
      weight: 0 // Will be calculated after total is known
    };
  });

  const totalValue = allocation.reduce((sum, asset) => sum + asset.value, 0);

  return allocation.map(asset => ({
    ...asset,
    weight: totalValue > 0 ? asset.value / totalValue : 0
  }));
}

function calculatePerformanceMetrics(dailyValues: any[], returns: any) {
  const periods = {
    '24h': 1,
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365
  };

  const metrics: Record<string, any> = {};

  for (const [period, days] of Object.entries(periods)) {
    const startIndex = Math.max(0, dailyValues.length - days);
    const startValue = dailyValues[startIndex].value;
    const endValue = dailyValues[dailyValues.length - 1].value;
    
    metrics[period] = {
      return: (endValue - startValue) / startValue,
      high: Math.max(...dailyValues.slice(startIndex).map(v => v.value)),
      low: Math.min(...dailyValues.slice(startIndex).map(v => v.value))
    };
  }

  return {
    periodic_returns: metrics,
    best_day: Math.max(...returns.daily_returns),
    worst_day: Math.min(...returns.daily_returns),
    positive_days: returns.daily_returns.filter((r: number) => r > 0).length,
    negative_days: returns.daily_returns.filter((r: number) => r < 0).length
  };
}