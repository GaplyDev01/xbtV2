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

    // Get active tokens to monitor
    const { data: activeTokens, error: tokensError } = await supabaseClient
      .from('token_metrics')
      .select('token_id')
      .order('market_cap_usd', { ascending: false })
      .limit(20); // Top 20 tokens by market cap

    if (tokensError) throw tokensError;

    // Fetch and process news for each token
    const newsResults = await Promise.all(
      (activeTokens || []).map(async ({ token_id }) => {
        try {
          // Fetch news from multiple sources
          const [cryptoPanicNews, coinGeckoNews] = await Promise.all([
            fetch(`https://cryptopanic.com/api/v1/posts/?auth_token=${Deno.env.get('CRYPTOPANIC_API_KEY')}&currencies=${token_id}`),
            fetch(`https://pro-api.coingecko.com/api/v3/coins/${token_id}/status_updates`, {
              headers: {
                'x-cg-pro-api-key': Deno.env.get('COINGECKO_API_KEY') ?? ''
              }
            })
          ]);

          const [cryptoPanicData, coinGeckoData] = await Promise.all([
            cryptoPanicNews.json(),
            coinGeckoNews.json()
          ]);

          // Process and deduplicate news
          const processedNews = [
            ...(cryptoPanicData.results || []).map((item: any) => ({
              token_id,
              title: item.title,
              url: item.url,
              source: item.source.domain,
              published_at: item.published_at,
              sentiment: item.sentiment || 'neutral'
            })),
            ...(coinGeckoData.status_updates || []).map((item: any) => ({
              token_id,
              title: item.description,
              url: item.project.public_interest_stats?.news_url || '',
              source: 'coingecko',
              published_at: item.created_at,
              sentiment: 'neutral'
            }))
          ];

          // Store news articles
          const { error: insertError } = await supabaseClient
            .from('token_news')
            .upsert(
              processedNews,
              { 
                onConflict: 'token_id,url',
                ignoreDuplicates: true
              }
            );

          if (insertError) throw insertError;

          // Analyze sentiment and create notifications for significant news
          const significantNews = processedNews.filter(news => 
            news.sentiment === 'positive' || news.sentiment === 'negative'
          );

          if (significantNews.length > 0) {
            await supabaseClient
              .from('notifications')
              .insert(
                significantNews.map(news => ({
                  type: 'news',
                  title: `${token_id.toUpperCase()} News Alert`,
                  message: news.title,
                  importance: news.sentiment === 'negative' ? 'high' : 'medium',
                  read: false,
                  metadata: { token_id, news_url: news.url }
                }))
              );
          }

          return { token_id, success: true, articles_processed: processedNews.length };
        } catch (error) {
          console.error(`Error processing news for ${token_id}:`, error);
          return { token_id, success: false, error: error.message };
        }
      })
    );

    // Clean up old news articles
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await supabaseClient
      .from('token_news')
      .delete()
      .lt('published_at', thirtyDaysAgo.toISOString());

    return new Response(
      JSON.stringify({
        processed: newsResults.length,
        successful: newsResults.filter(r => r.success).length,
        failed: newsResults.filter(r => !r.success).length,
        details: newsResults
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