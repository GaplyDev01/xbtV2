import { fetchCoinGeckoAPI, corsHeaders, handleOptions, handleError } from '../_utils';
import { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

/**
 * Handler for coin categories
 */
export default async function handler(req: NextRequest) {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }

  try {
    // Fetch categories data from CoinGecko API
    const data = await fetchCoinGeckoAPI('/coins/categories');
    
    // Return the data with CORS headers
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    return handleError(error as Error);
  }
} 