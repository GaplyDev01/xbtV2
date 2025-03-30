import React, { useState, useEffect } from 'react';
import { useToken } from '../context/TokenContext';
import { Coins, X, ArrowRight } from 'lucide-react';

interface TokenSelectedNotificationProps {
  autoHide?: boolean;
}

const TokenSelectedNotification: React.FC<TokenSelectedNotificationProps> = ({ 
  autoHide = true 
}) => {
  const { selectedToken } = useToken();
  const [isVisible, setIsVisible] = useState(false);

  // Show notification when token changes and auto-hide after a delay
  useEffect(() => {
    if (selectedToken) {
      setIsVisible(true);
      
      if (autoHide) {
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 4000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [selectedToken, autoHide]);

  // Don't render if no token or not visible
  if (!selectedToken || !isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md w-full sm:w-auto">
      <div className="bg-theme-accent/95 text-theme-bg p-3 rounded-lg shadow-lg backdrop-blur-sm animate-slideIn flex items-center justify-between">
        <div className="flex items-center">
          {selectedToken.thumb ? (
            <img 
              src={selectedToken.thumb} 
              alt={selectedToken.name} 
              className="w-6 h-6 rounded-full mr-3" 
            />
          ) : (
            <Coins size={20} className="mr-3" />
          )}
          
          <div>
            <div className="font-medium">{selectedToken.name}</div>
            <div className="text-xs opacity-90">Selected for viewing</div>
          </div>
        </div>
        
        <div className="flex items-center">
          <span className="text-xs mr-4 flex items-center">
            Updating dashboard <ArrowRight size={12} className="ml-1" />
          </span>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default TokenSelectedNotification;