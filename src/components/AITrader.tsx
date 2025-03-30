import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane, FaSpinner, FaEraser, FaChartLine, FaMoneyBillWave } from 'react-icons/fa';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AITrader: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'I\'m your AI trading assistant powered by deepseek-r1-distill-llama-70b. I can help you analyze markets, execute trades, and provide market insights. What would you like to do today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Call our API endpoint that will interact with Groq
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          model: 'deepseek-r1-distill-llama-70b'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const data = await response.json();
      
      // Add assistant response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: 'I\'m your AI trading assistant powered by deepseek-r1-distill-llama-70b. I can help you analyze markets, execute trades, and provide market insights. What would you like to do today?',
      timestamp: new Date()
    }]);
  };

  return (
    <div className="flex flex-col h-[500px] bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-gray-800 p-3 border-b border-gray-700">
        <div className="flex items-center">
          <FaRobot className="text-blue-400 mr-2" />
          <h2 className="text-white font-medium">AI Trading Assistant</h2>
          <span className="ml-2 px-2 py-0.5 bg-blue-900 rounded text-xs text-blue-300">deepseek-r1-distill-llama-70b</span>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={clearChat}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Clear chat"
          >
            <FaEraser />
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto bg-gray-950">
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-900 text-white rounded-tr-none' 
                  : 'bg-gray-800 text-gray-200 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className={`text-xs mt-1 ${
                message.role === 'user' ? 'text-blue-300' : 'text-gray-400'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-800 p-3 rounded-lg rounded-tl-none text-gray-200">
              <div className="flex items-center">
                <FaSpinner className="animate-spin mr-2" />
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-3 bg-gray-800 border-t border-gray-700">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end"
        >
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about market analysis, technical indicators, or trade execution..."
              className="w-full bg-gray-700 text-white rounded-lg py-2 px-3 outline-none focus:ring-1 focus:ring-blue-500 resize-none min-h-[50px] max-h-[150px] overflow-y-auto"
              rows={1}
            />
            <div className="absolute right-2 bottom-2 flex space-x-1">
              <button 
                type="button" 
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="Market analysis"
              >
                <FaChartLine />
              </button>
              <button 
                type="button" 
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="Execute trade"
              >
                <FaMoneyBillWave />
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`ml-2 p-2 rounded-full ${
              isLoading || !input.trim() 
                ? 'bg-gray-600 text-gray-400' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } transition-colors`}
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AITrader; 