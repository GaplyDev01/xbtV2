import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaHome, FaChartBar, FaRss, FaBell, FaRobot, FaChartLine } from 'react-icons/fa';
import '../styles/gooey-menu.css';

interface GooeyMenuProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const GooeyMenu: React.FC<GooeyMenuProps> = ({ 
  activeTab,
  setActiveTab
}) => {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleItemClick = (id: string) => {
    setActiveTab(id);
    setExpanded(false);
  };

  // Automatically detect active tab based on router path
  useEffect(() => {
    const currentPath = router.pathname;
    const matchingItem = menuItems.find(item => item.path === currentPath);
    if (matchingItem && matchingItem.id !== activeTab) {
      setActiveTab(matchingItem.id);
    }
  }, [router.pathname, setActiveTab, activeTab]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaHome />, path: '/' },
    { id: 'coinlisting', label: 'Coin Listing', icon: <FaChartBar />, path: '/coinlisting' },
    { id: 'feed', label: 'Feed', icon: <FaRss />, path: '/feed' },
    { id: 'trading', label: 'Trading', icon: <FaChartLine />, path: '/trading' },
    { id: 'ai', label: 'AI Assistant', icon: <FaRobot />, path: '/ai' },
    { id: 'notifications', label: 'Notifications', icon: <FaBell />, path: '/notifications' },
  ];
  
  return (
    <div className={`gooey-menu ${expanded ? 'expanded' : ''}`}>
      {/* Toggle button */}
      <button 
        className="menu-toggle"
        onClick={toggleExpanded}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      {/* Menu items */}
      <div className="menu-items">
        {menuItems.map((item) => (
          <Link 
            href={item.path} 
            key={item.id}
            className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => handleItemClick(item.id)}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GooeyMenu;