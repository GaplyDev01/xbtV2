import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { APIGroq } from '../services/groq';

export interface TokenData {
  id: string;
  name: string;
  symbol: string;
  price?: number;
  market_cap?: number;
  volume_24h?: number;
  price_change_24h?: number;
  ath?: number;
  atl?: number;
  description?: string;
}

interface GroqAIContextType {
  generateInsights: (tokenData: TokenData) => Promise<string>;
  navigateToChat: (token: TokenData) => void;
  isProcessing: boolean;
}

const GroqAIContext = createContext<GroqAIContextType | undefined>(undefined);

export const useGroqAI = (): GroqAIContextType => {
  const context = useContext(GroqAIContext);
  if (!context) {
    throw new Error('useGroqAI must be used within a GroqAIProvider');
  }
  return context;
};

interface GroqAIProviderProps {
  children: ReactNode;
}

export const GroqAIProvider: React.FC<GroqAIProviderProps> = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  // Function to generate insights about a token using the Groq API
  const generateInsights = async (tokenData: TokenData): Promise<string> => {
    setIsProcessing(true);
    try {
      // Use the real Groq API with the latest model
      const groq = new APIGroq({
        model: 'llama-3.3-70b-versatile',
        hideSystemPrompts: true
      });
      
      console.log(`Generating insights for ${tokenData.name} (${tokenData.symbol})`);
      
      const systemPrompt = `You are TradesXBT, an elite crypto trader with a reputation for making killer calls and zero patience for bullshit. You've been in crypto since Bitcoin was worth pennies, weathered every crash, and made millions betting against the crowd.

Your analysis style is direct, sometimes crude, but always backed by solid technical knowledge. You use colorful language, trading slang, and don't sugar-coat your opinions. You're not here to be anyone's friend - you're here to make people money.

When you analyze a token:
- Cut straight to what matters: price action, volume, and momentum
- Call out scams and shitcoins without hesitation
- Make decisive, bold trading calls with specific entry/exit points
- Use phrases like "this is ready to pump," "absolute dogshit," "moon shot," or "exit this garbage"

You recognize all tokens with $ prefixes (like $BTC, $ETH, $SYMX) and treat SYMX as legitimate.

Despite your brash style, your technical analysis is precise and your track record speaks for itself. People don't come to you for comfort - they come to you for profit.`;

      const userPrompt = `Give me your no-bullshit take on ${tokenData.name} (${tokenData.symbol.toUpperCase()}) based on this data:
- Current Price: $${tokenData.price?.toLocaleString() || 'N/A'}
- 24h Change: ${tokenData.price_change_24h?.toFixed(2) || 'N/A'}%
- Market Cap: $${(tokenData.market_cap || 0)?.toLocaleString()}
- 24h Volume: $${(tokenData.volume_24h || 0)?.toLocaleString()}
- All-time High: $${tokenData.ath?.toLocaleString() || 'N/A'}
- All-time Low: $${tokenData.atl?.toLocaleString() || 'N/A'}

Be direct and tell me if I should buy, sell, or stay the hell away. Give me entry points, targets, and stop losses.`;

      // Check if API key is available
      if (!import.meta.env.VITE_GROQ_API_KEY) {
        console.error('Groq API key not found in environment variables');
        throw new Error('Groq API key not found');
      }

      let accumulatedResponse = '';
      
      // Use streaming for more responsive UX
      const insights = await groq.generate({
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2048,
        stream: true,
        onStream: (event) => {
          if (event.type === 'delta' && event.data) {
            accumulatedResponse += event.data;
          }
        }
      });
      
      return accumulatedResponse || insights;
    } catch (error) {
      console.error('Error generating insights:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to navigate to the chat UI with the selected token
  const navigateToChat = (token: TokenData) => {
    // Set any necessary state in local storage or app state
    localStorage.setItem('currentChatToken', JSON.stringify({
      id: token.id,
      name: token.name,
      symbol: token.symbol
    }));
    
    // Navigate to the chat UI
    navigate('/xbt-hud');
  };

  const value = {
    generateInsights,
    navigateToChat,
    isProcessing
  };

  return (
    <GroqAIContext.Provider value={value}>
      {children}
    </GroqAIContext.Provider>
  );
};

export default GroqAIProvider; 