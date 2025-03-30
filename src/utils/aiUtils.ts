import { generateAIResponse, APIGroq } from '../services/groq';
import { generatePerplexityResponse, PerplexityStreamEvent } from '../services/perplexity';
import { allTools, implementTool } from '../services/tools';
import { ToolCall, ToolResult } from '../types/chat';

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

export const generateEnhancedAIResponse = async (
  message: string, 
  previousMessages: Array<{ content: string; sender: 'user' | 'ai' }> = [],
  onStream?: (text: string, toolCall?: ToolCall) => void
): Promise<{
  text: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}> => {
  try {
    const preferredService = getPreferredAIService();
    console.log(`Using AI service: ${preferredService}`);

    // If no API keys are available, throw an error
    if (preferredService === 'fallback') {
      throw new Error('No API keys available for AI services');
    }

    try {
      if (preferredService === 'perplexity') {
        if (onStream) {
          // Stream the response
          let responseText = '';
          
          await generatePerplexityResponse(message, {
            stream: true,
            onStream: (event) => {
              if (event.type === 'delta' && event.data) {
                responseText += event.data;
                onStream(event.data);
              }
            },
            systemPrompt: `You are TradesXBT AI, an expert cryptocurrency market analyst. Provide detailed, actionable market analysis with clear trading signals.`,
            temperature: 0.6
          });
          
          return { text: responseText };
        } else {
          // Non-streaming response
          const response = await generatePerplexityResponse(message, {
            systemPrompt: `You are TradesXBT AI, an expert cryptocurrency market analyst. Provide detailed, actionable market analysis with clear trading signals.`,
            temperature: 0.6
          });
          return { text: response };
        }
      } else {
        // Use APIGroq class for better control and to enable tool calling
        const groq = new APIGroq({
          model: 'llama-3.3-70b-versatile' // Tool-use capable model
        });
        
        console.log('Generating response with Groq API...');
        
        // Convert previous messages to the format expected by Groq
        const groqMessages = [
          {
            role: 'system',
            content: `You are TradesXBT AI, an expert cryptocurrency market analyst. Your role is to provide detailed, actionable market analysis with clear trading signals.

When analyzing market data, focus on:
- Current price and market cap
- Volume and liquidity
- Price trends and momentum
- Support and resistance levels
- Risk assessment

Always structure your responses with:
1. Market Overview
2. Technical Analysis
3. Trading Signal
4. Risk Assessment
5. Action Items`
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
        
        let responseText = '';
        let collectedToolCalls: ToolCall[] = [];
        let collectedToolResults: ToolResult[] = [];
        
        // Enhanced streaming handler with better debugging
        const streamingHandler = (event: any) => {
          console.log('Received stream event type:', event.type);
          
          if (event.type === 'delta' && event.data) {
            const chunk = event.data;
            console.log(`Received text chunk (${chunk.length} chars)`);
            responseText += chunk;
            onStream?.(chunk);
          } else if (event.type === 'tool_call' && event.toolCall) {
            console.log('Received tool call:', event.toolCall);
            collectedToolCalls.push(event.toolCall);
            onStream?.('', event.toolCall);
          } else if (event.type === 'error') {
            console.error('Streaming error:', event.error);
          }
        };
        
        try {
          // Generate response with tool calling capability and fallback mechanisms
          await groq.generateWithFallback({
            messages: groqMessages,
            tools: allTools,
            stream: !!onStream, // Enable streaming if onStream is provided
            onStream: streamingHandler,
            fallbackModel: 'llama3-70b-8192' // Fallback to a model without tool capability if needed
          });
          
          console.log('Groq response complete. Text length:', responseText.length);
          console.log('Collected tool calls:', collectedToolCalls.length);
        } catch (groqError) {
          console.error('Groq API error with details:', groqError);
          
          // If error contains specifics about tool calling, try again without tools
          if (groqError instanceof Error && groqError.message.includes('tool')) {
            console.log('Retrying without tools due to tool-related error');
            await groq.generate({
              messages: groqMessages,
              stream: !!onStream,
              onStream: streamingHandler
            });
          } else {
            throw groqError; // Re-throw if it's not a tool-related error
          }
        }
        
        // Process tool calls and get results
        if (collectedToolCalls.length > 0) {
          console.log('Processing collected tool calls...');
          for (const toolCall of collectedToolCalls) {
            try {
              const { name, arguments: argsString } = toolCall.function;
              const args = JSON.parse(argsString);
              console.log(`Implementing tool: ${name}`, args);
              const result = await implementTool(name, args);
              
              collectedToolResults.push({
                toolCallId: toolCall.id,
                result
              });
            } catch (error) {
              console.error('Error processing tool call:', error);
              collectedToolResults.push({
                toolCallId: toolCall.id,
                result: JSON.stringify({ 
                  error: 'Failed to process tool call',
                  message: error instanceof Error ? error.message : String(error)
                })
              });
            }
          }
        }
        
        console.log('Returning final response:', {
          textLength: responseText.length,
          toolCallsCount: collectedToolCalls.length,
          toolResultsCount: collectedToolResults.length
        });
        
        return {
          text: responseText,
          toolCalls: collectedToolCalls.length > 0 ? collectedToolCalls : undefined,
          toolResults: collectedToolResults.length > 0 ? collectedToolResults : undefined
        };
      }
    } catch (error) {
      console.error("Error with AI response:", error);
      
      // Provide a more detailed error object
      const enhancedError = error instanceof Error 
        ? {
            message: error.message,
            name: error.name,
            stack: error.stack,
            details: (error as any).details || 'No additional details'
          } 
        : { message: String(error) };
        
      console.error("Enhanced error details:", enhancedError);
      throw error;
    }
  } catch (error) {
    console.error('Error generating enhanced AI response:', error);
    throw error;
  }
};

export const generateStreamingResponse = async (
  message: string,
  onStream: (text: string) => void
): Promise<string> => {
  try {
    let responseText = '';
    
    const handleStreamEvent = (event: StreamEvent) => {
      switch (event.type) {
        case 'delta':
          if (event.data) {
            responseText += event.data;
            onStream(event.data);
          }
          break;
        case 'error':
          throw new Error(event.error || 'Error in stream event');
          break;
      }
    };

    const response = await generateAIResponse(message, { 
      stream: true, 
      onStream: handleStreamEvent,
      model: 'deepseek-r1-distill-llama-70b',
      temperature: 0.6,
      max_completion_tokens: 4096,
      top_p: 0.95
    });

    return response;
  } catch (error) {
    console.error('Error generating streaming response:', error);
    throw error;
  }
};

export const testAIChat = async (): Promise<boolean> => {
  try {
    const testMessage = "Test message";
    let received = false;
    
    await generateAIResponse(testMessage, {
      stream: true,
      onStream: () => { received = true; },
      model: 'llama-3.3-70b-versatile',
      temperature: 0.6,
      max_completion_tokens: 4096,
      top_p: 0.95
    });
    
    return received;
  } catch (error) {
    console.error('AI chat test failed:', error);
    return false;
  }
};