// Dune Analytics API handler

// In production, this would come from environment variables
// Since this is for demonstration purposes, we'll store cached data
let cachedResults: any = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Cache for the new endpoints
let cachedQueryResults: Record<string, any> = {};
let lastFetchTimes: Record<string, number> = {};

/**
 * Fetch data from Dune Analytics API (or cached data if available)
 * In a production application, this would be done server-side to protect API keys
 */
export async function fetchDuneQueryResults() {
  try {
    const currentTime = Date.now();
    
    // Return cached results if they're still fresh
    if (cachedResults && (currentTime - lastFetchTime < CACHE_TTL)) {
      console.log('Using cached Dune Analytics data');
      return cachedResults;
    }
    
    // For demo purposes, this is normally where we would call the real API
    // Instead, we'll return mock data that matches the structure of the Dune API response
    console.log('Fetching fresh Dune Analytics data');
    
    // This is simulated data based on the Dune API response structure
    // In a real app, we would make an actual API call instead
    const mockData = {
      execution_id: "01234567-89ab-cdef-0123-456789abcdef",
      query_id: 3623384,
      state: "QUERY_STATE_COMPLETED",
      submitted_at: "2023-04-01T12:00:00.000Z",
      expires_at: "2023-04-08T12:00:00.000Z",
      execution_started_at: "2023-04-01T12:00:01.000Z",
      execution_ended_at: "2023-04-01T12:00:30.000Z",
      result: {
        rows: generateMockTokenData(100),
        metadata: {
          column_names: ["symbol", "name", "trade_volume", "traders_count", "trades_count", "rugcheck", "first_trade"],
          column_types: ["String", "String", "Number", "Number", "Number", "String", "DateTime"]
        },
        total_row_count: 730941,
        datapoint_count: 100,
        pending_results_size: 0
      }
    };
    
    // Cache the results
    cachedResults = mockData;
    lastFetchTime = currentTime;
    
    return mockData;
  } catch (error) {
    console.error("Error fetching Dune Analytics data:", error);
    throw error;
  }
}

/**
 * Generic function to fetch any Dune query by query ID
 * @param queryId - The Dune Analytics query ID to fetch
 */
export async function fetchDuneQueryById(queryId: string) {
  try {
    const currentTime = Date.now();
    
    // Return cached results if they're still fresh
    if (cachedQueryResults[queryId] && (currentTime - (lastFetchTimes[queryId] || 0) < CACHE_TTL)) {
      console.log(`Using cached Dune Analytics data for query ${queryId}`);
      return cachedQueryResults[queryId];
    }
    
    console.log(`Fetching fresh Dune Analytics data for query ${queryId}`);
    
    // In a real-world scenario, we would call the API like:
    // const response = await fetch(`https://api.dune.com/api/v1/query/${queryId}/results?limit=1000`, {
    //   headers: {
    //     'X-Dune-API-Key': process.env.DUNE_API_KEY
    //   }
    // });
    // const data = await response.json();
    
    // For this demo, we'll simulate a response
    const mockData = {
      execution_id: `exec-${queryId}-${Date.now()}`,
      query_id: parseInt(queryId),
      state: "QUERY_STATE_COMPLETED",
      submitted_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      execution_started_at: new Date().toISOString(),
      execution_ended_at: new Date().toISOString(),
      result: {
        rows: generateMockDataForQuery(queryId),
        metadata: {
          column_names: getColumnNamesForQuery(queryId),
          column_types: getColumnTypesForQuery(queryId)
        },
        total_row_count: 1000,
        datapoint_count: 100,
        pending_results_size: 0
      }
    };
    
    // Cache the results
    cachedQueryResults[queryId] = mockData;
    lastFetchTimes[queryId] = currentTime;
    
    return mockData;
  } catch (error) {
    console.error(`Error fetching Dune Analytics data for query ${queryId}:`, error);
    throw error;
  }
}

/**
 * Fetch results for query 4893631 - Trading activity analysis
 */
export async function fetchTradingActivity() {
  return fetchDuneQueryById('4893631');
}

/**
 * Fetch results for query 4894306 - Wallet analysis
 */
export async function fetchWalletAnalysis() {
  return fetchDuneQueryById('4894306');
}

/**
 * Fetch results for query 4124453 - Market trends
 */
export async function fetchMarketTrends() {
  return fetchDuneQueryById('4124453');
}

/**
 * Fetch results for query 4832613 - Token performance
 */
export async function fetchTokenPerformance() {
  return fetchDuneQueryById('4832613');
}

/**
 * Fetch results for query 4832245 - Trading volume
 */
export async function fetchTradingVolume() {
  return fetchDuneQueryById('4832245');
}

/**
 * Fetch results for query 4832844 - User engagement
 */
export async function fetchUserEngagement() {
  return fetchDuneQueryById('4832844');
}

/**
 * Helper function to get column names for a specific query
 */
function getColumnNamesForQuery(queryId: string): string[] {
  switch (queryId) {
    case '4893631': 
      return ["date", "transactions", "unique_traders", "volume_usd", "avg_trade_size"];
    case '4894306': 
      return ["wallet_address", "transaction_count", "volume_usd", "first_trade", "last_trade"];
    case '4124453': 
      return ["date", "price", "market_cap", "volume_24h", "change_percent"];
    case '4832613': 
      return ["token", "price_usd", "daily_change", "weekly_change", "monthly_change"];
    case '4832245': 
      return ["date", "dex", "volume_usd", "trades_count", "unique_users"];
    case '4832844': 
      return ["date", "active_users", "new_users", "retention_rate", "avg_session_duration"];
    default:
      return ["timestamp", "value", "metric", "category"];
  }
}

/**
 * Helper function to get column types for a specific query
 */
function getColumnTypesForQuery(queryId: string): string[] {
  switch (queryId) {
    case '4893631': 
      return ["DateTime", "Number", "Number", "Number", "Number"];
    case '4894306': 
      return ["String", "Number", "Number", "DateTime", "DateTime"];
    case '4124453': 
      return ["DateTime", "Number", "Number", "Number", "Number"];
    case '4832613': 
      return ["String", "Number", "Number", "Number", "Number"];
    case '4832245': 
      return ["DateTime", "String", "Number", "Number", "Number"];
    case '4832844': 
      return ["DateTime", "Number", "Number", "Number", "Number"];
    default:
      return ["DateTime", "Number", "String", "String"];
  }
}

/**
 * Generate mock data for a specific query
 */
function generateMockDataForQuery(queryId: string): any[] {
  const rows = [];
  const numRows = 100;
  
  switch (queryId) {
    case '4893631': {
      // Trading activity analysis
      for (let i = 0; i < numRows; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        rows.push({
          date: date.toISOString().split('T')[0],
          transactions: Math.floor(10000 + Math.random() * 15000),
          unique_traders: Math.floor(1500 + Math.random() * 3000),
          volume_usd: Math.floor(5000000 + Math.random() * 10000000),
          avg_trade_size: Math.floor(1000 + Math.random() * 5000)
        });
      }
      break;
    }
    case '4894306': {
      // Wallet analysis
      for (let i = 0; i < numRows; i++) {
        const firstTradeDate = new Date();
        firstTradeDate.setDate(firstTradeDate.getDate() - Math.floor(Math.random() * 365));
        
        const lastTradeDate = new Date();
        lastTradeDate.setDate(lastTradeDate.getDate() - Math.floor(Math.random() * 30));
        
        rows.push({
          wallet_address: `0x${Math.random().toString(16).substring(2, 42)}`,
          transaction_count: Math.floor(10 + Math.random() * 500),
          volume_usd: Math.floor(1000 + Math.random() * 1000000),
          first_trade: firstTradeDate.toISOString(),
          last_trade: lastTradeDate.toISOString()
        });
      }
      break;
    }
    case '4124453': {
      // Market trends
      for (let i = 0; i < numRows; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        rows.push({
          date: date.toISOString().split('T')[0],
          price: 100 + Math.random() * 50,
          market_cap: 50000000000 + Math.random() * 10000000000,
          volume_24h: 5000000000 + Math.random() * 1000000000,
          change_percent: -5 + Math.random() * 10
        });
      }
      break;
    }
    case '4832613': {
      // Token performance
      const tokens = ["SOL", "USDC", "ETH", "BONK", "JUP", "RAY", "SRM", "MNGO", "STEP", "ATLAS"];
      for (let i = 0; i < tokens.length * 10; i++) {
        const token = tokens[i % tokens.length];
        rows.push({
          token,
          price_usd: token === "USDC" ? 1 : 0.1 + Math.random() * 100,
          daily_change: -5 + Math.random() * 10,
          weekly_change: -15 + Math.random() * 30,
          monthly_change: -30 + Math.random() * 60
        });
      }
      break;
    }
    case '4832245': {
      // Trading volume
      const dexes = ["Jupiter", "Raydium", "Orca", "Serum", "Mango"];
      for (let i = 0; i < numRows; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i % 20);
        rows.push({
          date: date.toISOString().split('T')[0],
          dex: dexes[i % dexes.length],
          volume_usd: 5000000 + Math.random() * 10000000,
          trades_count: 50000 + Math.random() * 100000,
          unique_users: 5000 + Math.random() * 10000
        });
      }
      break;
    }
    case '4832844': {
      // User engagement
      for (let i = 0; i < numRows; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        rows.push({
          date: date.toISOString().split('T')[0],
          active_users: 10000 + Math.random() * 20000,
          new_users: 1000 + Math.random() * 5000,
          retention_rate: 0.5 + Math.random() * 0.4,
          avg_session_duration: 120 + Math.random() * 300
        });
      }
      break;
    }
    default: {
      // Default mock data
      for (let i = 0; i < numRows; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        rows.push({
          timestamp: date.toISOString(),
          value: Math.random() * 1000,
          metric: ["Users", "Revenue", "Transactions"][i % 3],
          category: ["A", "B", "C", "D"][i % 4]
        });
      }
    }
  }
  
  return rows;
}

/**
 * Generate mock token data for demonstration purposes
 */
function generateMockTokenData(count: number) {
  const tokens = [
    { symbol: "VONCE", name: "dj vonce", base_volume: 2060954.73, traders: 5668, trades: 23640 },
    { symbol: "PI", name: "Pi Network", base_volume: 2060320.34, traders: 2200, trades: 51122 },
    { symbol: "AVT", name: "Agent Voting Terminal", base_volume: 2060132.73, traders: 5294, trades: 32126 },
    { symbol: "BeLessDumb", name: "BeLessDumb Elons new character", base_volume: 2055104.26, traders: 7870, trades: 34610 },
    { symbol: "WOLFDOG", name: "Cadabomb Okami", base_volume: 2051880.07, traders: 1210, trades: 64547 },
    { symbol: "Boobs", name: "Boobs in Book", base_volume: 2051258.91, traders: 5335, trades: 27139 },
    { symbol: "GROK3", name: "GROK3", base_volume: 2044636.72, traders: 1863, trades: 7325 },
    { symbol: "SALTY", name: "Rosa DeLauro", base_volume: 2044233.89, traders: 5878, trades: 31898 },
    { symbol: "COUPLABEER", name: "CouplaBeers", base_volume: 2041504.22, traders: 5157, trades: 23778 },
    { symbol: "SS", name: "SUNDAY SERVICE", base_volume: 2040437.45, traders: 5185, trades: 29527 },
    { symbol: "MOON", name: "Moon", base_volume: 2039909.83, traders: 24, trades: 194 },
    { symbol: "ROACHIE", name: "dancing roach on tiktok", base_volume: 2039869.48, traders: 4938, trades: 31982 },
    { symbol: "WORD", name: "WORDORA", base_volume: 2035799.17, traders: 5830, trades: 19721 },
    { symbol: "YZY Coin", name: "Official Yeezy Coin", base_volume: 2033869.71, traders: 149, trades: 1073 },
    { symbol: "dougi", name: "dougi", base_volume: 2033855.30, traders: 6129, trades: 16289 },
  ];
  
  const results = [];
  
  // Generate the requested number of token records
  for (let i = 0; i < count; i++) {
    // Cycle through our token templates
    const template = tokens[i % tokens.length];
    
    // Add some randomization to the values
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
    
    // Create a date in the past
    const daysAgo = Math.floor(Math.random() * 100);
    const firstTradeDate = new Date();
    firstTradeDate.setDate(firstTradeDate.getDate() - daysAgo);
    
    results.push({
      symbol: template.symbol,
      name: template.name,
      trade_volume: (template.base_volume * randomFactor).toFixed(2),
      traders_count: Math.floor(template.traders * randomFactor),
      trades_count: Math.floor(template.trades * randomFactor),
      rugcheck: Math.random() > 0.2 ? "true" : "false", // 80% are "true"
      first_trade: firstTradeDate.toISOString()
    });
  }
  
  return results;
} 