import { corsHeaders, fetchCoinGeckoAPI, handleError, handleOptions } from '../_utils';

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
      ids: url.searchParams.get('ids') || undefined,
      category: url.searchParams.get('category') || undefined,
      order: url.searchParams.get('order') || 'market_cap_desc',
      per_page: url.searchParams.get('per_page') || '100',
      page: url.searchParams.get('page') || '1',
      sparkline: url.searchParams.get('sparkline') || 'false',
      price_change_percentage: url.searchParams.get('price_change_percentage') || undefined,
    };
    
    const data = await fetchCoinGeckoAPI('/coins/markets', params);
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    return handleError(error as Error);
  }
} 