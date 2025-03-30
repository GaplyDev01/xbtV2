import React from 'react';
import { Bot, Search, X, Plus } from 'lucide-react';
import { Thread } from '../types/chat.types';

interface ChatHeaderProps {
  currentThread: Thread | null;
  showTokenSearch: boolean;
  setShowTokenSearch: (show: boolean) => void;
  onNewChat: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  currentThread,
  showTokenSearch,
  setShowTokenSearch,
  onNewChat
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-theme-border">
      <div className="flex items-center">
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
          onClick={onNewChat}
        >
          <Plus size={14} className="mr-1" />
          New Chat
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;