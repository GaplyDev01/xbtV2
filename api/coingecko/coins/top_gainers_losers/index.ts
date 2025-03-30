import { corsHeaders, handleOptions } from '../../_utils';

export const config = {
  runtime: 'edge'
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

  // Get URL parameters for tracking
  const url = new URL(req.url);
  const vsCurrency = url.searchParams.get('vs_currency') || 'usd';
  const duration = url.searchParams.get('duration') || '24h';
  
  // Mock data for gainers and losers
  const result = {
    gainers: [
      {
        id: "solana",
        symbol: "sol",
        name: "Solana",
        image: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
        current_price: 182.45,
        market_cap: 81923764219,
        market_cap_rank: 5,
        total_volume: 3657489321,
        price_change_percentage: 15.42,
        last_updated: new Date().toISOString()
      },
      {
        id: "arbitrum",
        symbol: "arb",
        name: "Arbitrum",
        image: "https://assets.coingecko.com/coins/images/16547/large/arbitrum.png",
        current_price: 1.23,
        market_cap: 3975021834,
        market_cap_rank: 37,
        total_volume: 457921345,
        price_change_percentage: 12.78,
        last_updated: new Date().toISOString()
      }
    ],
    losers: [
      {
        id: "dogecoin",
        symbol: "doge",
        name: "Dogecoin",
        image: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
        current_price: 0.15472,
        market_cap: 22356789012,
        market_cap_rank: 9,
        total_volume: 1346789012,
        price_change_percentage: -8.42,
        last_updated: new Date().toISOString()
      },
      {
        id: "shiba-inu",
        symbol: "shib",
        name: "Shiba Inu",
        image: "https://assets.coingecko.com/coins/images/11939/large/shiba.png",
        current_price: 0.00002345,
        market_cap: 13845672901,
        market_cap_rank: 15,
        total_volume: 845672901,
        price_change_percentage: -6.28,
        last_updated: new Date().toISOString()
      }
    ]
  };
  
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: {
      ...corsHeaders(),
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
} 