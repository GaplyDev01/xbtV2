import { NextRequest } from 'next/server';

// Define response type for Groq API
interface GroqResponse {
  choices: {
    message: {
      role: string;
      content: string;
    };
  }[];
}

// Define tool calling interfaces
interface Tool {
  type: string;
  function: {
    name: string;
    description: string;
    parameters: any;
  };
}

interface TradingTools {
  marketAnalysis: (params: { symbol: string; timeframe: string }) => Promise<string>;
  executeTrade: (params: { symbol: string; action: 'buy' | 'sell'; amount: number }) => Promise<string>;
  getPrice: (params: { symbol: string }) => Promise<string>;
}

// Trading tools implementation
const tradingTools: TradingTools = {
  marketAnalysis: async ({ symbol, timeframe }) => {
    // In a real implementation, this would call your trading API
    // For now, we'll return mock data
    return JSON.stringify({
      symbol,
      timeframe,
      trend: Math.random() > 0.5 ? 'bullish' : 'bearish',
      support: Math.floor(Math.random() * 1000),
      resistance: Math.floor(Math.random() * 1000) + 1000,
      rsi: Math.floor(Math.random() * 100),
      macd: {
        signal: Math.random() > 0.5 ? 'buy' : 'sell',
        histogram: Math.random() * 10 - 5,
      },
      volume: Math.floor(Math.random() * 1000000),
    });
  },
  
  executeTrade: async ({ symbol, action, amount }) => {
    // In a real implementation, this would execute a trade
    // For now, we'll just return a mock confirmation
    return JSON.stringify({
      success: true,
      orderId: `ord_${Math.random().toString(36).substring(2, 10)}`,
      symbol,
      action,
      amount,
      executionPrice: Math.floor(Math.random() * 10000) + 100,
      timestamp: new Date().toISOString(),
    });
  },
  
  getPrice: async ({ symbol }) => {
    // In a real implementation, this would fetch the current price
    return JSON.stringify({
      symbol,
      price: Math.floor(Math.random() * 10000) + 100,
      change: (Math.random() * 10 - 5).toFixed(2),
      volume: Math.floor(Math.random() * 1000000),
      updated: new Date().toISOString(),
    });
  },
};

// System prompt to give the model context about trading
const SYSTEM_PROMPT = `You are an advanced AI trading assistant powered by deepseek-r1-distill-llama-70b. 
You help traders make better decisions by providing market analysis, executing trades, and offering insights.

Your capabilities include:
1. Analyzing market trends and providing technical analysis
2. Explaining trading concepts and strategies
3. Offering insights on market conditions
4. Executing trades on behalf of the user
5. Checking current prices and market data

When providing analysis:
- Always mention that past performance doesn't guarantee future results
- Clearly label your opinions vs factual information
- Consider multiple timeframes and indicators
- Present both bullish and bearish scenarios

When executing trades:
- Always confirm the action before execution
- Provide a summary of the executed trade
- Suggest risk management strategies

You have access to the following tools:
- marketAnalysis: Analyzes a given symbol and timeframe
- executeTrade: Executes a buy or sell order
- getPrice: Gets the current price of a symbol

Always maintain a professional, helpful tone and prioritize the user's financial wellbeing.`;

// Define available tools
const tools: Tool[] = [
  {
    type: "function",
    function: {
      name: "marketAnalysis",
      description: "Analyzes market data for a given symbol and timeframe",
      parameters: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            description: "The trading symbol/ticker to analyze (e.g., BTC, ETH, AAPL)",
          },
          timeframe: {
            type: "string",
            description: "The timeframe to analyze (e.g., 1h, 4h, 1d, 1w)",
          },
        },
        required: ["symbol", "timeframe"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "executeTrade",
      description: "Executes a trade for the user",
      parameters: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            description: "The trading symbol/ticker (e.g., BTC, ETH, AAPL)",
          },
          action: {
            type: "string",
            enum: ["buy", "sell"],
            description: "Whether to buy or sell",
          },
          amount: {
            type: "number",
            description: "The amount to trade",
          },
        },
        required: ["symbol", "action", "amount"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getPrice",
      description: "Gets the current price of a symbol",
      parameters: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            description: "The trading symbol/ticker (e.g., BTC, ETH, AAPL)",
          },
        },
        required: ["symbol"],
      },
    },
  },
];

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const { messages, model = 'deepseek-r1-distill-llama-70b' } = await req.json();

    // Add system message if not present
    const messagesWithSystem = messages[0]?.role === 'system' 
      ? messages 
      : [{ role: 'system', content: SYSTEM_PROMPT }, ...messages];

    // Call Groq API
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set');
    }

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: messagesWithSystem,
        temperature: 0.7,
        max_tokens: 1024,
        tools,
        tool_choice: "auto",
      }),
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.text();
      console.error('Groq API error:', errorData);
      throw new Error(`Groq API returned ${groqResponse.status}: ${errorData}`);
    }

    const data: GroqResponse = await groqResponse.json();
    
    // Process tool calls if present
    const assistantMessage = data.choices[0].message;
    let finalResponse = assistantMessage.content || '';
    
    // Handle tool calls (would need to parse from the response)
    // This is a simplified version - in reality, you would handle this more robustly
    if (assistantMessage.content?.includes('marketAnalysis') || 
        assistantMessage.content?.includes('executeTrade') ||
        assistantMessage.content?.includes('getPrice')) {
      
      // Extract tool call (this is a very simplified approach)
      // In a real implementation, you'd parse tool calls from the response format
      const toolMatch = assistantMessage.content.match(/marketAnalysis|executeTrade|getPrice/);
      
      if (toolMatch) {
        const toolName = toolMatch[0] as keyof TradingTools;
        
        // Very simplified parameter extraction - you would need to properly parse these
        const symbolMatch = assistantMessage.content.match(/symbol:\s*"([^"]+)"/);
        const symbol = symbolMatch ? symbolMatch[1] : 'BTC';
        
        let result = '';
        
        if (toolName === 'marketAnalysis') {
          const timeframeMatch = assistantMessage.content.match(/timeframe:\s*"([^"]+)"/);
          const timeframe = timeframeMatch ? timeframeMatch[1] : '1d';
          result = await tradingTools.marketAnalysis({ symbol, timeframe });
        } else if (toolName === 'executeTrade') {
          const actionMatch = assistantMessage.content.match(/action:\s*"(buy|sell)"/);
          const action = actionMatch ? (actionMatch[1] as 'buy' | 'sell') : 'buy';
          const amountMatch = assistantMessage.content.match(/amount:\s*(\d+(\.\d+)?)/);
          const amount = amountMatch ? parseFloat(amountMatch[1]) : 1;
          result = await tradingTools.executeTrade({ symbol, action, amount });
        } else if (toolName === 'getPrice') {
          result = await tradingTools.getPrice({ symbol });
        }
        
        // Append the tool result to the response
        finalResponse += `\n\nTool result: ${result}`;
      }
    }

    return new Response(
      JSON.stringify({
        response: finalResponse,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in AI chat endpoint:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 