import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToken } from '../context/TokenContext';
import { useCrypto } from '../context/CryptoContext';
import { useTwitter } from '../context/TwitterContext';
import { useAuth } from '../context/AuthContext';
import { Card } from './ui/card';
import { formatCurrency, formatPercentage } from '../utils/chartUtils';
import { 
  LayoutDashboard, 
  Search, 
  Bot, 
  Briefcase,
  Bell,
  Users,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Activity,
  BarChart2,
  Code,
  MessageSquare,
  Settings,
  HelpCircle
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tokenDetails } = useToken();
  const { globalData, isLoading: isCryptoLoading } = useCrypto();
  const { listTimeline } = useTwitter();
  const [marketStats, setMarketStats] = useState({
    totalMarketCap: 0,
    totalVolume: 0,
    btcDominance: 0,
    marketCapChange: 0
  });

  useEffect(() => {
    if (globalData) {
      setMarketStats({
        totalMarketCap: globalData.total_market_cap?.usd || 0,
        totalVolume: globalData.total_volume?.usd || 0,
        btcDominance: globalData.market_cap_percentage?.btc || 0,
        marketCapChange: globalData.market_cap_change_percentage_24h_usd || 0
      });
    }
  }, [globalData]);

  const platformFeatures = [
    {
      title: 'Explore Tokens',
      description: 'Search and analyze any cryptocurrency',
      icon: <Search className="text-theme-accent" size={24} />,
      path: '/explore',
      stats: `${formatCurrency(marketStats.totalMarketCap, 'USD', true)} Total Market Cap`
    },
    {
      title: 'AI Assistant',
      description: 'Get AI-powered market insights',
      icon: <Bot className="text-theme-accent" size={24} />,
      path: '/xbt-hud',
      stats: `${listTimeline?.length || 0} Market Updates Today`
    },
    {
      title: 'Portfolio',
      description: 'Track your crypto holdings',
      icon: <Briefcase className="text-theme-accent" size={24} />,
      path: '/portfolio',
      stats: 'View Your Holdings'
    },
    {
      title: 'Price Alerts',
      description: 'Set up custom price notifications',
      icon: <Bell className="text-theme-accent" size={24} />,
      path: '/alerts',
      stats: 'Manage Your Alerts'
    }
  ];

  const quickActions = [
    {
      title: 'Market Overview',
      icon: <Activity size={20} />,
      onClick: () => navigate('/explore')
    },
    {
      title: 'Technical Analysis',
      icon: <BarChart2 size={20} />,
      onClick: () => navigate('/explore')
    },
    {
      title: 'Developer Stats',
      icon: <Code size={20} />,
      onClick: () => navigate('/explore')
    },
    {
      title: 'Community',
      icon: <Users size={20} />,
      onClick: () => navigate('/help')
    }
  ];

  const helpResources = [
    {
      title: 'Documentation',
      icon: <HelpCircle size={20} />,
      description: 'Learn how to use the platform',
      path: '/help'
    },
    {
      title: 'Settings',
      icon: <Settings size={20} />,
      description: 'Configure your preferences',
      path: '/settings'
    },
    {
      title: 'Community Chat',
      icon: <MessageSquare size={20} />,
      description: 'Join the discussion',
      path: '/help'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-theme-bg rounded-lg border border-theme-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-theme-text-primary">
              Welcome back, {user?.email?.split('@')[0]}
            </h1>
            <p className="text-theme-text-secondary mt-1">
              Your crypto dashboard is ready
            </p>
          </div>
          <div className={`text-lg font-semibold flex items-center ${
            marketStats.marketCapChange >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {marketStats.marketCapChange >= 0 ? (
              <TrendingUp size={24} className="mr-2" />
            ) : (
              <TrendingDown size={24} className="mr-2" />
            )}
            {formatPercentage(marketStats.marketCapChange)}
          </div>
        </div>

        {/* Platform Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {platformFeatures.map((feature) => (
            <button
              key={feature.title}
              onClick={() => navigate(feature.path)}
              className="bg-theme-bg border border-theme-border rounded-lg p-4 hover:border-theme-accent transition-colors text-left"
            >
              <div className="flex items-center justify-between mb-3">
                {feature.icon}
                <ChevronRight size={20} className="text-theme-text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-theme-text-primary mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-theme-text-secondary mb-3">
                {feature.description}
              </p>
              <div className="text-xs text-theme-accent">
                {feature.stats}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-theme-bg rounded-lg border border-theme-border p-6">
          <h2 className="text-lg font-semibold text-theme-text-primary mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.title}
                onClick={action.onClick}
                className="flex items-center p-3 bg-theme-accent/10 rounded-lg hover:bg-theme-accent/20 transition-colors"
              >
                <span className="p-2 bg-theme-accent/20 rounded-lg mr-3">
                  {action.icon}
                </span>
                <span className="text-sm font-medium">{action.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-theme-bg rounded-lg border border-theme-border p-6">
          <h2 className="text-lg font-semibold text-theme-text-primary mb-4">
            Help & Resources
          </h2>
          <div className="space-y-3">
            {helpResources.map((resource) => (
              <button
                key={resource.title}
                onClick={() => navigate(resource.path)}
                className="w-full flex items-center justify-between p-3 bg-theme-accent/10 rounded-lg hover:bg-theme-accent/20 transition-colors"
              >
                <div className="flex items-center">
                  <span className="p-2 bg-theme-accent/20 rounded-lg mr-3">
                    {resource.icon}
                  </span>
                  <div className="text-left">
                    <div className="text-sm font-medium">{resource.title}</div>
                    <div className="text-xs text-theme-text-secondary">
                      {resource.description}
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-theme-text-secondary" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Market Overview */}
      <div className="bg-theme-bg rounded-lg border border-theme-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-theme-text-primary">
            Market Overview
          </h2>
          <button
            onClick={() => navigate('/explore')}
            className="text-theme-accent hover:text-theme-accent-dark flex items-center text-sm"
          >
            View All Markets
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-theme-accent/10 rounded-lg p-4">
            <div className="text-sm text-theme-text-secondary mb-1">
              Total Market Cap
            </div>
            <div className="text-lg font-semibold text-theme-text-primary">
              {formatCurrency(marketStats.totalMarketCap, 'USD', true)}
            </div>
          </div>
          <div className="bg-theme-accent/10 rounded-lg p-4">
            <div className="text-sm text-theme-text-secondary mb-1">
              24h Volume
            </div>
            <div className="text-lg font-semibold text-theme-text-primary">
              {formatCurrency(marketStats.totalVolume, 'USD', true)}
            </div>
          </div>
          <div className="bg-theme-accent/10 rounded-lg p-4">
            <div className="text-sm text-theme-text-secondary mb-1">
              BTC Dominance
            </div>
            <div className="text-lg font-semibold text-theme-text-primary">
              {formatPercentage(marketStats.btcDominance)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;