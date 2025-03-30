import React, { useState, useRef, useEffect } from 'react';
import { Thread } from '../../types/chat';
import { Bot, Search, X, Plus, Send, Loader2, ChevronRight, ChevronDown } from 'lucide-react';
import TokenSearch from '../common/TokenSearch';
import { CoinSearchResult } from '../../services/cryptoApi';
import { useAutoResizeTextarea } from '../hooks/use-auto-resize-textarea';
import { cn } from '../../utils/cn';

interface ChatUIProps {
  threads: Thread[];
  currentThreadId: string | null;
  onSendMessage: (message: string, isNewThread: boolean) => Promise<void>;
  onSelectThread: (threadId: string) => void;
  onDeleteThread: (threadId: string) => void;
  isProcessing: boolean;
}

const ChatUI: React.FC<ChatUIProps> = ({
  threads,
  currentThreadId,
  onSendMessage,
  onSelectThread,
  onDeleteThread,
  isProcessing
}) => {
  const [showTokenSearch, setShowTokenSearch] = useState(false);
  const [message, setMessage] = useState('');
  const [showThreads, setShowThreads] = useState(false);
  const currentThread = threads.find(thread => thread.id === currentThreadId);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 56,
    maxHeight: 200
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [currentThread?.messages]);

  // Handle token selection
  const handleTokenSelect = (token: CoinSearchResult) => {
    const tokenMessage = `Tell me about ${token.name} (${token.symbol.toUpperCase()}). What's the current price, market sentiment, and recent performance?`;
    onSendMessage(tokenMessage, !currentThreadId);
    setShowTokenSearch(false);
  };

  // Handle message submission
  const handleSubmit = async () => {
    if (!message.trim() || isProcessing) return;
    
    await onSendMessage(message, !currentThreadId);
    setMessage('');
    adjustHeight(true);
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex h-full">
      {/* Threads Sidebar */}
      <div 
        className={`border-r border-theme-border transition-all duration-300 ${
          showThreads ? 'w-64' : 'w-0'
        } overflow-hidden`}
      >
        <div className="p-4 border-b border-theme-border">
          <button
            onClick={() => {
              setShowThreads(false);
              onSendMessage('', true);
            }}
            className="w-full flex items-center justify-center text-sm bg-theme-accent text-theme-bg px-3 py-2 rounded-lg hover:bg-theme-accent-dark transition-colors"
          >
            <Plus size={16} className="mr-2" />
            New Chat
          </button>
        </div>
        
        <div className="overflow-y-auto h-[calc(100%-65px)]">
          {threads.map(thread => (
            <button
              key={thread.id}
              onClick={() => {
                onSelectThread(thread.id);
                setShowThreads(false);
              }}
              className={cn(
                'w-full text-left p-3 hover:bg-theme-accent/10 transition-colors border-b border-theme-border',
                currentThreadId === thread.id && 'bg-theme-accent/20'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bot size={16} className="text-theme-accent mr-2" />
                  <span className="text-sm font-medium text-theme-text-primary truncate">
                    {thread.title}
                  </span>
                </div>
                {!thread.isRead && (
                  <div className="w-2 h-2 rounded-full bg-theme-accent"></div>
                )}
              </div>
              <p className="text-xs text-theme-text-secondary mt-1 truncate">
                {thread.messages[thread.messages.length - 1]?.content}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-theme-border">
          <div className="flex items-center">
            <button
              onClick={() => setShowThreads(!showThreads)}
              className="p-1 hover:bg-theme-accent/10 rounded-lg mr-2"
            >
              {showThreads ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
            </button>
            <Bot size={18} className="text-theme-accent mr-2" />
            <h2 className="text-theme-text-primary font-medium">
              {currentThread ? 'Chat with TradesXBT AI' : 'New Chat'}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className={`text-xs px-3 py-1.5 rounded-lg flex items-center ${
                showTokenSearch
                  ? 'bg-theme-accent text-theme-bg'
                  : 'bg-theme-bg border border-theme-border text-theme-text-primary hover:bg-theme-accent/10'
              }`}
              onClick={() => setShowTokenSearch(!showTokenSearch)}
              title={showTokenSearch ? "Close token search" : "Search for tokens"}
            >
              {showTokenSearch ? (
                <>
                  <X size={14} className="mr-1" />
                  Close Token Search
                </>
              ) : (
                <>
                  <Search size={14} className="mr-1" />
                  Token Search
                </>
              )}
            </button>
            <button
              className="text-xs bg-theme-accent hover:bg-theme-accent-dark text-theme-bg px-3 py-1.5 rounded-lg flex items-center"
              onClick={() => onSendMessage('', true)}
            >
              <Plus size={14} className="mr-1" />
              New Chat
            </button>
          </div>
        </div>

        {/* Token Search Panel */}
        {showTokenSearch && (
          <div className="p-4 border-b border-theme-border bg-theme-accent/5">
            <div className="mb-2">
              <h3 className="text-sm font-medium text-theme-text-primary mb-2">Search for Crypto Tokens</h3>
              <p className="text-xs text-theme-text-secondary mb-3">
                Find and analyze cryptocurrency tokens to discuss with the AI. Select a token to create a prompt about it.
              </p>
            </div>
            <TokenSearch
              platform="all"
              onSelectToken={handleTokenSelect}
              placeholder="Search for any token (e.g., BTC, ETH, SOL)..."
            />
          </div>
        )}

        {/* Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {currentThread?.messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
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
                
                <div className="text-[10px] opacity-50 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-xl p-3 bg-theme-bg border border-theme-border rounded-tl-none">
                <div className="flex items-center mb-1">
                  <div className="w-6 h-6 rounded-full bg-theme-bg/20 flex items-center justify-center mr-2">
                    <Bot size={14} className="text-theme-accent" />
                  </div>
                  <span className="text-xs opacity-70">Assistant</span>
                </div>
                <div className="flex space-x-1 py-2">
                  <div className="w-2 h-2 bg-theme-text-secondary/50 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-theme-text-secondary/50 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-theme-text-secondary/50 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-theme-border">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                adjustHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Message TradesXBT AI..."
              className="w-full p-3 pr-12 text-sm bg-theme-accent/10 border border-theme-border rounded-lg text-theme-text-primary placeholder-theme-text-secondary focus:outline-none focus:ring-2 focus:ring-theme-accent resize-none"
              disabled={isProcessing}
              rows={1}
            />
            <button
              onClick={handleSubmit}
              disabled={!message.trim() || isProcessing}
              className="absolute right-3 bottom-3 text-theme-accent hover:text-theme-accent-dark disabled:text-theme-accent/30"
            >
              {isProcessing ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatUI;