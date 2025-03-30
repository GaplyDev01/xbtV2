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
    const { token_id, network } = await req.json();

    if (!token_id || !network) {
      throw new Error('token_id and network are required');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get token contract addresses
    const { data: tokenData } = await supabaseClient
      .from('token_contracts')
      .select('*')
      .eq('token_id', token_id)
      .eq('network', network)
      .single();

    if (!tokenData?.address) {
      throw new Error('Token contract not found');
    }

    // Fetch on-chain data based on network
    const onChainData = await fetchOnChainData(network, tokenData.address);

    // Analyze metrics
    const analysis = analyzeOnChainMetrics(onChainData);

    // Store analysis results
    const { error: storageError } = await supabaseClient
      .from('onchain_analytics')
      .upsert({
        token_id,
        network,
        metrics: onChainData,
        analysis,
        updated_at: new Date().toISOString()
      });

    if (storageError) throw storageError;

    // Create alerts for significant events
    if (analysis.alerts.length > 0) {
      const { error: alertError } = await supabaseClient
        .from('notifications')
        .insert(
          analysis.alerts.map(alert => ({
            type: 'onchain',
            title: 'On-Chain Alert',
            message: alert.message,
            importance: alert.importance,
            read: false
          }))
        );

      if (alertError) throw alertError;
    }

    return new Response(
      JSON.stringify({
        token_id,
        network,
        metrics: onChainData,
        analysis
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

async function fetchOnChainData(network: string, address: string) {
  switch (network.toLowerCase()) {
    case 'ethereum':
      return await fetchEthereumData(address);
    case 'solana':
      return await fetchSolanaData(address);
    case 'bitcoin':
      return await fetchBitcoinData(address);
    default:
      throw new Error(`Unsupported network: ${network}`);
  }
}

async function fetchEthereumData(address: string) {
  const endpoint = `https://api.etherscan.io/api`;
  const apiKey = Deno.env.get('ETHERSCAN_API_KEY');

  const [txData, holderData, gasData] = await Promise.all([
    // Get transaction data
    fetch(`${endpoint}?module=account&action=txlist&address=${address}&apikey=${apiKey}`)
      .then(res => res.json()),
    
    // Get token holders
    fetch(`${endpoint}?module=token&action=tokenholderlist&contractaddress=${address}&apikey=${apiKey}`)
      .then(res => res.json()),
    
    // Get gas usage
    fetch(`${endpoint}?module=gastracker&action=gasoracle&apikey=${apiKey}`)
      .then(res => res.json())
  ]);

  return {
    transactions: processTxData(txData),
    holders: processHolderData(holderData),
    gas: gasData.result,
    network_stats: await getEthereumNetworkStats()
  };
}

async function fetchSolanaData(address: string) {
  const endpoint = `https://api.solscan.io/v1`;
  const apiKey = Deno.env.get('SOLSCAN_API_KEY');

  const [accountInfo, tokenHolders, transactions] = await Promise.all([
    // Get account info
    fetch(`${endpoint}/account/${address}`, {
      headers: { 'token': apiKey ?? '' }
    }).then(res => res.json()),
    
    // Get token holders
    fetch(`${endpoint}/token/holders?token=${address}`, {
      headers: { 'token': apiKey ?? '' }
    }).then(res => res.json()),
    
    // Get transactions
    fetch(`${endpoint}/account/transactions?account=${address}`, {
      headers: { 'token': apiKey ?? '' }
    }).then(res => res.json())
  ]);

  return {
    account: accountInfo,
    holders: tokenHolders,
    transactions: transactions,
    network_stats: await getSolanaNetworkStats()
  };
}

async function fetchBitcoinData(address: string) {
  const endpoint = `https://blockchain.info`;

  const [addressData, networkStats] = await Promise.all([
    // Get address data
    fetch(`${endpoint}/rawaddr/${address}`).then(res => res.json()),
    
    // Get network stats
    fetch(`${endpoint}/stats`).then(res => res.json())
  ]);

  return {
    address: addressData,
    network: networkStats
  };
}

function analyzeOnChainMetrics(data: any) {
  const analysis = {
    activity_score: calculateActivityScore(data),
    holder_analysis: analyzeHolders(data),
    transaction_patterns: analyzeTransactions(data),
    network_health: analyzeNetworkHealth(data),
    risk_metrics: calculateRiskMetrics(data),
    alerts: generateAlerts(data)
  };

  return analysis;
}

function calculateActivityScore(data: any) {
  const txCount = data.transactions?.length || 0;
  const uniqueAddresses = new Set(data.transactions?.map((tx: any) => tx.from)).size;
  const volume = data.transactions?.reduce((sum: number, tx: any) => sum + (tx.value || 0), 0) || 0;

  return {
    transaction_frequency: txCount,
    active_addresses: uniqueAddresses,
    volume_score: normalizeVolume(volume),
    activity_level: categorizeActivity(txCount, uniqueAddresses, volume)
  };
}

function analyzeHolders(data: any) {
  const holders = data.holders || [];
  const totalSupply = holders.reduce((sum: number, holder: any) => sum + holder.balance, 0);

  const distribution = {
    top_10_percentage: calculateTopHoldersPercentage(holders, totalSupply, 10),
    top_50_percentage: calculateTopHoldersPercentage(holders, totalSupply, 50),
    top_100_percentage: calculateTopHoldersPercentage(holders, totalSupply, 100),
    gini_coefficient: calculateGiniCoefficient(holders),
    holder_count: holders.length,
    concentration_risk: assessConcentrationRisk(holders, totalSupply)
  };

  return distribution;
}

function analyzeTransactions(data: any) {
  const transactions = data.transactions || [];
  const timeWindows = [1, 24,168]; // 1 hour, 24 hours, 1 week in hours

  const patterns = timeWindows.reduce((acc: any, hours: number) => {
    const windowTxs = filterTransactionsByTime(transactions, hours);
    acc[`${hours}h`] = {
      count: windowTxs.length,
      volume: calculateTransactionVolume(windowTxs),
      unique_addresses: countUniqueAddresses(windowTxs),
      average_size: calculateAverageTransactionSize(windowTxs),
      large_transactions: countLargeTransactions(windowTxs)
    };
    return acc;
  }, {});

  return {
    patterns,
    anomalies: detectTransactionAnomalies(patterns),
    trends: calculateTransactionTrends(patterns)
  };
}

function analyzeNetworkHealth(data: any) {
  return {
    hash_rate: data.network_stats?.hash_rate,
    difficulty: data.network_stats?.difficulty,
    active_nodes: data.network_stats?.nodes,
    network_load: calculateNetworkLoad(data),
    health_score: calculateNetworkHealthScore(data)
  };
}

function calculateRiskMetrics(data: any) {
  return {
    holder_concentration: calculateHolderConcentrationRisk(data),
    volume_volatility: calculateVolumeVolatility(data),
    smart_contract_risk: assessSmartContractRisk(data),
    liquidity_risk: calculateLiquidityRisk(data),
    overall_risk_score: calculateOverallRisk(data)
  };
}

function generateAlerts(data: any) {
  const alerts = [];

  // Check for large transactions
  const largeTransactions = findLargeTransactions(data);
  if (largeTransactions.length > 0) {
    alerts.push({
      type: 'large_transaction',
      message: `${largeTransactions.length} large transactions detected`,
      importance: 'high',
      details: largeTransactions
    });
  }

  // Check for whale movements
  const whaleMovements = detectWhaleMovements(data);
  if (whaleMovements.length > 0) {
    alerts.push({
      type: 'whale_movement',
      message: 'Significant whale movement detected',
      importance: 'high',
      details: whaleMovements
    });
  }

  // Check for unusual activity
  const unusualActivity = detectUnusualActivity(data);
  if (unusualActivity) {
    alerts.push({
      type: 'unusual_activity',
      message: 'Unusual on-chain activity detected',
      importance: 'medium',
      details: unusualActivity
    });
  }

  // Check network health
  const networkIssues = checkNetworkHealth(data);
  if (networkIssues) {
    alerts.push({
      type: 'network_health',
      message: 'Network health issues detected',
      importance: 'medium',
      details: networkIssues
    });
  }

  return alerts;
}

// Helper functions
function calculateTopHoldersPercentage(holders: any[], totalSupply: number, count: number) {
  return holders
    .sort((a, b) => b.balance - a.balance)
    .slice(0, count)
    .reduce((sum, holder) => sum + holder.balance, 0) / totalSupply * 100;
}

function calculateGiniCoefficient(holders: any[]) {
  const sortedBalances = holders
    .map(h => h.balance)
    .sort((a, b) => a - b);
  
  const n = sortedBalances.length;
  if (n === 0) return 0;

  let numerator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (2 * i - n + 1) * sortedBalances[i];
  }

  const mean = sortedBalances.reduce((a, b) => a + b, 0) / n;
  return numerator / (2 * Math.pow(n, 2) * mean);
}

function assessConcentrationRisk(holders: any[], totalSupply: number) {
  const top10Percentage = calculateTopHoldersPercentage(holders, totalSupply, 10);
  
  if (top10Percentage > 80) return 'very_high';
  if (top10Percentage > 60) return 'high';
  if (top10Percentage > 40) return 'medium';
  if (top10Percentage > 20) return 'low';
  return 'very_low';
}

function filterTransactionsByTime(transactions: any[], hours: number) {
  const cutoff = Date.now() - (hours * 60 * 60 * 1000);
  return transactions.filter((tx: any) => tx.timestamp >= cutoff);
}

function calculateTransactionVolume(transactions: any[]) {
  return transactions.reduce((sum: number, tx: any) => sum + (tx.value || 0), 0);
}

function countUniqueAddresses(transactions: any[]) {
  return new Set([
    ...transactions.map((tx: any) => tx.from),
    ...transactions.map((tx: any) => tx.to)
  ]).size;
}

function calculateAverageTransactionSize(transactions: any[]) {
  if (transactions.length === 0) return 0;
  return calculateTransactionVolume(transactions) / transactions.length;
}

function countLargeTransactions(transactions: any[]) {
  const avgSize = calculateAverageTransactionSize(transactions);
  return transactions.filter((tx: any) => tx.value > avgSize * 10).length;
}

function detectTransactionAnomalies(patterns: any) {
  const anomalies = [];
  const hourlyAvg = patterns['1h'].count;
  const dailyAvg = patterns['24h'].count / 24;

  if (hourlyAvg > dailyAvg * 3) {
    anomalies.push({
      type: 'high_frequency',
      severity: 'high',
      details: `Current transaction frequency (${hourlyAvg}/hour) is 3x higher than average`
    });
  }

  if (patterns['1h'].large_transactions > patterns['24h'].large_transactions / 24 * 3) {
    anomalies.push({
      type: 'large_tx_spike',
      severity: 'high',
      details: 'Unusual spike in large transactions'
    });
  }

  return anomalies;
}

function calculateTransactionTrends(patterns: any) {
  return {
    volume_trend: calculateTrend(patterns, 'volume'),
    frequency_trend: calculateTrend(patterns, 'count'),
    size_trend: calculateTrend(patterns, 'average_size')
  };
}

function calculateTrend(patterns: any, metric: string) {
  const hourly = patterns['1h'][metric];
  const daily = patterns['24h'][metric] / 24;
  const weekly = patterns['168h'][metric] / 168;

  if (hourly > daily * 1.5) return 'strongly_increasing';
  if (hourly > daily * 1.1) return 'increasing';
  if (hourly < daily * 0.5) return 'strongly_decreasing';
  if (hourly < daily * 0.9) return 'decreasing';
  return 'stable';
}

function calculateNetworkLoad(data: any) {
  const stats = data.network_stats || {};
  
  return {
    transaction_load: stats.transactions_per_second / stats.max_transactions_per_second,
    memory_usage: stats.memory_usage_percentage,
    cpu_usage: stats.cpu_usage_percentage,
    node_load: stats.active_nodes / stats.total_nodes
  };
}

function calculateNetworkHealthScore(data: any) {
  const load = calculateNetworkLoad(data);
  
  const scores = {
    transaction_score: 1 - (load.transaction_load || 0),
    memory_score: 1 - (load.memory_usage || 0) / 100,
    cpu_score: 1 - (load.cpu_usage || 0) / 100,
    node_score: load.node_load || 0
  };

  return (
    scores.transaction_score * 0.4 +
    scores.memory_score * 0.2 +
    scores.cpu_score * 0.2 +
    scores.node_score * 0.2
  );
}

function findLargeTransactions(data: any) {
  const transactions = data.transactions || [];
  const avgValue = calculateAverageTransactionSize(transactions);
  
  return transactions
    .filter((tx: any) => tx.value > avgValue * 10)
    .map((tx: any) => ({
      hash: tx.hash,
      value: tx.value,
      from: tx.from,
      to: tx.to,
      timestamp: tx.timestamp
    }));
}

function detectWhaleMovements(data: any) {
  const holders = data.holders || [];
  const transactions = data.transactions || [];
  
  // Identify whale addresses (top 1% holders)
  const whaleThreshold = holders
    .sort((a: any, b: any) => b.balance - a.balance)
    [Math.floor(holders.length * 0.01)]?.balance || 0;

  return transactions
    .filter((tx: any) => {
      const isWhaleAddress = holders.some((h: any) => 
        (h.address === tx.from || h.address === tx.to) && 
        h.balance >= whaleThreshold
      );
      return isWhaleAddress && tx.value > whaleThreshold * 0.1;
    })
    .map((tx: any) => ({
      hash: tx.hash,
      value: tx.value,
      from: tx.from,
      to: tx.to,
      timestamp: tx.timestamp
    }));
}

function detectUnusualActivity(data: any) {
  const patterns = analyzeTransactions(data).patterns;
  const anomalies = [];

  // Check transaction frequency
  if (patterns['1h'].count > patterns['24h'].count / 12) { // 2x hourly average
    anomalies.push({
      type: 'high_frequency',
      details: 'Unusual transaction frequency detected'
    });
  }

  // Check volume spikes
  if (patterns['1h'].volume > patterns['24h'].volume / 12) { // 2x hourly average
    anomalies.push({
      type: 'volume_spike',
      details: 'Unusual transaction volume detected'
    });
  }

  // Check new addresses
  const recentAddresses = countUniqueAddresses(filterTransactionsByTime(data.transactions, 1));
  const avgNewAddresses = countUniqueAddresses(filterTransactionsByTime(data.transactions, 24)) / 24;
  
  if (recentAddresses > avgNewAddresses * 2) {
    anomalies.push({
      type: 'new_addresses',
      details: 'Surge in new addresses detected'
    });
  }

  return anomalies.length > 0 ? anomalies : null;
}

function checkNetworkHealth(data: any) {
  const healthScore = calculateNetworkHealthScore(data);
  const load = calculateNetworkLoad(data);
  const issues = [];

  if (healthScore < 0.5) {
    issues.push({
      type: 'health_score',
      details: 'Network health score is low'
    });
  }

  if (load.transaction_load > 0.8) {
    issues.push({
      type: 'high_load',
      details: 'Network is experiencing high load'
    });
  }

  if (load.node_load < 0.7) {
    issues.push({
      type: 'node_count',
      details: 'Active node count is below threshold'
    });
  }

  return issues.length > 0 ? issues : null;
}

// Network stats helpers
async function getEthereumNetworkStats() {
  const response = await fetch('https://api.etherscan.io/api?module=stats&action=ethsupply');
  return response.json();
}

async function getSolanaNetworkStats() {
  const response = await fetch('https://api.solscan.io/v1/network/stats');
  return response.json();
}

function normalizeVolume(volume: number) {
  return Math.log10(volume + 1) / 10; // Normalize to 0-1 range
}

function categorizeActivity(txCount: number, addresses: number, volume: number) {
  const score = (
    normalizeVolume(txCount) * 0.4 +
    normalizeVolume(addresses) * 0.3 +
    normalizeVolume(volume) * 0.3
  );

  if (score > 0.8) return 'very_high';
  if (score > 0.6) return 'high';
  if (score > 0.4) return 'medium';
  if (score > 0.2) return 'low';
  return 'very_low';
}

// Additional helper functions
function calculateHolderConcentrationRisk(data: any) {
  const holders = data.holders || [];
  const totalSupply = holders.reduce((sum: number, holder: any) => sum + holder.balance, 0);
  const top10Percentage = calculateTopHoldersPercentage(holders, totalSupply, 10);
  
  return {
    risk_level: assessConcentrationRisk(holders, totalSupply),
    top_10_percentage: top10Percentage,
    gini_coefficient: calculateGiniCoefficient(holders)
  };
}

function calculateVolumeVolatility(data: any) {
  const volumes = data.transactions?.map((tx: any) => tx.value) || [];
  if (volumes.length < 2) return 0;
  
  const returns = volumes.slice(1).map((vol: number, i: number) => 
    (vol - volumes[i]) / volumes[i]
  );
  
  return calculateVolatility(returns);
}

function assessSmartContractRisk(data: any) {
  // This would normally involve analyzing contract code and audit status
  // For now, return a placeholder risk assessment
  return {
    risk_level: 'medium',
    audit_status: 'unknown',
    code_quality: 'unknown'
  };
}

function calculateLiquidityRisk(data: any) {
  const volumes = data.transactions || [];
  const avgVolume = calculateAverageTransactionSize(volumes);
  const totalSupply = data.holders?.reduce((sum: number, holder: any) => sum + holder.balance, 0) || 0;
  
  return {
    risk_level: avgVolume / totalSupply < 0.001 ? 'high' : 'medium',
    volume_to_supply_ratio: avgVolume / totalSupply,
    liquidity_score: Math.min(avgVolume / totalSupply * 1000, 1)
  };
}

function calculateOverallRisk(data: any) {
  const concentrationRisk = calculateHolderConcentrationRisk(data);
  const volumeVolatility = calculateVolumeVolatility(data);
  const liquidityRisk = calculateLiquidityRisk(data);
  
  const riskScores = {
    concentration: concentrationRisk.gini_coefficient,
    volatility: volumeVolatility,
    liquidity: 1 - liquidityRisk.liquidity_score
  };
  
  const weights = {
    concentration: 0.4,
    volatility: 0.3,
    liquidity: 0.3
  };
  
  const overallScore = Object.entries(riskScores).reduce(
    (score, [key, value]) => score + value * weights[key as keyof typeof weights],
    0
  );
  
  return {
    risk_score: overallScore,
    risk_level: overallScore > 0.7 ? 'high' : overallScore > 0.4 ? 'medium' : 'low',
    risk_factors: riskScores
  };
}