// Follow the edge_runtime_node18 pattern
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get request data
    const { portfolio_id } = await req.json();

    if (!portfolio_id) {
      throw new Error('portfolio_id is required');
    }

    // Get portfolio assets
    const { data: assets, error: assetsError } = await supabaseClient
      .from('portfolio_assets')
      .select('*')
      .eq('portfolio_id', portfolio_id);

    if (assetsError) throw assetsError;

    // Get current prices from CoinGecko
    const tokenIds = [...new Set(assets?.map(asset => asset.token_id))];
    const pricePromises = tokenIds.map(async (id) => {
      const response = await fetch(
        `https://pro-api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`,
        {
          headers: {
            'x-cg-pro-api-key': Deno.env.get('COINGECKO_API_KEY') ?? ''
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      
      return response.json();
    });

    const prices = await Promise.all(pricePromises);
    const priceMap = prices.reduce((acc, price) => ({ ...acc, ...price }), {});

    // Calculate portfolio value and performance
    const portfolioValue = assets?.reduce((total, asset) => {
      const currentPrice = priceMap[asset.token_id]?.usd ?? 0;
      return total + (asset.amount * currentPrice);
    }, 0);

    const portfolioCost = assets?.reduce((total, asset) => {
      return total + (asset.amount * asset.purchase_price_usd);
    }, 0);

    const totalReturn = portfolioValue - portfolioCost;
    const returnPercentage = (portfolioCost > 0) 
      ? ((portfolioValue - portfolioCost) / portfolioCost) * 100 
      : 0;

    // Update portfolio stats
    const { error: updateError } = await supabaseClient
      .from('portfolios')
      .update({
        current_value_usd: portfolioValue,
        total_return_usd: totalReturn,
        return_percentage: returnPercentage,
        updated_at: new Date().toISOString()
      })
      .eq('id', portfolio_id);

    if (updateError) throw updateError;

    // Return updated portfolio data
    return new Response(
      JSON.stringify({
        portfolio_value: portfolioValue,
        total_return: totalReturn,
        return_percentage: returnPercentage,
        assets: assets?.map(asset => ({
          ...asset,
          current_price: priceMap[asset.token_id]?.usd ?? 0,
          current_value: (priceMap[asset.token_id]?.usd ?? 0) * asset.amount,
          return: ((priceMap[asset.token_id]?.usd ?? 0) - asset.purchase_price_usd) * asset.amount,
          return_percentage: ((priceMap[asset.token_id]?.usd ?? 0) - asset.purchase_price_usd) / asset.purchase_price_usd * 100
        }))
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