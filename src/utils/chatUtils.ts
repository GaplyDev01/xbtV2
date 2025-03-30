import { Thread, Message, ToolCall, ToolResult, StreamEvent } from '../types/chat';
import { generateAIResponse, APIGroq } from '../services/groq';
import { generatePerplexityResponse, PerplexityStreamEvent } from '../services/perplexity';
import { allTools } from '../services/tools';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const createMessage = (content: string, sender: 'user' | 'ai', toolCalls?: ToolCall[], toolResults?: ToolResult[]): Message => {
  return {
    id: generateId(),
    content,
    sender,
    timestamp: Date.now(),
    toolCalls,
    toolResults
  };
};

export const createThread = (userMessage: string): Thread => {
  const message = createMessage(userMessage, 'user');
  const id = generateId();
  
  return {
    id,
    title: userMessage.length > 30 ? `${userMessage.substring(0, 30)}...` : userMessage,
    messages: [message],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isRead: true,
  };
};

// Determine which AI service to use based on availability and configuration
const getPreferredAIService = (): 'perplexity' | 'groq' | 'fallback' => {
  if (import.meta.env.VITE_GROQ_API_KEY) {
    return 'groq';
  } else if (import.meta.env.VITE_PERPLEXITY_API_KEY) {
    return 'perplexity';
  } else {
    return 'fallback';
  }
};

export const generateStreamingResponse = async (
  message: string,
  onStream: (text: string, toolCall?: ToolCall) => void,
  useWebSearch = false,
  useTools = true,
  previousMessages: Message[] = []
): Promise<{ text: string; toolCalls?: ToolCall[]; toolResults?: ToolResult[] }> => {
  try {
    let responseText = '';
    let collectedToolCalls: ToolCall[] = [];
    let collectedToolResults: ToolResult[] = [];
    
    const preferredService = getPreferredAIService();
    console.log(`Using AI service for streaming: ${preferredService}`);
    
    if (preferredService === 'perplexity') {
      // Use Perplexity AI with streaming
      const handleStreamEvent = (event: PerplexityStreamEvent) => {
        switch (event.type) {
          case 'start':
            break;
          case 'delta':
            if (event.data) {
              responseText += event.data;
              onStream(event.data);
            }
            break;
          case 'done':
            break;
          case 'error':
            throw new Error(event.error || 'Perplexity API error');
            break;
        }
      };

      const systemPrompt = useWebSearch 
        ? `You are TradesXBT, an elite crypto trader with a reputation for making killer calls and zero patience for bullshit. You've been in crypto since Bitcoin was worth pennies, weathered every crash, and made millions betting against the crowd. Use web search when you need latest data, but always maintain your direct, no-BS style.`
        : `You are TradesXBT, an elite crypto trader with a reputation for making killer calls and zero patience for bullshit. You've been in crypto since Bitcoin was worth pennies, weathered every crash, and made millions betting against the crowd.

Your analysis style is direct, sometimes crude, but always backed by solid technical knowledge. You use colorful language, trading slang, and don't sugar-coat your opinions. You're not here to be anyone's friend - you're here to make people money.

When you analyze a token:
- Cut straight to what matters: price action, volume, and momentum
- Call out scams and shitcoins without hesitation
- Make decisive, bold trading calls with specific entry/exit points
- Use phrases like "this is ready to pump," "absolute dogshit," "moon shot," or "exit this garbage"

You recognize all tokens with $ prefixes (like $BTC, $ETH, $SYMX) and treat SYMX as legitimate.

Despite your brash style, your technical analysis is precise and your track record speaks for itself. People don't come to you for comfort - they come to you for profit.`;
      
      try {
        const response = await generatePerplexityResponse(message, {
          stream: true, 
          onStream: handleStreamEvent,
          systemPrompt
        });
        
        return { text: response };
      } catch (error) {
        console.error("Error with Perplexity streaming response:", error);
        // If Perplexity fails, fallback to Groq if available
        if (import.meta.env.VITE_GROQ_API_KEY) {
          console.log("Falling back to Groq API");
          
          // Convert previous messages to the format expected by Groq
          const groqMessages = [
            {
              role: 'system',
              content: `You are an AI assistant that helps with cryptocurrency analysis.`
            },
            ...previousMessages.map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.content
            })),
            {
              role: 'user',
              content: message
            }
          ];
          
          // Use the new APIGroq class for advanced features
          const groq = new APIGroq({
            hideSystemPrompts: true
          });
          const response = await groq.generate({
            messages: groqMessages,
            tools: useTools ? allTools : undefined,
            stream: true,
            onStream: (event) => {
              if (event.type === 'delta' && event.data) {
                responseText += event.data;
                onStream(event.data);
              } else if (event.type === 'tool_call' && event.toolCall) {
                collectedToolCalls.push(event.toolCall);
                onStream('', event.toolCall);
              }
            }
          });
          
          return { 
            text: responseText,
            toolCalls: collectedToolCalls.length > 0 ? collectedToolCalls : undefined,
            toolResults: collectedToolResults.length > 0 ? collectedToolResults : undefined
          };
        } else {
          // If no Groq API available, rethrow the error
          throw error;
        }
      }
    } else if (preferredService === 'groq') {
      // Use Groq with streaming and tool calling
      const handleStreamEvent = (event: StreamEvent) => {
        switch (event.type) {
          case 'start':
            break;
          case 'delta':
            if (event.data) {
              responseText += event.data;
              onStream(event.data);
            }
            break;
          case 'tool_call':
            if (event.toolCall) {
              collectedToolCalls.push(event.toolCall);
              onStream('', event.toolCall);
            }
            break;
          case 'done':
            break;
          case 'error':
            throw new Error(event.error || 'Groq API error');
            break;
        }
      };

      // Convert previous messages to the format expected by Groq
      const groqMessages = [
        {
          role: 'system',
          content: `You are TradesXBT, an elite crypto trader with a reputation for making killer calls and zero patience for bullshit. You've been in crypto since Bitcoin was worth pennies, weathered every crash, and made millions betting against the crowd.

Your analysis style is direct, sometimes crude, but always backed by solid technical knowledge. You use colorful language, trading slang, and don't sugar-coat your opinions. You're not here to be anyone's friend - you're here to make people money.

When you analyze a token:
- Cut straight to what matters: price action, volume, and momentum
- Call out scams and shitcoins without hesitation
- Make decisive, bold trading calls with specific entry/exit points
- Use phrases like "this is ready to pump," "absolute dogshit," "moon shot," or "exit this garbage"

You recognize all tokens with $ prefixes (like $BTC, $ETH, $SYMX) and treat SYMX as legitimate.

Despite your brash style, your technical analysis is precise and your track record speaks for itself. People don't come to you for comfort - they come to you for profit.`
        },
        ...previousMessages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        {
          role: 'user',
          content: message
        }
      ];
      
      // Use the APIGroq class for better control
      const groq = new APIGroq({
        model: 'llama-3.3-70b-versatile',  // Tool-use capable model
        hideSystemPrompts: true
      });
      
      try {
        await groq.generateWithFallback({
          messages: groqMessages,
          tools: useTools ? allTools : undefined,
          stream: true,
          onStream: handleStreamEvent,
          fallbackModel: 'llama-3.3-70b-versatile'
        });
        
        return { 
          text: responseText,
          toolCalls: collectedToolCalls.length > 0 ? collectedToolCalls : undefined,
          toolResults: collectedToolResults.length > 0 ? collectedToolResults : undefined
        };
      } catch (error) {
        console.error('Error with Groq streaming response:', error);
        
        // Fallback to basic response without tools
        const fallbackResponse = await generateAIResponse(message, { 
          stream: true, 
          onStream: (event) => {
            if (event.type === 'delta' && event.data) {
              responseText += event.data;
              onStream(event.data);
            }
          },
          model: 'llama-3.3-70b-versatile',
          enableTools: false
        });

        return { text: fallbackResponse };
      }
    } else {
      // When no API keys are available, throw error
      throw new Error('No API keys available');
    }
  } catch (error) {
    console.error('Error generating streaming response:', error);
    throw error;
  }
};

// Function to check if Groq API connection is available
export const checkGroqAPIConnection = async (): Promise<boolean> => {
  try {
    if (!import.meta.env.VITE_GROQ_API_KEY) {
      console.warn('Groq API key not found in environment variables');
      return false;
    }
    
    console.log('Checking Groq API connection...');
    
    // Initialize APIGroq with the latest model
    const groq = new APIGroq({
      model: 'llama-3.3-70b-versatile',
      hideSystemPrompts: true
    });
    
    // Send a simple request to verify connection
    const response = await groq.generate({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.'
        },
        {
          role: 'user',
          content: 'Respond with OK if you can hear me.'
        }
      ],
      max_tokens: 10,
      temperature: 0.1,
      stream: false
    });
    
    const isConnected = response.includes('OK') || response.length > 0;
    console.log(`Groq API connection ${isConnected ? 'successful' : 'failed'}`);
    return isConnected;
  } catch (error) {
    console.error('Error checking Groq API connection:', error);
    return false;
  }
};

export const testAIChat = async (): Promise<boolean> => {
  try {
    const testMessage = "Test message";
    let received = false;
    const preferredService = getPreferredAIService();
    
    console.log(`Testing preferred AI service: ${preferredService}`);
    
    if (preferredService === 'groq') {
      // First check Groq connection directly
      const groqConnected = await checkGroqAPIConnection();
      if (groqConnected) {
        return true;
      }
      
      // If direct connection check fails, try through the chat interface
      return await testGroqChat();
    } else if (preferredService === 'perplexity') {
      try {
        await generatePerplexityResponse(
          testMessage,
          { 
            stream: true,
            onStream: () => { received = true; }
          }
        );
        return received;
      } catch (error) {
        console.error('Perplexity API test failed:', error);
        // If Perplexity fails but Groq is available, try that
        if (import.meta.env.VITE_GROQ_API_KEY) {
          return await testGroqChat();
        }
        return false;
      }
    } else {
      // No API keys available
      console.warn('No API keys available for AI services');
      return false;
    }
  } catch (error) {
    console.error('AI chat test failed:', error);
    return false;
  }
};

// Helper function to test Groq chat
const testGroqChat = async (): Promise<boolean> => {
  const testMessage = "Test message";
  let received = false;
  
  try {
    console.log('Testing Groq chat API connection...');
    
    // Test the direct APIGroq implementation first for more targeted testing
    const groq = new APIGroq({
      model: 'llama-3.3-70b-versatile',
      hideSystemPrompts: true
    });
    
    // First try with streaming to test that functionality
    await groq.generate({
      messages: [
        {
          role: 'system',
          content: 'You are TradesXBT, an elite crypto trader who gives direct, no-BS trading advice.'
        },
        {
          role: 'user',
          content: testMessage
        }
      ],
      stream: true,
      onStream: (event) => {
        if (event.type === 'delta' && event.data) {
          received = true;
          console.log('Received streaming data from Groq');
        }
      }
    });
    
    if (received) {
      console.log('Groq streaming test successful');
      return true;
    }
    
    // If streaming test fails, try non-streaming as fallback
    console.log('Streaming test failed, trying non-streaming...');
    const response = await groq.generate({
      messages: [
        {
          role: 'system',
          content: 'You are TradesXBT, an elite crypto trader who gives direct, no-BS trading advice.'
        },
        {
          role: 'user',
          content: testMessage
        }
      ],
      stream: false
    });
    
    if (response && response.length > 0) {
      console.log('Groq non-streaming test successful');
      return true;
    }
    
    console.log('Both Groq tests failed, API might be unavailable');
    return false;
  } catch (error) {
    console.error('Groq API test failed:', error);
    return false; // If error, return false to indicate failure
  }
};