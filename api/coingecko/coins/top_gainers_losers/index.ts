import { corsHeaders, fetchCoinGeckoAPI, handleError, handleOptions } from '../../_utils';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    // Get URL parameters from request
    const url = new URL(req.url);
    const params: Record<string, string | undefined> = {
      vs_currency: url.searchParams.get('vs_currency') || 'usd',
      duration: url.searchParams.get('duration') || '24h',
      top: url.searchParams.get('top') || '10',
    };
    
    // Since CoinGecko doesn't have a direct endpoint for top gainers/losers,
    // we'll fetch market data and then sort it ourselves
    const marketData = await fetchCoinGeckoAPI('/coins/markets', {
      vs_currency: params.vs_currency,
      order: 'market_cap_desc',
      per_page: '250', // Get a larger set to find good candidates
      sparkline: 'false',
      price_change_percentage: params.duration === '24h' ? '24h' : 
                               params.duration === '1h' ? '1h' : '7d',
    });
    
    // Filter out coins with null or undefined percentage change
    const filteredCoins = marketData.filter((coin: any) => {
      const changeKey = params.duration === '24h' ? 'price_change_percentage_24h' : 
                        params.duration === '1h' ? 'price_change_percentage_1h_in_currency' : 
                        'price_change_percentage_7d_in_currency';
      return coin[changeKey] !== null && coin[changeKey] !== undefined;
    });
    
    // Sort by percentage change for gainers (highest first)
    const sortedGainers = [...filteredCoins].sort((a: any, b: any) => {
      const changeKey = params.duration === '24h' ? 'price_change_percentage_24h' : 
                        params.duration === '1h' ? 'price_change_percentage_1h_in_currency' : 
                        'price_change_percentage_7d_in_currency';
      return b[changeKey] - a[changeKey];
    });
    
    // Sort by percentage change for losers (lowest first)
    const sortedLosers = [...filteredCoins].sort((a: any, b: any) => {
      const changeKey = params.duration === '24h' ? 'price_change_percentage_24h' : 
                        params.duration === '1h' ? 'price_change_percentage_1h_in_currency' : 
                        'price_change_percentage_7d_in_currency';
      return a[changeKey] - b[changeKey];
    });
    
    // Get the specified number of top gainers and losers
    const topCount = parseInt(params.top || '10', 10);
    const gainers = sortedGainers.slice(0, topCount).map((coin: any) => {
      const changeKey = params.duration === '24h' ? 'price_change_percentage_24h' : 
                        params.duration === '1h' ? 'price_change_percentage_1h_in_currency' : 
                        'price_change_percentage_7d_in_currency';
      return {
        ...coin,
        price_change_percentage: coin[changeKey],
      };
    });
    
    const losers = sortedLosers.slice(0, topCount).map((coin: any) => {
      const changeKey = params.duration === '24h' ? 'price_change_percentage_24h' : 
                        params.duration === '1h' ? 'price_change_percentage_1h_in_currency' : 
                        'price_change_percentage_7d_in_currency';
      return {
        ...coin,
        price_change_percentage: coin[changeKey],
      };
    });
    
    const result = {
      gainers,
      losers,
    };
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    return handleError(error as Error);
  }
} 