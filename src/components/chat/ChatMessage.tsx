import React from 'react';
import { Message } from '../../types/chat';
import { Bot } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  // Format tool call display
  const renderToolCall = (toolCall: any) => {
    const { function: func } = toolCall;
    let args = {};
    
    try {
      args = JSON.parse(func.arguments);
    } catch (e) {
      console.error('Failed to parse tool arguments:', e);
    }
    
    return (
      <div className="my-2 p-2 bg-theme-accent/10 rounded-md border border-theme-accent/20">
        <div className="text-xs font-semibold text-theme-accent mb-1">
          Function: {func.name}
        </div>
        <div className="text-xs">
          <pre className="whitespace-pre-wrap overflow-x-auto">
            {JSON.stringify(args, null, 2)}
          </pre>
        </div>
      </div>
    );
  };
  
  // Format tool result display
  const renderToolResult = (toolResult: any) => {
    let result = toolResult.result;
    
    try {
      const parsed = JSON.parse(result);
      result = JSON.stringify(parsed, null, 2);
    } catch (e) {
      // If not valid JSON, use as is
    }
    
    return (
      <div className="my-2 p-2 bg-theme-bg rounded-md border border-theme-border">
        <div className="text-xs font-semibold mb-1">
          Tool Result:
        </div>
        <div className="text-xs">
          <pre className="whitespace-pre-wrap overflow-x-auto">
            {result}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[80%] rounded-xl p-3 ${
          message.sender === 'user' 
            ? 'bg-theme-accent text-theme-bg rounded-tr-none' 
            : 'bg-theme-bg border border-theme-border rounded-tl-none'
        }`}
      >
        <div className="flex items-center mb-1">
          <div className="w-6 h-6 rounded-full bg-theme-bg/20 flex items-center justify-center mr-2">
            {message.sender === 'user' ? (
              <div className="w-3 h-3 rounded-full bg-theme-bg" />
            ) : (
              <Bot size={14} className="text-theme-accent" />
            )}
          </div>
          <span className="text-xs opacity-70">
            {message.sender === 'user' ? 'You' : 'Assistant'}
          </span>
        </div>
        
        <div className="text-sm whitespace-pre-wrap">
          {message.content}
        </div>
        
        {/* Display tool calls if present */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-3 border-t border-theme-border pt-2">
            <div className="text-xs font-medium mb-1">Using tools to answer your query:</div>
            {message.toolCalls.map((toolCall) => renderToolCall(toolCall))}
          </div>
        )}
        
        {/* Display tool results if present */}
        {message.toolResults && message.toolResults.length > 0 && (
          <div className="mt-3 border-t border-theme-border pt-2">
            <div className="text-xs font-medium mb-1">Tool results:</div>
            {message.toolResults.map((result) => renderToolResult(result))}
          </div>
        )}
        
        <div className="text-[10px] opacity-50 mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;