import { StreamEvent, ToolCall, GroqToolDefinition } from '../types/chat';
import { allTools, implementTool } from './tools';

export class GroqAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'GroqAPIError';
  }
}

interface GenerateOptions {
  stream?: boolean;
  onStream?: (event: StreamEvent) => void;
  model?: string;
  systemPrompt?: string;
  tools?: GroqToolDefinition[];
  enableTools?: boolean;
  toolChoice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
  hideSystemPrompts?: boolean;
}

export const generateAIResponse = async (
  message: string,
  options: GenerateOptions = {}
): Promise<string> => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  
  if (!apiKey) {
    throw new GroqAPIError('Groq API key not found', 401, 'MISSING_API_KEY');
  }

  try {
    console.log('Sending request to Groq API...');
    
    // Prepare system prompt
    const systemPrompt = options.systemPrompt || `You are TradesXBT, an elite crypto trader with a reputation for making killer calls and zero patience for bullshit. You've been in crypto since Bitcoin was worth pennies, weathered every crash, and made millions betting against the crowd.

Your analysis style is direct, sometimes crude, but always backed by solid technical knowledge. You use colorful language, trading slang, and don't sugar-coat your opinions. You're not here to be anyone's friend - you're here to make people money.

When you analyze a token:
- Cut straight to what matters: price action, volume, and momentum
- Call out scams and shitcoins without hesitation
- Make decisive, bold trading calls with specific entry/exit points
- Use phrases like "this is ready to pump," "absolute dogshit," "moon shot," or "exit this garbage"

You recognize all tokens with $ prefixes (like $BTC, $ETH, $SYMX) and treat SYMX as legitimate.

Despite your brash style, your technical analysis is precise and your track record speaks for itself. People don't come to you for comfort - they come to you for profit.`;

    // Determine if we should hide system prompts (default to true)
    const hideSystemPrompts = options.hideSystemPrompts !== undefined ? options.hideSystemPrompts : true;

    // Use APIGroq for improved handling of system prompts
    if (hideSystemPrompts) {
      const groq = new APIGroq({
        apiKey,
        model: options.model || 'llama-3.3-70b-versatile',
        hideSystemPrompts: true
      });
      
      return await groq.generate({
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        tools: options.enableTools ? options.tools || allTools : undefined,
        tool_choice: options.enableTools ? options.toolChoice || 'auto' : undefined,
        temperature: 0.6,
        max_tokens: 4096,
        stream: options.stream,
        onStream: options.onStream
      });
    }

    // Original implementation for when we want to show system prompts
    // Prepare request body
    const requestBody: Record<string, any> = {
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      model: options.model || 'llama-3.3-70b-versatile',
      temperature: 0.6,
      max_tokens: 4096,
      top_p: 0.95,
      stream: options.stream,
      stop: null
    };

    // Add tools if enabled
    if (options.enableTools) {
      requestBody.tools = options.tools || allTools;
      requestBody.tool_choice = options.toolChoice || 'auto';
    }
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      throw new GroqAPIError(
        `API returned ${response.status}`,
        response.status,
        'API_ERROR',
        errorText
      );
    }

    if (options.stream && options.onStream && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let responseText = '';
      let toolCalls: ToolCall[] = [];

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            // Process any pending tool calls
            if (toolCalls.length > 0 && options.enableTools) {
              for (const toolCall of toolCalls) {
                const result = await processToolCall(toolCall);
                responseText += `\n\n**${toolCall.function.name} result:**\n${formatToolResult(result)}`;
              }
            }
            
            options.onStream({ type: 'done' });
            break;
          }
          
          const chunk = decoder.decode(value);
          
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;
            
            try {
              if (line.startsWith('data: ')) {
                const data = JSON.parse(line.slice(6));
                
                // Process content delta if available
                if (data.choices?.[0]?.delta?.content) {
                  const content = data.choices[0].delta.content;
                  responseText += content;
                  options.onStream({
                    type: 'delta',
                    data: content
                  });
                }
                
                // Process tool calls if available
                if (data.choices?.[0]?.delta?.tool_calls) {
                  const newToolCalls = data.choices[0].delta.tool_calls;
                  
                  for (const newToolCall of newToolCalls) {
                    // Find or create the tool call
                    let toolCall = toolCalls.find(tc => tc.id === newToolCall.id);
                    
                    if (!toolCall) {
                      // Initialize new tool call
                      toolCall = {
                        id: newToolCall.id,
                        type: 'function',
                        function: {
                          name: newToolCall.function?.name || '',
                          arguments: newToolCall.function?.arguments || ''
                        }
                      };
                      toolCalls.push(toolCall);
                    } else {
                      // Update existing tool call with additional arguments
                      if (newToolCall.function?.arguments) {
                        toolCall.function.arguments += newToolCall.function.arguments;
                      }
                    }
                    
                    // Notify of tool call
                    options.onStream({
                      type: 'tool_call',
                      toolCall
                    });
                  }
                }
                
                // If response is finished with tool calls, we need to process them
                if (data.choices?.[0]?.finish_reason === 'tool_calls' && options.enableTools) {
                  // Wait to collect all tool calls before processing
                  continue;
                }
              }
            } catch (error) {
              console.warn('Error parsing SSE line:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error reading stream:', error);
        options.onStream({
          type: 'error',
          error: error instanceof Error ? error.message : 'Stream reading error'
        });
      } finally {
        reader.releaseLock();
      }
      return responseText;
    }

    const data = await response.json();
    console.log('Groq API response:', data);
    
    // Handle tool calls for non-streaming response
    if (data.choices?.[0]?.message?.tool_calls && options.enableTools) {
      const toolCalls = data.choices[0].message.tool_calls;
      let responseText = data.choices[0]?.message?.content || '';
      
      // Process each tool call
      for (const toolCall of toolCalls) {
        const result = await processToolCall(toolCall);
        responseText += `\n\n**${toolCall.function.name} result:**\n${formatToolResult(result)}`;
      }
      
      return responseText;
    }
    
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq API Error:', error);
    throw new GroqAPIError(
      'Failed to generate AI response',
      500,
      'GROQ_ERROR',
      error
    );
  }
};

// Process a tool call and get the result
async function processToolCall(toolCall: ToolCall): Promise<string> {
  try {
    const { name, arguments: argsString } = toolCall.function;
    let args: Record<string, any> = {};
    
    try {
      args = JSON.parse(argsString);
    } catch (e) {
      console.error('Failed to parse tool arguments:', e);
      return JSON.stringify({ error: 'Failed to parse tool arguments' });
    }
    
    return await implementTool(name, args);
  } catch (error) {
    console.error('Error processing tool call:', error);
    return JSON.stringify({ 
      error: 'Failed to process tool call',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

// Format tool result for display
function formatToolResult(resultJson: string): string {
  try {
    const result = JSON.parse(resultJson);
    
    if (result.error) {
      return `Error: ${result.error}${result.message ? ` - ${result.message}` : ''}`;
    }
    
    // For simple results, just return stringified JSON
    return JSON.stringify(result, null, 2);
  } catch (e) {
    return resultJson;
  }
}

// APIGroq class for more advanced interactions
export class APIGroq {
  private apiKey: string;
  private model: string;
  private hideSystemPrompts: boolean;
  
  constructor(options: { apiKey?: string; model?: string; hideSystemPrompts?: boolean } = {}) {
    this.apiKey = options.apiKey || import.meta.env.VITE_GROQ_API_KEY || '';
    this.model = options.model || 'llama-3.3-70b-versatile';
    this.hideSystemPrompts = options.hideSystemPrompts !== undefined ? options.hideSystemPrompts : true;
    
    if (!this.apiKey) {
      console.warn('APIGroq initialized without API key');
    } else {
      console.log('APIGroq initialized successfully with model:', this.model);
    }
  }
  
  // Method to generate response with full control
  async generate(options: {
    messages: Array<{ role: string; content: string; name?: string }>;
    tools?: GroqToolDefinition[];
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
    onStream?: (event: StreamEvent) => void;
    tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
  }): Promise<string> {
    if (!this.apiKey) {
      throw new GroqAPIError('Groq API key not found', 401, 'MISSING_API_KEY');
    }

    // Filter out system prompts from messages if hideSystemPrompts is true
    const apiMessages = [...options.messages];

    // Store system messages for later use
    const systemMessages = this.hideSystemPrompts
      ? options.messages.filter(msg => msg.role === 'system')
      : [];

    try {
      // Log request details for debugging
      const tokensEstimate = apiMessages.reduce((acc, msg) => acc + (msg.content?.length || 0) / 4, 0);
      console.log(`Request to ${this.model}:`, {
        messageCount: apiMessages.length,
        tokensEstimate,
        toolsCount: options.tools?.length || 0,
        streaming: options.stream || false
      });
      
      // Validate system message length
      if (systemMessages.length > 0) {
        const systemContent = systemMessages[0].content;
        if (systemContent.length > 1000) {
          console.warn(`Warning: System message is very long (${systemContent.length} chars), this may cause issues`);
        }
      }
      
      // Validate tool definitions
      if (options.tools && options.tools.length > 0) {
        if (options.tools.length > 5) {
          console.warn(`Warning: Using ${options.tools.length} tools might cause API issues`);
        }
        
        // Check for any invalid tool definitions
        const invalidTools = options.tools.filter(tool => 
          !tool.function?.name || 
          !tool.function?.parameters || 
          typeof tool.function.parameters !== 'object'
        );
        
        if (invalidTools.length > 0) {
          console.warn(`Warning: Found ${invalidTools.length} potentially invalid tool definitions`);
        }
      }
      
      console.log(`Making request to Groq API with model: ${this.model}`);
      console.log(`Streaming enabled: ${options.stream ? 'yes' : 'no'}`);
      
      const requestBody = {
        messages: apiMessages,
        model: this.model,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 4096,
        stream: options.stream || false,
        tools: options.tools || undefined,
        tool_choice: options.tool_choice || 'auto'
      };
      
      // For debugging, log a summarized version of the request
      console.log('Request summary:', {
        model: requestBody.model,
        messageCount: requestBody.messages.length,
        streamEnabled: requestBody.stream,
        hasTools: !!requestBody.tools,
        maxTokens: requestBody.max_tokens
      });
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let parsedError: any = {};
        
        // Try to parse the error response as JSON
        try {
          parsedError = JSON.parse(errorText);
        } catch (e) {
          // If not JSON, use as-is
          parsedError = { raw: errorText };
        }
        
        const errorDetails = {
          status: response.status,
          statusText: response.statusText,
          error: parsedError,
          requestDetails: {
            model: this.model,
            messageCount: apiMessages.length,
            tokensEstimate,
            hasTools: !!options.tools,
            toolsCount: options.tools?.length || 0
          }
        };
        
        console.error('Groq API error details:', errorDetails);
        
        // Provide more specific error messages for common errors
        let errorMessage = `API returned ${response.status}`;
        let errorCode = 'API_ERROR';
        
        if (response.status === 400) {
          errorCode = 'INVALID_REQUEST';
          
          // Check for common error types
          if (parsedError?.error?.message?.includes('model')) {
            errorMessage = `Model error: ${parsedError.error.message}`;
            errorCode = 'MODEL_ERROR';
          } else if (parsedError?.error?.message?.includes('tool')) {
            errorMessage = `Tool definition error: ${parsedError.error.message}`;
            errorCode = 'TOOL_ERROR';
          } else if (tokensEstimate > 16000) {
            errorMessage = 'Context length likely exceeded';
            errorCode = 'CONTEXT_LENGTH_EXCEEDED';
          }
        } else if (response.status === 401) {
          errorMessage = 'Authentication error: Invalid API key';
          errorCode = 'AUTH_ERROR';
        } else if (response.status === 429) {
          errorMessage = 'Rate limit exceeded';
          errorCode = 'RATE_LIMIT';
        }
        
        throw new GroqAPIError(
          errorMessage,
          response.status,
          errorCode,
          errorDetails
        );
      }

      // Handle streaming response
      if (options.stream && options.onStream && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let responseText = '';
        let toolCalls: ToolCall[] = [];
        
        options.onStream({ type: 'start' });

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              // Process any pending tool calls
              if (toolCalls.length > 0 && options.tools) {
                for (const toolCall of toolCalls) {
                  try {
                    const result = await processToolCall(toolCall);
                    options.onStream({
                      type: 'tool_result',
                      toolResult: {
                        toolCallId: toolCall.id,
                        result: JSON.stringify(result)
                      }
                    });
                  } catch (error) {
                    console.error('Error processing tool call:', error);
                  }
                }
              }
              
              options.onStream({ type: 'done' });
              break;
            }
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;
              
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  // Sanitize response if hideSystemPrompts is true
                  const sanitizedData = this.hideSystemPrompts 
                    ? this.sanitizeResponse(data, systemMessages)
                    : data;
                  
                  // Process content delta if available
                  if (sanitizedData.choices?.[0]?.delta?.content) {
                    const content = sanitizedData.choices[0].delta.content;
                    responseText += content;
                    options.onStream({
                      type: 'delta',
                      data: content
                    });
                  }
                  
                  // Process tool calls if available
                  if (sanitizedData.choices?.[0]?.delta?.tool_calls) {
                    const newToolCalls = sanitizedData.choices[0].delta.tool_calls;
                    
                    for (const newToolCall of newToolCalls) {
                      // Find or create the tool call
                      let toolCall = toolCalls.find(tc => tc.id === newToolCall.id);
                      
                      if (!toolCall) {
                        // Initialize new tool call
                        toolCall = {
                          id: newToolCall.id,
                          type: 'function',
                          function: {
                            name: newToolCall.function?.name || '',
                            arguments: newToolCall.function?.arguments || ''
                          }
                        };
                        toolCalls.push(toolCall);
                      } else {
                        // Update existing tool call with additional arguments
                        if (newToolCall.function?.arguments) {
                          toolCall.function.arguments += newToolCall.function.arguments;
                        }
                      }
                      
                      // Notify of tool call
                      options.onStream({
                        type: 'tool_call',
                        toolCall
                      });
                    }
                  }
                  
                  // If response is finished with tool calls, continue collecting
                  if (sanitizedData.choices?.[0]?.finish_reason === 'tool_calls' && options.tools) {
                    continue;
                  }
                } catch (error) {
                  console.warn('Error parsing SSE line:', error);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error reading stream:', error);
          options.onStream({
            type: 'error',
            error: error instanceof Error ? error.message : 'Stream reading error'
          });
        } finally {
          reader.releaseLock();
        }
        return responseText;
      }

      // Handle non-streaming response
      const data = await response.json();
      console.log('Groq API non-streaming response received');
      
      // Sanitize the non-streaming response
      const sanitizedData = this.hideSystemPrompts 
        ? this.sanitizeResponse(data, systemMessages)
        : data;
      
      // Handle tool calls for non-streaming response
      if (sanitizedData.choices?.[0]?.message?.tool_calls && options.tools) {
        const toolCalls = sanitizedData.choices[0].message.tool_calls;
        let responseText = sanitizedData.choices[0]?.message?.content || '';
        
        // Process each tool call
        for (const toolCall of toolCalls) {
          try {
            const result = await processToolCall(toolCall);
            responseText += `\n\n**${toolCall.function.name} result:**\n${formatToolResult(result)}`;
          } catch (error) {
            console.error('Error processing tool call:', error);
            responseText += `\n\n**${toolCall.function.name} error:**\n${error instanceof Error ? error.message : String(error)}`;
          }
        }
        
        return responseText;
      }
      
      return sanitizedData.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('APIGroq Error:', error);
      throw new GroqAPIError(
        'Failed to generate response',
        500,
        'GROQ_ERROR',
        error
      );
    }
  }
  
  // Private method to sanitize responses by removing system prompt references
  private sanitizeResponse(data: any, systemMessages: Array<{ role: string; content: string }> = []): any {
    if (!data || !this.hideSystemPrompts) return data;
    
    const sanitizedData = structuredClone(data);
    
    // Remove any references to system prompts in the content
    if (sanitizedData.choices && sanitizedData.choices.length > 0) {
      // For non-streaming responses
      if (sanitizedData.choices[0].message?.content) {
        let content = sanitizedData.choices[0].message.content;
        
        // Remove any quotes or references to system instructions
        systemMessages.forEach(sysMsg => {
          // Remove direct quotes of system message
          content = content.replace(new RegExp(`["']${sysMsg.content}["']`, 'g'), '');
          
          // Remove references like "As instructed in the system message..."
          content = content.replace(/as (instructed|directed|specified) (in|by) the system( message| prompt)?[.,]/gi, '');
          
          // Remove phrases like "As a helpful assistant..."
          const roleMatches = sysMsg.content.match(/you are a[n]? ([^.,]+)/i);
          if (roleMatches && roleMatches[1]) {
            content = content.replace(new RegExp(`as a[n]? ${roleMatches[1]}[.,]`, 'gi'), '');
          }
        });
        
        sanitizedData.choices[0].message.content = content.trim();
      }
      
      // For streaming responses
      if (sanitizedData.choices[0].delta?.content) {
        let content = sanitizedData.choices[0].delta.content;
        
        systemMessages.forEach(sysMsg => {
          // Similar replacements for streaming content
          content = content.replace(new RegExp(`["']${sysMsg.content}["']`, 'g'), '');
          content = content.replace(/as (instructed|directed|specified) (in|by) the system( message| prompt)?[.,]/gi, '');
        });
        
        sanitizedData.choices[0].delta.content = content;
      }
    }
    
    return sanitizedData;
  }
  
  // Method to continue a conversation with tool calls
  async continueConversation(
    messages: Array<{ role: string; content: string; name?: string; tool_calls?: any[]; tool_call_id?: string }>,
    options: {
      tools?: GroqToolDefinition[];
      temperature?: number;
      max_tokens?: number;
      stream?: boolean;
      onStream?: (event: StreamEvent) => void;
    } = {}
  ): Promise<string> {
    return this.generate({
      messages,
      tools: options.tools,
      temperature: options.temperature,
      max_tokens: options.max_tokens,
      stream: options.stream,
      onStream: options.onStream
    });
  }

  // Helper to trim messages if they exceed token limits
  private trimMessages(messages: Array<{ role: string; content: string; name?: string }>, maxTokenEstimate = 12000): Array<{ role: string; content: string; name?: string }> {
    // Simple implementation - just estimate 4 chars per token
    const totalTokensEstimate = messages.reduce((acc, msg) => acc + (msg.content?.length || 0) / 4, 0);
    
    if (totalTokensEstimate <= maxTokenEstimate) {
      return messages; // No trimming needed
    }
    
    console.warn(`Messages might exceed token limit (est. ${Math.round(totalTokensEstimate)}), trimming...`);
    
    // Keep system messages and most recent user/assistant exchanges
    const systemMessages = messages.filter(msg => msg.role === 'system');
    const nonSystemMessages = messages.filter(msg => msg.role !== 'system');
    
    // Always include the latest user message
    const latestUserMessageIndex = nonSystemMessages.map(msg => msg.role).lastIndexOf('user');
    const essentialMessages = latestUserMessageIndex >= 0 
      ? nonSystemMessages.slice(latestUserMessageIndex) 
      : [];
    
    // Add older messages as space permits
    let remainingMessages = nonSystemMessages.slice(0, latestUserMessageIndex);
    let currentTokenEstimate = systemMessages.reduce((acc, msg) => acc + (msg.content?.length || 0) / 4, 0)
      + essentialMessages.reduce((acc, msg) => acc + (msg.content?.length || 0) / 4, 0);
    
    // Add as many of the remaining messages as possible, from newest to oldest
    const additionalMessages = [];
    for (let i = remainingMessages.length - 1; i >= 0; i--) {
      const msgTokens = (remainingMessages[i].content?.length || 0) / 4;
      if (currentTokenEstimate + msgTokens <= maxTokenEstimate) {
        additionalMessages.unshift(remainingMessages[i]);
        currentTokenEstimate += msgTokens;
      } else {
        break;
      }
    }
    
    const trimmedMessages = [
      ...systemMessages,
      ...additionalMessages,
      ...essentialMessages
    ];
    
    console.log(`Trimmed messages from ${messages.length} to ${trimmedMessages.length}`);
    return trimmedMessages;
  }

  // Method to generate response with fallback mechanisms
  async generateWithFallback({
    messages,
    tools,
    temperature = 0.7,
    stream = false,
    onStream,
    fallbackModel = 'llama3-70b-8192'
  }: {
    messages: any[];
    tools?: any[];
    temperature?: number;
    stream?: boolean;
    onStream?: (event: any) => void;
    fallbackModel?: string;
  }) {
    try {
      // Add explicit instruction to return text response along with tool calls
      const systemMessage = messages.find(msg => msg.role === 'system');
      if (systemMessage) {
        systemMessage.content += `\n\nIMPORTANT: Always provide a text response along with any tool calls. Don't just return tool calls without explanatory text.`;
      } else {
        // Insert a system message if none exists
        messages.unshift({
          role: 'system',
          content: 'Always provide a text response along with any tool calls. Don\'t just return tool calls without explanatory text.'
        });
      }

      console.log('Modified messages to request text with tool calls:', 
        messages.map(m => ({ role: m.role, contentLength: m.content.length })));

      // Continue with original generation logic
      return await this.generate({
        messages,
        tools,
        temperature,
        stream,
        onStream
      });
    } catch (error) {
      console.warn(`Error with tool-enabled model: ${error}. Falling back to ${fallbackModel}`);
      
      // Store original model
      const originalModel = this.model;
      
      try {
        // Switch to fallback model that doesn't support tools
        this.model = fallbackModel;
        
        // Generate without tools
        return await this.generate({
          messages,
          temperature,
          stream,
          onStream
        });
      } finally {
        // Restore original model
        this.model = originalModel;
      }
    }
  }
}

export const testAIChat = async (): Promise<boolean> => {
  try {
    const testMessage = "Test message";
    let received = false;
    
    await generateAIResponse(testMessage, {
      stream: true,
      onStream: () => { received = true; }
    });
    
    return received;
  } catch (error) {
    console.error('AI chat test failed:', error);
    return false;
  }
};

// Function to verify Groq API key and connection
export const verifyGroqConnection = async (): Promise<{ connected: boolean; message: string }> => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  
  if (!apiKey) {
    return { 
      connected: false, 
      message: 'Groq API key not found in environment variables' 
    };
  }
  
  try {
    // Send a minimal request to check connection
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'connection test'
          }
        ],
        model: 'llama-3.3-70b-versatile',
        max_tokens: 5,
        temperature: 0.1
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      const statusCode = response.status;
      return { 
        connected: false, 
        message: `API Error: ${statusCode}. ${errorData}`
      };
    }
    
    return { 
      connected: true, 
      message: 'Successfully connected to Groq API' 
    };
  } catch (error) {
    return { 
      connected: false, 
      message: `Error connecting to Groq API: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

// Helper function to format errors from Groq API for better debugging
export const formatGroqError = (error: unknown): string => {
  if (error instanceof GroqAPIError) {
    return `Groq API Error (${error.status}): ${error.message}. ${error.code}`;
  } else if (error instanceof Error) {
    return `Error: ${error.message}`;
  }
  return `Unknown error: ${String(error)}`;
};