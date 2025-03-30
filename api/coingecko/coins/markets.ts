import { fetchCoinGeckoAPI, corsHeaders, handleOptions, handleError } from '../_utils';
import { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

/**
 * Handler for coin market data
 */
export default async function handler(req: NextRequest) {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }

  try {
    // Extract query parameters
    const url = new URL(req.url);
    const vs_currency = url.searchParams.get('vs_currency') || 'usd';
    const order = url.searchParams.get('order') || 'market_cap_desc';
    const per_page = url.searchParams.get('per_page') || '100';
    const page = url.searchParams.get('page') || '1';
    const sparkline = url.searchParams.get('sparkline') || 'false';
    const ids = url.searchParams.get('ids');
    
    // Fetch market data from CoinGecko API
    const data = await fetchCoinGeckoAPI('/coins/markets', {
      vs_currency,
      order,
      per_page,
      page,
      sparkline,
      ids,
    });
    
    // Return the data with CORS headers
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    return handleError(error as Error);
  }
} 