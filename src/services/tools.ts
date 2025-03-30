import { GroqToolDefinition } from '../types/chat';
import * as cryptoApi from './cryptoApi';

// Declaring WebSocket class type for environments that may not have it
interface WebSocketInterface extends EventTarget {
  close(code?: number, reason?: string): void;
  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void;
}

// WebSocketManager - Singleton for managing websocket connections
export class WebSocketManager {
  private static instance: WebSocketManager;
  private sockets: Map<string, WebSocket>;
  private messageCallbacks: Map<string, ((data: Record<string, unknown>) => void)[]>;
  private connectionStatus: Map<string, boolean>;
  
  private constructor() {
    this.sockets = new Map();
    this.messageCallbacks = new Map();
    this.connectionStatus = new Map();
  }
  
  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }
  
  public async connectToExchange(exchange: string): Promise<{ success: boolean; message: string }> {
    if (this.isConnected(exchange)) {
      return { success: true, message: `Already connected to ${exchange}` };
    }
    
    try {
      let endpoint = '';
      
      // Determine websocket endpoint based on exchange
      switch (exchange.toLowerCase()) {
        case 'binance':
          endpoint = 'wss://stream.binance.com:9443/ws/btcusdt@trade';
          break;
        case 'coinbase':
          endpoint = 'wss://ws-feed.exchange.coinbase.com';
          break;
        case 'kraken':
          endpoint = 'wss://ws.kraken.com';
          break;
        default:
          return { success: false, message: `Unsupported exchange: ${exchange}` };
      }
      
      console.log(`Connecting to ${exchange} WebSocket: ${endpoint}`);
      
      const socket = new WebSocket(endpoint);
      
      return new Promise((resolve) => {
        // Setup event handlers
        socket.onopen = () => {
          console.log(`Connected to ${exchange} WebSocket`);
          this.sockets.set(exchange, socket);
          this.connectionStatus.set(exchange, true);
          
          // Send subscription message based on exchange
          if (exchange.toLowerCase() === 'coinbase') {
            socket.send(JSON.stringify({
              type: 'subscribe',
              product_ids: ['BTC-USD'],
              channels: ['ticker']
            }));
          } else if (exchange.toLowerCase() === 'kraken') {
            socket.send(JSON.stringify({
              name: 'subscribe',
              reqid: 1,
              pair: ['XBT/USD'],
              subscription: {
                name: 'ticker'
              }
            }));
          }
          
          resolve({ success: true, message: `Successfully connected to ${exchange}` });
        };
        
        socket.onclose = () => {
          console.log(`Disconnected from ${exchange}`);
          this.connectionStatus.set(exchange, false);
          this.sockets.delete(exchange);
        };
        
        socket.onerror = (error) => {
          console.error(`WebSocket error with ${exchange}:`, error);
          this.connectionStatus.set(exchange, false);
          resolve({ success: false, message: `Error connecting to ${exchange}: ${error}` });
        };
        
        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as Record<string, unknown>;
            const callbacks = this.messageCallbacks.get(exchange) || [];
            callbacks.forEach(callback => callback(data));
          } catch (error) {
            console.error(`Error parsing message from ${exchange}:`, error);
          }
        };
        
        // Set timeout for connection
        setTimeout(() => {
          if (!this.isConnected(exchange)) {
            socket.close();
            resolve({ 
              success: false, 
              message: `Connection to ${exchange} timed out`
            });
          }
        }, 10000);
      });
    } catch (error) {
      console.error(`Error connecting to ${exchange}:`, error);
      return { 
        success: false, 
        message: `Error connecting to ${exchange}: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
  
  public disconnect(exchange: string): boolean {
    const socket = this.sockets.get(exchange);
    if (socket) {
      socket.close();
      this.sockets.delete(exchange);
      this.connectionStatus.set(exchange, false);
      return true;
    }
    return false;
  }
  
  public disconnectAll(): void {
    this.sockets.forEach((socket, exchange) => {
      socket.close();
      this.sockets.delete(exchange);
      this.connectionStatus.set(exchange, false);
    });
  }
  
  public isConnected(exchange: string): boolean {
    return this.connectionStatus.get(exchange) === true;
  }
  
  public registerCallback(
    exchange: string, 
    callback: (data: Record<string, unknown>) => void
  ): boolean {
    if (!this.isConnected(exchange)) {
      return false;
    }
    
    const callbacks = this.messageCallbacks.get(exchange) || [];
    callbacks.push(callback);
    this.messageCallbacks.set(exchange, callbacks);
    return true;
  }
  
  public unregisterCallback(
    exchange: string, 
    callback: (data: Record<string, unknown>) => void
  ): boolean {
    if (!this.messageCallbacks.has(exchange)) {
      return false;
    }
    
    const callbacks = this.messageCallbacks.get(exchange) || [];
    const index = callbacks.indexOf(callback);
    
    if (index !== -1) {
      callbacks.splice(index, 1);
      this.messageCallbacks.set(exchange, callbacks);
      return true;
    }
    
    return false;
  }
}

// Function to get crypto price data - enhanced to use WebSocketManager if available
export const getCryptoPriceData = async (symbol: string): Promise<string> => {
  try {
    console.log(`Getting price data for ${symbol}...`);
    
    // Use WebSocketManager for real-time data if possible
    const wsManager = WebSocketManager.getInstance();
    const exchange = 'binance'; // Default exchange
    
    if (!wsManager.isConnected(exchange)) {
      try {
        const connectionResult = await wsManager.connectToExchange(exchange);
        if (!connectionResult.success) {
          console.log(`Couldn't connect to WebSocket: ${connectionResult.message}`);
          // Fall back to REST API if WebSocket connection fails
          return await getCryptoPriceDataFromAPI(symbol);
        }
      } catch (error) {
        console.error('Error connecting to WebSocket:', error);
        return await getCryptoPriceDataFromAPI(symbol);
      }
    }
    
    // If connected to WebSocket, get real-time data
    return new Promise((resolve) => {
      let hasReturned = false;
      
      // Register a one-time callback to get the price
      const callback = (data: Record<string, unknown>) => {
        if (hasReturned) return; // Prevent multiple resolutions
        
        try {
          // Process data based on exchange format (Binance in this case)
          if ('p' in data) { // Binance format
            const price = Number(data.p);
            if (!isNaN(price)) {
              const result = JSON.stringify({
                symbol: symbol.toUpperCase(),
                price: price,
                source: 'realtime',
                timestamp: new Date().toISOString()
              });
              hasReturned = true;
              wsManager.unregisterCallback(exchange, callback);
              resolve(result);
            }
          }
        } catch (error) {
          console.error('Error processing WebSocket data:', error);
        }
      };
      
      wsManager.registerCallback(exchange, callback);
      
      // Set timeout to fall back to REST API if no data received
      setTimeout(() => {
        if (!hasReturned) {
          wsManager.unregisterCallback(exchange, callback);
          getCryptoPriceDataFromAPI(symbol).then(resolve);
        }
      }, 5000);
    });
  } catch (error) {
    console.error('Error in getCryptoPriceData:', error);
    return await getCryptoPriceDataFromAPI(symbol);
  }
};

// Fallback function to get crypto price data from REST API
async function getCryptoPriceDataFromAPI(symbol: string): Promise<string> {
  try {
    const apiKey = import.meta.env.VITE_COINGECKO_API_KEY;
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true${apiKey ? `&x_cg_pro_api_key=${apiKey}` : ''}`
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const tokenId = symbol.toLowerCase();
    
    if (!data[tokenId]) {
      // Try with a simple mapping for common tokens
      const tokenMap: Record<string, string> = {
        'btc': 'bitcoin',
        'eth': 'ethereum',
        'sol': 'solana',
        'symx': 'symbiosis-finance'
      };
      
      const mappedId = tokenMap[tokenId];
      if (mappedId) {
        const mappedResponse = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${mappedId}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true${apiKey ? `&x_cg_pro_api_key=${apiKey}` : ''}`
        );
        
        if (mappedResponse.ok) {
          const mappedData = await mappedResponse.json();
          if (mappedData[mappedId]) {
            return JSON.stringify({
              symbol: symbol.toUpperCase(),
              price: mappedData[mappedId].usd,
              market_cap: mappedData[mappedId].usd_market_cap,
              volume_24h: mappedData[mappedId].usd_24h_vol,
              change_24h: mappedData[mappedId].usd_24h_change,
              source: 'coingecko'
            });
          }
        }
      }
      
      return JSON.stringify({
        symbol: symbol.toUpperCase(),
        error: `Price data not found for ${symbol}`,
        source: 'none'
      });
    }
    
    return JSON.stringify({
      symbol: symbol.toUpperCase(),
      price: data[tokenId].usd,
      market_cap: data[tokenId].usd_market_cap,
      volume_24h: data[tokenId].usd_24h_vol,
      change_24h: data[tokenId].usd_24h_change,
      source: 'coingecko'
    });
  } catch (error) {
    console.error('Error fetching crypto price data:', error);
    
    // Return an error message
    return JSON.stringify({
      symbol: symbol.toUpperCase(),
      error: `Could not fetch price data: ${error instanceof Error ? error.message : String(error)}`,
      source: 'error'
    });
  }
}

// Define the CoinGecko tools
export const coinGeckoTools: GroqToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'getCoinPrice',
      description: 'Get the current price and basic market data for a cryptocurrency',
      parameters: {
        type: 'object',
        properties: {
          coinId: {
            type: 'string',
            description: 'The CoinGecko ID of the cryptocurrency (e.g., bitcoin, ethereum, solana)'
          },
          currency: {
            type: 'string',
            description: 'The currency to display prices in (default: usd)',
            enum: ['usd', 'eur', 'gbp', 'jpy', 'aud', 'cad']
          }
        },
        required: ['coinId']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getMarketData',
      description: 'Get market data for multiple cryptocurrencies',
      parameters: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Number of results to return (default: 10, max: 100)'
          },
          currency: {
            type: 'string',
            description: 'The currency to display prices in (default: usd)',
            enum: ['usd', 'eur', 'gbp', 'jpy', 'aud', 'cad']
          },
          order: {
            type: 'string',
            description: 'Sort order',
            enum: ['market_cap_desc', 'market_cap_asc', 'volume_desc', 'volume_asc']
          }
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'searchCoins',
      description: 'Search for cryptocurrencies by name or symbol',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query (e.g., bitcoin, eth, sol)'
          }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getCoinDetails',
      description: 'Get detailed information about a specific cryptocurrency',
      parameters: {
        type: 'object',
        properties: {
          coinId: {
            type: 'string',
            description: 'The CoinGecko ID of the cryptocurrency (e.g., bitcoin, ethereum, solana)'
          }
        },
        required: ['coinId']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getHistoricalData',
      description: 'Get historical price and market data for a cryptocurrency',
      parameters: {
        type: 'object',
        properties: {
          coinId: {
            type: 'string',
            description: 'The CoinGecko ID of the cryptocurrency (e.g., bitcoin, ethereum, solana)'
          },
          days: {
            type: 'number',
            description: 'Number of days of data to return (1, 7, 14, 30, 90, 180, 365, max)'
          },
          interval: {
            type: 'string',
            description: 'Data interval',
            enum: ['daily', 'hourly']
          }
        },
        required: ['coinId', 'days']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getTrendingCoins',
      description: 'Get trending cryptocurrencies',
      parameters: {
        type: 'object',
        properties: {}
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getTopGainersLosers',
      description: 'Get top gaining and losing cryptocurrencies',
      parameters: {
        type: 'object',
        properties: {
          timeframe: {
            type: 'string',
            description: 'Timeframe for calculation',
            enum: ['1h', '24h', '7d', '14d', '30d', '200d', '1y']
          },
          limit: {
            type: 'number',
            description: 'Number of results to return (default: 10)'
          }
        }
      }
    }
  }
];

// Web browsing and research tools
export const browserTools: GroqToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'searchWeb',
      description: 'Search the web for information on cryptocurrencies, markets, or trading',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query'
          }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'fetchWebpage',
      description: 'Fetch and extract content from a specific webpage',
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'URL of the webpage to fetch'
          }
        },
        required: ['url']
      }
    }
  }
];

// Technical analysis tools
export const analysisTools: GroqToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'analyzeTrend',
      description: 'Analyze price trend and provide technical analysis',
      parameters: {
        type: 'object',
        properties: {
          coinId: {
            type: 'string',
            description: 'The CoinGecko ID of the cryptocurrency'
          },
          timeframe: {
            type: 'string',
            description: 'Timeframe for analysis',
            enum: ['24h', '7d', '30d', '90d']
          }
        },
        required: ['coinId', 'timeframe']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'generateTradingSignal',
      description: 'Generate a trading signal (buy, sell, hold) with confidence level',
      parameters: {
        type: 'object',
        properties: {
          coinId: {
            type: 'string',
            description: 'The CoinGecko ID of the cryptocurrency'
          }
        },
        required: ['coinId']
      }
    }
  }
];

// New WebSocket tools for real-time token data
export const websocketTools: GroqToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'connectDexWebsocket',
      description: 'Connects to a decentralized exchange websocket for real-time token data',
      parameters: {
        type: 'object',
        properties: {
          exchange: {
            type: 'string',
            description: 'The exchange to connect to (uniswap, pancakeswap, sushiswap, solana-dex, bitquery)'
          },
          tokenAddress: {
            type: 'string',
            description: 'The token contract address to monitor'
          },
          chainId: {
            type: 'string',
            description: 'The blockchain chain ID (1 for Ethereum, 56 for BSC, solana for Solana)'
          },
          customEndpoint: {
            type: 'string',
            description: 'Optional custom websocket endpoint'
          }
        },
        required: ['exchange', 'tokenAddress']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'getTokenLiveData',
      description: 'Gets real-time data for a token from an active websocket connection',
      parameters: {
        type: 'object',
        properties: {
          connectionId: {
            type: 'string',
            description: 'The ID of the active websocket connection'
          },
          dataType: {
            type: 'string',
            description: 'Type of data to retrieve (price, liquidity, trades)'
          }
        },
        required: ['connectionId', 'dataType']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'disconnectWebsocket',
      description: 'Disconnects an active websocket connection',
      parameters: {
        type: 'object',
        properties: {
          connectionId: {
            type: 'string',
            description: 'The ID of the active websocket connection to disconnect'
          }
        },
        required: ['connectionId']
      }
    }
  }
];

// Combine all tools
export const allTools: GroqToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'get_crypto_price',
      description: 'Get the current price and market data for a cryptocurrency',
      parameters: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'The cryptocurrency symbol, e.g., BTC, ETH, SOL, etc.'
          }
        },
        required: ['symbol']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'analyze_token',
      description: 'Get detailed analysis of a cryptocurrency token including price, volume, and market cap',
      parameters: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'The cryptocurrency symbol, e.g., BTC, ETH, SOL, etc.'
          }
        },
        required: ['symbol']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_trading_volume',
      description: 'Get 24h trading volume for a cryptocurrency token',
      parameters: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'The cryptocurrency symbol, e.g., BTC, ETH, SOL, etc.'
          }
        },
        required: ['symbol']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_historical_prices',
      description: 'Get historical price data for a cryptocurrency token over a time period',
      parameters: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'The cryptocurrency symbol, e.g., BTC, ETH, SOL, etc.'
          },
          days: {
            type: 'number',
            description: 'Number of days of historical data to retrieve (1-365)'
          }
        },
        required: ['symbol']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_crypto_news',
      description: 'Get latest news for a cryptocurrency or the market in general',
      parameters: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'The cryptocurrency symbol, e.g., BTC, ETH, SOL, etc. Use "crypto" for general market news.'
          },
          limit: {
            type: 'number',
            description: 'Number of news items to retrieve (1-10)'
          }
        },
        required: ['symbol']
      }
    }
  }
];

// Tool implementation functions
export const implementTool = async (
  toolName: string, 
  args: Record<string, unknown>
): Promise<string> => {
  try {
    switch (toolName) {
      case 'getCoinPrice': {
        const { coinId, currency = 'usd' } = args as { coinId: string; currency?: string };
        const data = await cryptoApi.getCoinsMarketData(currency, [coinId]);
        return JSON.stringify(data[0] || { error: 'Coin not found' });
      }
      
      case 'getMarketData': {
        const { limit = 10, currency = 'usd', order = 'market_cap_desc' } = args as { 
          limit?: number; 
          currency?: string; 
          order?: string 
        };
        const data = await cryptoApi.getCoinsMarketData(
          currency,
          undefined,
          order,
          typeof limit === 'number' ? limit : parseInt(String(limit), 10)
        );
        return JSON.stringify(data);
      }
      
      case 'searchCoins': {
        const { query } = args as { query: string };
        const data = await cryptoApi.searchCrypto(query);
        return JSON.stringify(data.coins.slice(0, 10));
      }
      
      case 'getCoinDetails': {
        const { coinId } = args as { coinId: string };
        const data = await cryptoApi.getCoinDetails(coinId);
        return JSON.stringify({
          id: data.id,
          name: data.name,
          symbol: data.symbol,
          description: data.description?.en,
          image: data.image?.large,
          market_data: {
            current_price: data.market_data?.current_price,
            market_cap: data.market_data?.market_cap,
            total_volume: data.market_data?.total_volume,
            price_change_percentage_24h: data.market_data?.price_change_percentage_24h,
            price_change_percentage_7d: data.market_data?.price_change_percentage_7d,
            price_change_percentage_30d: data.market_data?.price_change_percentage_30d
          },
          categories: data.categories,
          last_updated: data.last_updated
        });
      }
      
      case 'getHistoricalData': {
        const { coinId, days, interval = 'daily' } = args as { 
          coinId: string; 
          days: number | string; 
          interval?: string 
        };
        const daysValue = typeof days === 'number' ? days : parseInt(String(days), 10);
        const data = await cryptoApi.getHistoricalMarketData(
          coinId, 
          daysValue, 
          interval === 'hourly' ? '1h' : 'daily'
        );
        return JSON.stringify(data);
      }
      
      case 'getTrendingCoins': {
        const data = await cryptoApi.getTrendingCoins();
        return JSON.stringify(data);
      }
      
      case 'getTopGainersLosers': {
        const { timeframe = '24h', limit = 10 } = args as { 
          timeframe?: string; 
          limit?: number 
        };
        const limitValue = typeof limit === 'number' ? limit : parseInt(String(limit), 10);
        const data = await cryptoApi.getTopGainersLosers('usd', timeframe, limitValue);
        return JSON.stringify(data);
      }
      
      case 'searchWeb': {
        const { query } = args as { query: string };
        return JSON.stringify({
          results: [
            { title: "Web search results for: " + query, 
              content: "For up-to-date information, please check financial news sites or cryptocurrency exchanges." }
          ],
          message: "Web search functionality requires browser integration. The assistant will simulate search results for now."
        });
      }
      
      case 'fetchWebpage': {
        const { url } = args as { url: string };
        return JSON.stringify({
          title: "Content from: " + url,
          content: "Webpage content extraction requires browser integration. The assistant will provide relevant information based on its training data.",
          url: url
        });
      }
      
      case 'analyzeTrend': {
        const { coinId, timeframe } = args as { coinId: string; timeframe: string };
        // Get historical data to analyze trend
        const data = await cryptoApi.getHistoricalMarketData(coinId, 
          timeframe === '24h' ? 1 : 
          timeframe === '7d' ? 7 : 
          timeframe === '30d' ? 30 : 90
        );
        
        // Get current data
        const currentData = await cryptoApi.getCoinsMarketData('usd', [coinId]);
        
        if (!data || !currentData || !currentData.length) {
          return JSON.stringify({ error: 'Could not retrieve data for analysis' });
        }
        
        const priceData = data.prices || [];
        
        // Calculate basic trend indicators
        const firstPrice = priceData[0]?.[1] || 0;
        const lastPrice = priceData[priceData.length - 1]?.[1] || 0;
        const percentChange = ((lastPrice - firstPrice) / firstPrice) * 100;
        
        // Determine trend direction
        let trend = 'neutral';
        if (percentChange > 5) trend = 'bullish';
        if (percentChange < -5) trend = 'bearish';
        
        // Calculate simple moving averages if enough data
        let sma7 = null, sma30 = null;
        if (priceData.length >= 7) {
          const last7 = priceData.slice(-7);
          sma7 = last7.reduce((sum: number, item: [number, number]) => sum + item[1], 0) / 7;
        }
        
        if (priceData.length >= 30) {
          const last30 = priceData.slice(-30);
          sma30 = last30.reduce((sum: number, item: [number, number]) => sum + item[1], 0) / 30;
        }
        
        return JSON.stringify({
          coin: coinId,
          timeframe,
          trend,
          percentChange,
          currentPrice: currentData[0]?.current_price,
          sma7,
          sma30,
          volumeChange: currentData[0]?.total_volume,
        });
      }
      
      case 'generateTradingSignal': {
        const { coinId } = args as { coinId: string };
        // Get market data
        const data = await cryptoApi.getCoinsMarketData('usd', [coinId]);
        
        if (!data || !data.length) {
          return JSON.stringify({ error: 'Could not retrieve data for trading signal' });
        }
        
        const coin = data[0];
        
        // Very basic signal generation (for demonstration)
        // A real implementation would use much more sophisticated analysis
        let signal = 'HOLD';
        let confidence = 0.5;
        
        // Simple logic based on 24h change
        if (coin.price_change_percentage_24h > 5) {
          signal = 'SELL'; // Potential overbought condition
          confidence = 0.6 + (Math.min(coin.price_change_percentage_24h, 20) / 100);
        } else if (coin.price_change_percentage_24h < -5) {
          signal = 'BUY'; // Potential oversold condition
          confidence = 0.6 + (Math.min(Math.abs(coin.price_change_percentage_24h), 20) / 100);
        }
        
        return JSON.stringify({
          coin: coinId,
          signal,
          confidence: Math.min(confidence, 0.9), // Cap at 90% confidence
          price: coin.current_price,
          change24h: coin.price_change_percentage_24h,
          marketCap: coin.market_cap,
          warning: "This is a simplified trading signal for demonstration. Always perform your own analysis and consider risk factors."
        });
      }
      
      case 'connectDexWebsocket': {
        const { exchange, tokenAddress, chainId = '1', customEndpoint } = args as { 
          exchange: string; 
          tokenAddress: string; 
          chainId?: string;
          customEndpoint?: string;
        };
        
        // Generate a unique connection ID
        const connectionId = `${exchange}_${tokenAddress}_${Date.now()}`;
        
        // Determine the websocket endpoint based on the exchange
        let endpoint = '';
        let initialMessages: Array<string | object> = [];
        
        // If custom endpoint is provided, use it
        if (customEndpoint) {
          endpoint = customEndpoint;
        } else {
          switch (exchange.toLowerCase()) {
            case 'uniswap':
              endpoint = `wss://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3`;
              break;
            case 'pancakeswap':
              endpoint = `wss://api.thegraph.com/subgraphs/name/pancakeswap/exchange-v3`;
              break;
            case 'sushiswap':
              endpoint = `wss://api.thegraph.com/subgraphs/name/sushi-v3/v3-ethereum`;
              break;
            case 'bitquery':
            case 'solana-dex':
              endpoint = 'wss://streaming.bitquery.io/eap?token=ory_at_moed5ePDVd0gxhL8rHfH7C4yo__Kx5C3DA6LLuy8ASo.vB2ufAUK31-PNo0wFsswLutqwCEvRRuIdcRXmbwzw1w';
              initialMessages = [
                { type: "connection_init" },
                {
                  type: "subscribe",
                  payload: {
                    query: `subscription TokenTrades { 
                      Solana { 
                        DEXTrades(
                          where: { 
                            Trade: { 
                              Dex: { ProtocolName: { is: "pump" } } 
                            }
                            Transaction: { Result: { Success: true } } 
                          }
                        ) { 
                          Instruction { Program { Method } } 
                          Trade { 
                            Dex { ProtocolFamily ProtocolName } 
                            Buy { 
                              Amount 
                              Account { Address } 
                              Currency { Name Symbol MintAddress Decimals Fungible Uri } 
                            } 
                            Sell { 
                              Amount 
                              Account { Address } 
                              Currency { Name Symbol MintAddress Decimals Fungible Uri } 
                            } 
                          } 
                          Transaction { Signature } 
                        } 
                      } 
                    }`
                  }
                }
              ];
              break;
            default:
              return JSON.stringify({ 
                error: `Exchange ${exchange} not supported`,
                supported: ['uniswap', 'pancakeswap', 'sushiswap', 'solana-dex', 'bitquery']
              });
          }
        }
        
        // In a production environment, we would use this code:
        /*
        try {
          const wsManager = WebSocketManager.getInstance();
          const connected = await wsManager.connect(endpoint, connectionId, initialMessages);
          
          if (connected) {
            return JSON.stringify({
              success: true,
              connectionId: connectionId,
              message: `Connected to ${exchange} websocket for token ${tokenAddress} on chain ${chainId}`,
              endpoint: endpoint
            });
          } else {
            return JSON.stringify({
              success: false,
              message: `Failed to connect to ${exchange} websocket`
            });
          }
        } catch (error) {
          return JSON.stringify({
            success: false,
            message: `Error connecting to ${exchange} websocket: ${error instanceof Error ? error.message : String(error)}`
          });
        }
        */
        
        // For now, simulate a successful connection
        const connected = true; // Mock success
        
        return JSON.stringify({
          success: connected,
          connectionId: connectionId,
          message: `Connected to ${exchange} websocket for token ${tokenAddress} on chain ${chainId}`,
          note: "This is a simulated connection. In a production environment, this would establish a real websocket connection.",
          endpoint: endpoint, // Include the endpoint for reference
          initialMessagesCount: initialMessages.length // Reference the initialMessages without directly using them
        });
      }
      
      case 'getTokenLiveData': {
        // We only use the connectionId for reference but it's not actively used in the mock
        // dataType would be used in a real implementation to filter the data type
        const { connectionId, dataType } = args as { connectionId: string; dataType: string };
        
        // In a real implementation, we would get data from the active websocket
        // For now, return simulated data
        
        const simulatedData = {
          connectionId, // Include in response for reference
          dataType, // Include in response for reference
          timestamp: new Date().toISOString(),
          tokenData: {
            price: `$${(0.1 + Math.random() * 1).toFixed(6)}`,
            priceChange: `${(Math.random() * 10 - 5).toFixed(2)}%`,
            liquidity: `$${(10000 + Math.random() * 50000).toFixed(2)}`,
            volume24h: `$${(5000 + Math.random() * 20000).toFixed(2)}`,
            marketCap: `$${(100000 + Math.random() * 500000).toFixed(2)}`,
            holders: Math.floor(100 + Math.random() * 1000)
          },
          recentTrades: [
            {
              type: Math.random() > 0.5 ? 'buy' : 'sell',
              amount: `${(100 + Math.random() * 1000).toFixed(2)}`,
              price: `$${(0.1 + Math.random() * 1).toFixed(6)}`,
              time: '30 seconds ago'
            },
            {
              type: Math.random() > 0.5 ? 'buy' : 'sell',
              amount: `${(100 + Math.random() * 1000).toFixed(2)}`,
              price: `$${(0.1 + Math.random() * 1).toFixed(6)}`,
              time: '2 minutes ago'
            }
          ],
          note: "This is simulated data. In a production environment, this would return real-time data from the websocket connection."
        };
        
        return JSON.stringify(simulatedData);
      }
      
      case 'disconnectWebsocket': {
        const { connectionId } = args as { connectionId: string };
        
        // In a real implementation, we would disconnect the websocket
        // For now, simulate successful disconnection
        
        // In a production implementation, use:
        // WebSocketManager.getInstance().disconnect(connectionId);
        
        return JSON.stringify({
          success: true,
          message: `Disconnected websocket connection: ${connectionId}`,
          note: "This is a simulated disconnection. In a production environment, this would close a real websocket connection."
        });
      }
      
      default:
        return JSON.stringify({ error: `Tool "${toolName}" not implemented or recognized` });
    }
  } catch (error) {
    console.error(`Error executing tool ${toolName}:`, error);
    return JSON.stringify({ 
      error: `Failed to execute tool "${toolName}"`,
      message: error instanceof Error ? error.message : String(error)
    });
  }
}; 