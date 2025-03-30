import { corsHeaders, fetchCoinGeckoAPI, handleError, handleOptions } from './_utils';

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
    const data = await fetchCoinGeckoAPI('/global');
    
    return new Response(JSON.stringify(data), {
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