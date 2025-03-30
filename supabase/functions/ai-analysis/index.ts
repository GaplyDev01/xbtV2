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

    // Get tokens that need analysis
    const { data: tokens, error: tokensError } = await supabaseClient
      .from('token_metrics')
      .select(`
        token_id,
        metrics,
        token_sentiment (
          twitter_sentiment,
          reddit_sentiment
        ),
        token_news (
          title,
          sentiment,
          published_at
        )
      `)
      .order('ai_analysis_updated_at', { ascending: true })
      .limit(10); // Process 10 tokens per run

    if (tokensError) throw tokensError;

    const analysisResults = await Promise.all(
      (tokens || []).map(async (token) => {
        try {
          // Prepare data for AI analysis
          const analysisData = {
            market_metrics: token.metrics || {},
            sentiment: {
              twitter: token.token_sentiment?.twitter_sentiment || {},
              reddit: token.token_sentiment?.reddit_sentiment || {}
            },
            recent_news: token.token_news || []
          };

          // Call AI service for analysis
          const aiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'deepseek-r1-distill-llama-70b',
              messages: [
                {
                  role: 'system',
                  content: 'You are an expert cryptocurrency analyst. Analyze the provided market data, sentiment, and news to generate trading signals and market insights.'
                },
                {
                  role: 'user',
                  content: JSON.stringify(analysisData)
                }
              ],
              temperature: 0.7,
              max_tokens: 1000
            })
          });

          if (!aiResponse.ok) {
            throw new Error(`AI API error: ${aiResponse.status}`);
          }

          const aiResult = await aiResponse.json();
          const analysis = aiResult.choices[0].message.content;

          // Store analysis results
          const { error: updateError } = await supabaseClient
            .from('token_analytics')
            .upsert({
              token_id: token.token_id,
              ai_analysis: {
                analysis,
                generated_at: new Date().toISOString(),
                data_analyzed: analysisData
              },
              updated_at: new Date().toISOString()
            });

          if (updateError) throw updateError;

          // Generate trading signals if confidence is high
          if (analysis.includes('Strong Buy') || analysis.includes('Strong Sell')) {
            await supabaseClient
              .from('trading_signals')
              .insert({
                token_id: token.token_id,
                signal: analysis.includes('Strong Buy') ? 'strong_buy' : 'strong_sell',
                confidence: 0.8,
                analysis: analysis,
                generated_at: new Date().toISOString()
              });
          }

          return { token_id: token.token_id, success: true };
        } catch (error) {
          console.error(`Error analyzing ${token.token_id}:`, error);
          return { token_id: token.token_id, success: false, error: error.message };
        }
      })
    );

    return new Response(
      JSON.stringify({
        processed: analysisResults.length,
        successful: analysisResults.filter(r => r.success).length,
        failed: analysisResults.filter(r => !r.success).length,
        details: analysisResults
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