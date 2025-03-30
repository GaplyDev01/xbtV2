import React from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useAutoResizeTextarea } from '../../hooks/use-auto-resize-textarea';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isProcessing,
  placeholder = "Message TradesXBT AI...",
  minHeight = 56,
  maxHeight = 120
}) => {
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight, maxHeight });
  const [message, setMessage] = React.useState('');

  const handleSendMessage = () => {
    if (!message.trim() || isProcessing) return;
    onSendMessage(message);
    setMessage('');
    adjustHeight(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustHeight();
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isProcessing}
        className="w-full p-3 pr-12 text-sm bg-theme-accent/10 border border-theme-border rounded-lg text-theme-text-primary placeholder-theme-text-secondary focus:outline-none focus:ring-2 focus:ring-theme-accent resize-none"
        rows={1}
      />
      <button
        onClick={handleSendMessage}
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
  );
};

export default ChatInput;