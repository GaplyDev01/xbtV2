import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  BarChart2, 
  Bot, 
  Brain,
  Trophy
} from 'lucide-react';
import '../styles/gooey-menu.css';

interface GooeyMenuProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const GooeyMenu: React.FC<GooeyMenuProps> = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if this is the first visit
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
      localStorage.setItem('hasSeenTutorial', 'true');
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { id: 'dashboard', icon: <Home size={20} />, label: 'Dashboard' },
    { id: 'crypto', icon: <BarChart2 size={20} />, label: 'Crypto Market' },
    { id: 'tradesxbt', icon: <Bot size={20} />, label: 'TradesXBT' },
    { id: 'path', icon: <Trophy size={20} />, label: 'The Path' },
    { id: 'agents', icon: <Brain size={20} />, label: 'AI Agents' }
  ];

  return (
    <>
      <nav className="menu" ref={menuRef}>
        <input 
          type="checkbox" 
          className="menu-open" 
          id="menu-open"
          checked={isOpen}
          onChange={() => {}}
          style={{ display: 'none' }}
        />
        <label 
          className="menu-open-button" 
          onClick={() => setIsOpen(!isOpen)}>
          <span className="hamburger hamburger-1"></span>
          <span className="hamburger hamburger-2"></span>
          <span className="hamburger hamburger-3"></span>
        </label>

        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(item.id);
              setIsOpen(false);
            }}
            aria-label={item.label}
          >
            {item.icon}
          </button>
        ))}
      </nav>

      {/* SVG Filter */}
      <svg className="goo-filter">
        <defs>
          <filter id="goo">
            <feGaussianBlur 
              in="SourceGraphic" 
              stdDeviation="10" 
              result="blur" 
            />
            <feColorMatrix 
              in="blur" 
              mode="matrix" 
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" 
              result="goo" 
            />
            <feBlend 
              in="SourceGraphic" 
              in2="goo" 
            />
          </filter>
        </defs>
      </svg>

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-theme-bg rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-theme-text-primary">Welcome to TradesXBT</h3>
              <button 
                onClick={() => setShowTutorial(false)}
                className="text-theme-text-secondary hover:text-theme-text-primary"
              >
                <span className="sr-only">Close</span>
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-theme-accent/10 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-theme-accent mb-2">Quick Navigation</h4>
                <p className="text-sm text-theme-text-secondary">
                  Use the gooey menu to quickly access different sections of the platform:
                </p>
                <ul className="mt-2 space-y-2">
                  {menuItems.map(item => (
                    <li key={item.id} className="flex items-center text-sm text-theme-text-primary">
                      <span className="p-1 bg-theme-accent/20 rounded-full mr-2">
                        {item.icon}
                      </span>
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-theme-accent/5 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-theme-text-primary mb-2">Getting Started</h4>
                <ul className="text-xs text-theme-text-secondary space-y-1">
                  <li>• Click the menu button to expand navigation options</li>
                  <li>• Use TradesXBT AI for market analysis and insights</li>
                  <li>• Complete challenges on The Path to unlock features</li>
                  <li>• Create custom AI agents to enhance your workflow</li>
                  <li>• Engage with the community to earn rewards</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowTutorial(false)}
                className="bg-theme-accent hover:bg-theme-accent-dark text-theme-bg px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GooeyMenu;