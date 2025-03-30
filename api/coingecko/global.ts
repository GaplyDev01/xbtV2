import { fetchCoinGeckoAPI, corsHeaders, handleOptions, handleError } from './_utils';
import { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

/**
 * Handler for global market data
 */
export default async function handler(req: NextRequest) {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }

  try {
    // Fetch global market data from CoinGecko API
    const data = await fetchCoinGeckoAPI('/global');
    
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