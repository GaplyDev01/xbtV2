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

    // Get all portfolios that need rebalancing
    const { data: portfolios, error: portfoliosError } = await supabaseClient
      .from('portfolios')
      .select(`
        id,
        user_id,
        name,
        portfolio_assets (
          id,
          token_id,
          amount,
          target_allocation
        )
      `)
      .not('target_allocation', 'is', null);

    if (portfoliosError) throw portfoliosError;

    const rebalanceResults = await Promise.all(
      (portfolios || []).map(async (portfolio) => {
        try {
          // Get current prices for all assets
          const tokenIds = portfolio.portfolio_assets.map(asset => asset.token_id);
          const pricePromises = tokenIds.map(id => 
            fetch(`https://pro-api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`, {
              headers: {
                'x-cg-pro-api-key': Deno.env.get('COINGECKO_API_KEY') ?? ''
              }
            }).then(res => res.json())
          );

          const prices = await Promise.all(pricePromises);
          const priceMap = prices.reduce((acc, price) => ({ ...acc, ...price }), {});

          // Calculate current allocations
          const totalValue = portfolio.portfolio_assets.reduce((sum, asset) => {
            const price = priceMap[asset.token_id]?.usd || 0;
            return sum + (asset.amount * price);
          }, 0);

          const currentAllocations = portfolio.portfolio_assets.map(asset => {
            const price = priceMap[asset.token_id]?.usd || 0;
            const value = asset.amount * price;
            return {
              ...asset,
              current_allocation: (value / totalValue) * 100,
              price
            };
          });

          // Generate rebalancing recommendations
          const recommendations = currentAllocations.map(asset => {
            const diff = asset.target_allocation - asset.current_allocation;
            const valueToAdjust = (diff / 100) * totalValue;
            const amountToAdjust = valueToAdjust / asset.price;

            return {
              asset_id: asset.id,
              token_id: asset.token_id,
              current_allocation: asset.current_allocation,
              target_allocation: asset.target_allocation,
              difference: diff,
              adjustment_amount: amountToAdjust
            };
          });

          // Store recommendations
          const { error: updateError } = await supabaseClient
            .from('portfolio_rebalance_recommendations')
            .upsert({
              portfolio_id: portfolio.id,
              recommendations,
              total_portfolio_value: totalValue,
              created_at: new Date().toISOString()
            });

          if (updateError) throw updateError;

          // Create notification for user
          if (recommendations.some(r => Math.abs(r.difference) > 5)) { // 5% threshold
            await supabaseClient
              .from('notifications')
              .insert({
                user_id: portfolio.user_id,
                type: 'portfolio',
                title: 'Portfolio Rebalancing Required',
                message: `Your portfolio "${portfolio.name}" needs rebalancing. Some assets are more than 5% off their target allocation.`,
                importance: 'medium',
                read: false
              });
          }

          return { portfolio_id: portfolio.id, success: true };
        } catch (error) {
          console.error(`Error processing portfolio ${portfolio.id}:`, error);
          return { portfolio_id: portfolio.id, success: false, error: error.message };
        }
      })
    );

    return new Response(
      JSON.stringify({
        processed: rebalanceResults.length,
        successful: rebalanceResults.filter(r => r.success).length,
        failed: rebalanceResults.filter(r => !r.success).length,
        details: rebalanceResults
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