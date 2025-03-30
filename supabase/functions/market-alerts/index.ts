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

    // Get active alerts
    const { data: alerts, error: alertsError } = await supabaseClient
      .from('alerts')
      .select('*')
      .eq('active', true)
      .eq('triggered', false);

    if (alertsError) throw alertsError;

    // Get current prices from CoinGecko
    const tokens = [...new Set(alerts?.map(alert => alert.asset) || [])];
    const pricePromises = tokens.map(async (token) => {
      const response = await fetch(
        `https://pro-api.coingecko.com/api/v3/simple/price?ids=${token}&vs_currencies=usd&include_24h_vol=true&include_24h_change=true`,
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

    // Check alerts and create notifications
    const triggeredAlerts = [];
    const notifications = [];

    for (const alert of alerts || []) {
      const currentPrice = priceMap[alert.asset]?.usd;
      const priceChange = priceMap[alert.asset]?.usd_24h_change;
      const volume = priceMap[alert.asset]?.usd_24h_vol;

      let isTriggered = false;
      let notificationMessage = '';

      switch (alert.condition) {
        case 'above':
          if (currentPrice > alert.value) {
            isTriggered = true;
            notificationMessage = `${alert.asset.toUpperCase()} price is above ${alert.value} USD`;
          }
          break;
        case 'below':
          if (currentPrice < alert.value) {
            isTriggered = true;
            notificationMessage = `${alert.asset.toUpperCase()} price is below ${alert.value} USD`;
          }
          break;
        case 'percent-change':
          if (Math.abs(priceChange) > alert.value) {
            isTriggered = true;
            notificationMessage = `${alert.asset.toUpperCase()} price changed by ${priceChange.toFixed(2)}%`;
          }
          break;
        case 'volume-spike':
          const avgVolume = volume / 24; // Simple average
          if (avgVolume > alert.value) {
            isTriggered = true;
            notificationMessage = `${alert.asset.toUpperCase()} volume spike detected`;
          }
          break;
      }

      if (isTriggered) {
        triggeredAlerts.push(alert.id);
        notifications.push({
          user_id: alert.user_id,
          type: 'alert',
          title: 'Alert Triggered',
          message: notificationMessage,
          importance: 'high',
          read: false,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Update triggered alerts
    if (triggeredAlerts.length > 0) {
      const { error: updateError } = await supabaseClient
        .from('alerts')
        .update({
          triggered: true,
          triggered_at: new Date().toISOString()
        })
        .in('id', triggeredAlerts);

      if (updateError) throw updateError;
    }

    // Create notifications
    if (notifications.length > 0) {
      const { error: notificationError } = await supabaseClient
        .from('notifications')
        .insert(notifications);

      if (notificationError) throw notificationError;
    }

    return new Response(
      JSON.stringify({
        triggered_alerts: triggeredAlerts.length,
        notifications_created: notifications.length
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