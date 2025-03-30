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
    const { token_id, timeframe = '1d' } = await req.json();

    if (!token_id) {
      throw new Error('token_id is required');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch price data
    const response = await fetch(
      `https://pro-api.coingecko.com/api/v3/coins/${token_id}/ohlc?vs_currency=usd&days=${
        timeframe === '1d' ? 1 : 
        timeframe === '1w' ? 7 : 
        timeframe === '1m' ? 30 : 90
      }`,
      {
        headers: {
          'x-cg-pro-api-key': Deno.env.get('COINGECKO_API_KEY') ?? ''
        }
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const ohlcData = await response.json();

    // Get sentiment data
    const { data: sentiment } = await supabaseClient
      .from('token_sentiment')
      .select('*')
      .eq('token_id', token_id)
      .single();

    // Get on-chain data (mock for now)
    const onChainMetrics = await getOnChainMetrics(token_id);

    // Calculate technical indicators
    const technicalSignals = calculateTechnicalSignals(ohlcData);

    // Generate trading signals
    const signals = generateTradingSignals(
      technicalSignals,
      sentiment?.overall_sentiment,
      onChainMetrics
    );

    // Store signals
    const { error: storageError } = await supabaseClient
      .from('trading_signals')
      .upsert({
        token_id,
        timeframe,
        signals,
        technical_indicators: technicalSignals,
        sentiment_data: sentiment?.overall_sentiment,
        onchain_metrics: onChainMetrics,
        updated_at: new Date().toISOString()
      });

    if (storageError) throw storageError;

    return new Response(
      JSON.stringify({
        token_id,
        timeframe,
        signals,
        technical_indicators: technicalSignals,
        sentiment: sentiment?.overall_sentiment,
        onchain_metrics: onChainMetrics
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

function calculateTechnicalSignals(ohlcData: number[][]) {
  const closes = ohlcData.map(candle => candle[4]);
  const highs = ohlcData.map(candle => candle[2]);
  const lows = ohlcData.map(candle => candle[3]);

  return {
    moving_averages: calculateMovingAverages(closes),
    rsi: calculateRSI(closes),
    macd: calculateMACD(closes),
    bollinger_bands: calculateBollingerBands(closes),
    support_resistance: findSupportResistance(highs, lows),
    patterns: identifyPatterns(ohlcData)
  };
}

function calculateMovingAverages(prices: number[]) {
  return {
    sma_20: calculateSMA(prices, 20),
    sma_50: calculateSMA(prices, 50),
    sma_200: calculateSMA(prices, 200),
    ema_12: calculateEMA(prices, 12),
    ema_26: calculateEMA(prices, 26)
  };
}

function calculateSMA(prices: number[], period: number) {
  if (prices.length < period) return null;
  return prices.slice(-period).reduce((sum, price) => sum + price, 0) / period;
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

function calculateRSI(prices: number[], period = 14) {
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
    macd: macdLine,
    signal: signalLine,
    histogram: macdLine - (signalLine || 0)
  };
}

function calculateBollingerBands(prices: number[], period = 20) {
  const sma = calculateSMA(prices, period);
  if (!sma) return null;

  const stdDev = Math.sqrt(
    prices.slice(-period).reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period
  );

  return {
    middle: sma,
    upper: sma + (stdDev * 2),
    lower: sma - (stdDev * 2)
  };
}

function findSupportResistance(highs: number[], lows: number[]) {
  const levels = new Map<number, number>();
  
  // Round prices to significant levels
  const roundToLevel = (price: number) => {
    const magnitude = Math.pow(10, Math.floor(Math.log10(price)));
    return Math.round(price / (magnitude / 2)) * (magnitude / 2);
  };

  // Count price level occurrences
  [...highs, ...lows].forEach(price => {
    const level = roundToLevel(price);
    levels.set(level, (levels.get(level) || 0) + 1);
  });

  // Find significant levels
  const significantLevels = Array.from(levels.entries())
    .filter(([_, count]) => count > 3)
    .sort(([a], [b]) => a - b)
    .map(([level]) => level);

  return {
    support: significantLevels.filter(level => level < lows[lows.length - 1]),
    resistance: significantLevels.filter(level => level > highs[highs.length - 1])
  };
}

function identifyPatterns(ohlc: number[][]) {
  const patterns = [];
  
  // Check for bullish patterns
  if (isBullishEngulfing(ohlc)) patterns.push('bullish_engulfing');
  if (isMorningStar(ohlc)) patterns.push('morning_star');
  if (isHammer(ohlc)) patterns.push('hammer');
  
  // Check for bearish patterns
  if (isBearishEngulfing(ohlc)) patterns.push('bearish_engulfing');
  if (isEveningStar(ohlc)) patterns.push('evening_star');
  if (isShootingStar(ohlc)) patterns.push('shooting_star');
  
  return patterns;
}

// Pattern recognition helpers
function isBullishEngulfing(ohlc: number[][]) {
  const last = ohlc[ohlc.length - 1];
  const prev = ohlc[ohlc.length - 2];
  return prev[1] > prev[4] && // Previous red candle
         last[1] < last[4] && // Current green candle
         last[1] < prev[4] && // Opens below previous close
         last[4] > prev[1];   // Closes above previous open
}

function isBearishEngulfing(ohlc: number[][]) {
  const last = ohlc[ohlc.length - 1];
  const prev = ohlc[ohlc.length - 2];
  return prev[1] < prev[4] && // Previous green candle
         last[1] > last[4] && // Current red candle
         last[1] > prev[4] && // Opens above previous close
         last[4] < prev[1];   // Closes below previous open
}

function isMorningStar(ohlc: number[][]) {
  const last = ohlc[ohlc.length - 1];
  const middle = ohlc[ohlc.length - 2];
  const first = ohlc[ohlc.length - 3];
  
  const firstBody = Math.abs(first[1] - first[4]);
  const middleBody = Math.abs(middle[1] - middle[4]);
  const lastBody = Math.abs(last[1] - last[4]);
  
  return first[1] > first[4] && // First day down
         middleBody < firstBody * 0.3 && // Small middle body
         last[1] < last[4] && // Last day up
         last[4] > middle[4]; // Closes above middle
}

function isEveningStar(ohlc: number[][]) {
  const last = ohlc[ohlc.length - 1];
  const middle = ohlc[ohlc.length - 2];
  const first = ohlc[ohlc.length - 3];
  
  const firstBody = Math.abs(first[1] - first[4]);
  const middleBody = Math.abs(middle[1] - middle[4]);
  const lastBody = Math.abs(last[1] - last[4]);
  
  return first[1] < first[4] && // First day up
         middleBody < firstBody * 0.3 && // Small middle body
         last[1] > last[4] && // Last day down
         last[4] < middle[4]; // Closes below middle
}

function isHammer(ohlc: number[][]) {
  const candle = ohlc[ohlc.length - 1];
  const body = Math.abs(candle[1] - candle[4]);
  const lowerWick = Math.min(candle[1], candle[4]) - candle[3];
  const upperWick = candle[2] - Math.max(candle[1], candle[4]);
  
  return lowerWick > body * 2 && // Long lower wick
         upperWick < body * 0.5; // Short upper wick
}

function isShootingStar(ohlc: number[][]) {
  const candle = ohlc[ohlc.length - 1];
  const body = Math.abs(candle[1] - candle[4]);
  const lowerWick = Math.min(candle[1], candle[4]) - candle[3];
  const upperWick = candle[2] - Math.max(candle[1], candle[4]);
  
  return upperWick > body * 2 && // Long upper wick
         lowerWick < body * 0.5; // Short lower wick
}

async function getOnChainMetrics(token_id: string) {
  // This would normally fetch real on-chain data
  // Returning mock data for now
  return {
    active_addresses_24h: Math.floor(Math.random() * 10000),
    transaction_count_24h: Math.floor(Math.random() * 50000),
    average_transaction_value: Math.random() * 1000,
    large_transactions_24h: Math.floor(Math.random() * 100),
    network_hash_rate: Math.random() * 1000000,
    staking_ratio: Math.random() * 0.8
  };
}

function generateTradingSignals(
  technical: any,
  sentiment: any,
  onchain: any
) {
  const signals = {
    technical_score: calculateTechnicalScore(technical),
    sentiment_score: calculateSentimentScore(sentiment),
    onchain_score: calculateOnChainScore(onchain),
    overall_signal: 'neutral',
    confidence: 0,
    risk_level: 'medium',
    entry_points: [],
    stop_loss: null,
    take_profit: null
  };

  // Calculate overall signal
  const totalScore = (
    signals.technical_score * 0.5 +
    signals.sentiment_score * 0.3 +
    signals.onchain_score * 0.2
  );

  if (totalScore > 0.7) {
    signals.overall_signal = 'strong_buy';
    signals.confidence = 0.8;
  } else if (totalScore > 0.3) {
    signals.overall_signal = 'buy';
    signals.confidence = 0.6;
  } else if (totalScore < -0.7) {
    signals.overall_signal = 'strong_sell';
    signals.confidence = 0.8;
  } else if (totalScore < -0.3) {
    signals.overall_signal = 'sell';
    signals.confidence = 0.6;
  } else {
    signals.overall_signal = 'neutral';
    signals.confidence = 0.4;
  }

  // Calculate risk level
  signals.risk_level = calculateRiskLevel(technical, sentiment, onchain);

  // Calculate entry points
  if (technical.support_resistance) {
    signals.entry_points = technical.support_resistance.support;
    signals.stop_loss = Math.min(...technical.support_resistance.support) * 0.95;
    signals.take_profit = Math.max(...technical.support_resistance.resistance) * 1.05;
  }

  return signals;
}

function calculateTechnicalScore(technical: any) {
  let score = 0;
  
  // Moving averages
  if (technical.moving_averages) {
    const { sma_20, sma_50, sma_200 } = technical.moving_averages;
    if (sma_20 > sma_50) score += 0.2;
    if (sma_50 > sma_200) score += 0.2;
  }

  // RSI
  if (technical.rsi) {
    if (technical.rsi < 30) score += 0.3; // Oversold
    else if (technical.rsi > 70) score -= 0.3; // Overbought
  }

  // MACD
  if (technical.macd) {
    if (technical.macd.histogram > 0) score += 0.2;
    else score -= 0.2;
  }

  // Patterns
  if (technical.patterns) {
    const bullishPatterns = technical.patterns.filter((p: string) => 
      p.includes('bullish') || p === 'hammer' || p === 'morning_star'
    ).length;
    
    const bearishPatterns = technical.patterns.filter((p: string) => 
      p.includes('bearish') || p === 'shooting_star' || p === 'evening_star'
    ).length;

    score += (bullishPatterns - bearishPatterns) * 0.1;
  }

  return Math.max(-1, Math.min(1, score));
}

function calculateSentimentScore(sentiment: any) {
  if (!sentiment) return 0;

  const score = sentiment.score || 0;
  const magnitude = sentiment.magnitude || 0;
  const positivePercentage = sentiment.positive_percentage || 0;
  const negativePercentage = sentiment.negative_percentage || 0;

  return Math.max(-1, Math.min(1, 
    score * 0.4 + // Sentiment score
    (magnitude > 0.5 ? 0.2 : 0) + // Strong sentiment magnitude
    ((positivePercentage - negativePercentage) / 100) * 0.4 // Sentiment distribution
  ));
}

function calculateOnChainScore(onchain: any) {
  if (!onchain) return 0;

  let score = 0;

  // Active addresses trend
  if (onchain.active_addresses_24h > 5000) score += 0.2;
  
  // Transaction volume
  if (onchain.transaction_count_24h > 20000) score += 0.2;
  
  // Large transactions
  if (onchain.large_transactions_24h > 50) score += 0.2;
  
  // Staking ratio
  if (onchain.staking_ratio > 0.5) score += 0.2;

  // Network health
  if (onchain.network_hash_rate > 500000) score += 0.2;

  return Math.max(-1, Math.min(1, score));
}

function calculateRiskLevel(technical: any, sentiment: any, onchain: any) {
  const volatility = technical.bollinger_bands ? 
    (technical.bollinger_bands.upper - technical.bollinger_bands.lower) / technical.bollinger_bands.middle : 
    0;

  const sentimentVolatility = sentiment ? 
    Math.abs(sentiment.positive_percentage - sentiment.negative_percentage) / 100 : 
    0;

  const riskScore = 
    volatility * 0.4 + 
    sentimentVolatility * 0.3 + 
    (onchain.large_transactions_24h > 50 ? 0.3 : 0);

  if (riskScore > 0.7) return 'high';
  if (riskScore > 0.3) return 'medium';
  return 'low';
}