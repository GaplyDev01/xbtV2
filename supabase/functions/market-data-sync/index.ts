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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch active tokens from the database
    const { data: activeTokens, error: tokensError } = await supabaseClient
      .from('token_metrics')
      .select('token_id')
      .order('updated_at', { ascending: true })
      .limit(50); // Process 50 tokens per run

    if (tokensError) throw tokensError;

    // Fetch market data for each token
    const updates = await Promise.all(
      (activeTokens || []).map(async ({ token_id }) => {
        try {
          const response = await fetch(
            `https://pro-api.coingecko.com/api/v3/coins/${token_id}?localization=false&tickers=true&market_data=true&community_data=true&developer_data=true`,
            {
              headers: {
                'x-cg-pro-api-key': Deno.env.get('COINGECKO_API_KEY') ?? ''
              }
            }
          );

          if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status}`);
          }

          const data = await response.json();

          // Update token metrics
          const { error: updateError } = await supabaseClient
            .from('token_metrics')
            .upsert({
              token_id,
              metrics: {
                price_usd: data.market_data?.current_price?.usd,
                market_cap_usd: data.market_data?.market_cap?.usd,
                volume_24h_usd: data.market_data?.total_volume?.usd,
                price_change_24h: data.market_data?.price_change_percentage_24h,
                developer_data: data.developer_data,
                community_data: data.community_data
              },
              updated_at: new Date().toISOString()
            });

          if (updateError) throw updateError;

          return { token_id, success: true };
        } catch (error) {
          console.error(`Error updating ${token_id}:`, error);
          return { token_id, success: false, error: error.message };
        }
      })
    );

    return new Response(
      JSON.stringify({
        processed: updates.length,
        successful: updates.filter(u => u.success).length,
        failed: updates.filter(u => !u.success).length,
        details: updates
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
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});