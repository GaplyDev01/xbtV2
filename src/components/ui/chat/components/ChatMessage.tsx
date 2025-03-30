import React from 'react';
import { Bot, User, Clock } from 'lucide-react';
import { Message } from '../types/chat.types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] ${
        message.sender === 'user'
          ? 'bg-theme-accent text-theme-bg rounded-tl-xl rounded-bl-xl rounded-br-xl'
          : 'bg-theme-bg border border-theme-border text-theme-text-primary rounded-tr-xl rounded-br-xl rounded-bl-xl'
      } px-4 py-3 shadow-sm`}>
        <div className="mr-3 mt-1">
          {message.sender === 'user' ? (
            <User size={16} className="text-theme-bg/80" />
          ) : (
            <Bot size={16} className="text-theme-accent" />
          )}
        </div>
        <div>
          <div className="text-xs mb-1">
            {message.sender === 'user' ? 'You' : 'TradesXBT AI'}
            <span className="opacity-60 ml-2">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;