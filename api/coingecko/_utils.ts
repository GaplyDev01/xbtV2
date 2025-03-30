// CoinGecko API utilities
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// Helper function to handle CORS headers
export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

// Helper function to make API requests with error handling
export async function fetchCoinGeckoAPI(endpoint: string, params: Record<string, string | undefined> = {}) {
  // Filter out undefined params
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined)
  );
  
  // Build URL with query parameters
  const url = new URL(`${COINGECKO_API_URL}${endpoint}`);
  Object.entries(filteredParams).forEach(([key, value]) => {
    if (value) url.searchParams.append(key, value);
  });
  
  // Get API key from environment variable
  const apiKey = process.env.COINGECKO_API_KEY || '';
  
  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'x-cg-pro-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`CoinGecko API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching from CoinGecko API: ${error}`);
    throw error;
  }
}

// Handle OPTIONS requests for CORS preflight
export function handleOptions() {
  return new Response(null, {
    headers: {
      ...corsHeaders(),
      'Content-Type': 'application/json',
    },
    status: 204,
  });
}

// Handle errors in a consistent way
export function handleError(error: Error) {
  console.error('API Error:', error);
  return new Response(
    JSON.stringify({
      error: error.message || 'An unexpected error occurred',
    }),
    {
      status: 500,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json',
      },
    }
  );
} 