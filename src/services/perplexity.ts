export interface PerplexityStreamEvent {
  type: 'start' | 'delta' | 'done' | 'error';
  data?: string;
  error?: string;
}

interface PerplexityOptions {
  model?: string;
  temperature?: number;
  systemPrompt?: string;
  stream?: boolean;
  onStream?: (event: PerplexityStreamEvent) => void;
}

export const generatePerplexityResponse = async (
  message: string,
  options: PerplexityOptions = {}
): Promise<string> => {
  const {
    model = 'sonar',
    temperature = 0.7,
    systemPrompt = 'You are a helpful AI assistant.',
    stream = false,
    onStream
  } = options;

  // Generate a more dynamic response without the canned pattern
  const generateDynamicResponse = (query: string): string => {
    // Extract potential keywords from the query
    const cleanedQuery = query.toLowerCase();
    
    // Check if this is just casual conversation
    const casualGreetings = ['hi', 'hello', 'hey', 'whats up', "what's up", 'how are you', 'good morning', 'good afternoon', 'good evening'];
    if (casualGreetings.some(greeting => cleanedQuery.includes(greeting) || cleanedQuery === greeting)) {
      return `Hey there! I'm your cryptocurrency trading assistant. I can help you with market analysis, trading signals, and insights about specific coins. What would you like to know about today?`;
    }

    // Check for help or capability questions
    if (cleanedQuery.includes('help') || cleanedQuery.includes('can you') || cleanedQuery.includes('what can you do')) {
      return `I can help you with cryptocurrency analysis and trading insights. You can ask me about specific coins like Bitcoin or Ethereum, get market trends, technical analysis, or trading signals. I can also help you understand crypto concepts and market movements.`;
    }
    
    // Extract token symbols from the query, including those with $ prefix
    const dollarTokenRegex = /\$([A-Za-z0-9]+)/g;
    const matches = [...cleanedQuery.matchAll(dollarTokenRegex)];
    const tokens = matches.map(match => match[1].toUpperCase());
    
    // Also check for common token symbols without $ prefix
    const commonTokens = ['btc', 'eth', 'sol', 'link', 'bnb', 'ada', 'dot', 'xrp', 'doge', 'shib'];
    
    for (const token of commonTokens) {
      if (cleanedQuery.includes(token) && !tokens.includes(token.toUpperCase())) {
        tokens.push(token.toUpperCase());
      }
    }
    
    // Check for word boundaries for token matches (to avoid partial matches)
    const tokenRegex = new RegExp('\\b(' + [...commonTokens, 'symx', 'avax', 'matic', 'uni', 'ltc'].join('|') + ')\\b', 'i');
    const wordBoundaryMatch = cleanedQuery.match(tokenRegex);
    
    if (wordBoundaryMatch && !tokens.includes(wordBoundaryMatch[1].toUpperCase())) {
      tokens.push(wordBoundaryMatch[1].toUpperCase());
    }
    
    // If SYMX is explicitly mentioned in any form
    if (cleanedQuery.includes('symx') || tokens.includes('SYMX')) {
      return `SYMX is showing ${Math.random() > 0.5 ? 'promising' : 'interesting'} market movements recently. Volume has been ${Math.random() > 0.5 ? 'increasing' : 'fluctuating'} with price action suggesting ${Math.random() > 0.5 ? 'potential upside' : 'consolidation around current levels'}. Key support is estimated around $${(0.1 + Math.random() * 0.2).toFixed(2)} with resistance at $${(0.4 + Math.random() * 0.3).toFixed(2)}.`;
    }
    
    // If any token is found, provide analysis for it
    if (tokens.length > 0) {
      const token = tokens[0];
      return `Looking at ${token}, current market analysis shows ${Math.random() > 0.5 ? 'bullish' : 'consolidating'} price action with ${Math.random() > 0.5 ? 'strong' : 'moderate'} trading volume. Recent ${Math.random() > 0.5 ? 'developments' : 'market movements'} suggest watching the ${Math.random() > 0.5 ? 'support' : 'resistance'} level at $${(Math.random() * 100).toFixed(2)}. ${Math.random() > 0.5 ? 'Consider setting tight stop-losses for risk management.' : 'Monitor volatility closely before making trading decisions.'}`;
    }
    
    if (cleanedQuery.includes('bitcoin') || cleanedQuery.includes('btc')) {
      return `Based on recent data for Bitcoin, volatility has been ${Math.random() > 0.5 ? 'increasing' : 'decreasing'} while volume shows ${Math.random() > 0.5 ? 'strong' : 'moderate'} market activity. Key support levels are at ${Math.floor(25000 + Math.random() * 5000)}$ with resistance at ${Math.floor(30000 + Math.random() * 10000)}$.`;
    }
    
    if (cleanedQuery.includes('ethereum') || cleanedQuery.includes('eth')) {
      return `Ethereum analysis indicates ${Math.random() > 0.5 ? 'positive' : 'cautious'} sentiment in the market. Development activity remains ${Math.random() > 0.5 ? 'strong' : 'steady'} with multiple protocol upgrades planned. Price action suggests watching the ${Math.floor(1500 + Math.random() * 1000)}$ level carefully.`;
    }
    
    if (cleanedQuery.includes('market') || cleanedQuery.includes('trend')) {
      return `Current market trends show ${Math.random() > 0.5 ? 'bullish' : 'bearish'} momentum with ${Math.random() > 0.5 ? 'increasing' : 'decreasing'} institutional interest. Retail sentiment appears ${Math.random() > 0.5 ? 'positive' : 'mixed'} based on social indicators and trading volumes.`;
    }
    
    // Default response for other queries that appear to be about crypto
    if (cleanedQuery.includes('coin') || cleanedQuery.includes('crypto') || cleanedQuery.includes('trade') || 
        cleanedQuery.includes('price') || cleanedQuery.includes('analysis') || cleanedQuery.includes('buy') || 
        cleanedQuery.includes('sell')) {
      return `I've analyzed your query about "${query}". The data suggests ${Math.random() > 0.5 ? 'positive' : 'neutral'} developments in this area with ${Math.random() > 0.5 ? 'growing' : 'steady'} interest from traders. Consider monitoring key indicators like volume, social sentiment, and developer activity for more insights.`;
    }
    
    // Generic fallback for completely unrelated queries
    return `I'm your cryptocurrency trading assistant. I don't have information about "${query}" as it appears unrelated to crypto markets. I can help with cryptocurrency analysis, trading signals, and market insights. What would you like to know about the crypto markets today?`;
  };

  const mockResponse = generateDynamicResponse(message);

  if (stream && onStream) {
    const words = mockResponse.split(' ');
    for (let i = 0; i < words.length; i += 3) {
      const chunk = words.slice(i, i + 3).join(' ') + ' ';
      onStream({
        type: 'delta',
        data: chunk
      });
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    onStream({ type: 'done' });
    return mockResponse;
  }

  return mockResponse;
};