import React, { ReactNode } from 'react';
import { X, Maximize2, Minimize2, Settings } from 'lucide-react';
import { DotPattern } from './ui/dot-pattern';

interface CardProps {
  title: string;
  children: ReactNode;
  onClose?: () => void;
  onSettings?: () => void;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  title,
  children,
  onClose,
  onSettings,
  className = ''
}) => {
  return (
    <div className={`relative flex flex-col h-full ${className}`}>
      <DotPattern 
        width={5} 
        height={5} 
        cx={2.5}
        cy={2.5}
        cr={0.5}
        className="absolute inset-0 opacity-5"
      />
      
      <div className="relative z-10 flex items-center justify-between p-3 border-b border-theme-border/20">
        <h3 className="text-sm font-medium text-theme-text-primary">{title}</h3>
        
        <div className="flex items-center space-x-1">
          {onSettings && (
            <button 
              onClick={onSettings}
              className="p-1 text-theme-text-secondary hover:text-theme-accent rounded"
            >
              <Settings size={14} />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-theme-text-secondary hover:text-theme-accent rounded"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      
      <div className="relative z-10 flex-grow p-3 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default Card;