import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  fetchTradingActivity, 
  fetchWalletAnalysis, 
  fetchMarketTrends,
  fetchTokenPerformance,
  fetchTradingVolume,
  fetchUserEngagement
} from '../../api/duneAnalytics';

// Custom colors for charts
const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', 
  '#FFBB28', '#FF8042', '#0088FE', '#00C49F', '#FFBB28'
];

// Component to display Dune Analytics data
const DuneAnalytics: React.FC = () => {
  // State for each type of analytics data
  const [tradingActivity, setTradingActivity] = useState<any[]>([]);
  const [walletAnalysis, setWalletAnalysis] = useState<any[]>([]);
  const [marketTrends, setMarketTrends] = useState<any[]>([]);
  const [tokenPerformance, setTokenPerformance] = useState<any[]>([]);
  const [tradingVolume, setTradingVolume] = useState<any[]>([]);
  const [userEngagement, setUserEngagement] = useState<any[]>([]);
  
  // Loading and error states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Active tab state
  const [activeTab, setActiveTab] = useState<string>('trading');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch data from all endpoints in parallel
        const [
          tradingActivityData,
          walletAnalysisData,
          marketTrendsData,
          tokenPerformanceData,
          tradingVolumeData,
          userEngagementData
        ] = await Promise.all([
          fetchTradingActivity(),
          fetchWalletAnalysis(),
          fetchMarketTrends(),
          fetchTokenPerformance(),
          fetchTradingVolume(),
          fetchUserEngagement()
        ]);
        
        // Process and set the data
        if (tradingActivityData?.result?.rows) {
          setTradingActivity(tradingActivityData.result.rows);
        }
        
        if (walletAnalysisData?.result?.rows) {
          setWalletAnalysis(walletAnalysisData.result.rows);
        }
        
        if (marketTrendsData?.result?.rows) {
          setMarketTrends(marketTrendsData.result.rows);
        }
        
        if (tokenPerformanceData?.result?.rows) {
          setTokenPerformance(tokenPerformanceData.result.rows);
        }
        
        if (tradingVolumeData?.result?.rows) {
          setTradingVolume(tradingVolumeData.result.rows);
        }
        
        if (userEngagementData?.result?.rows) {
          setUserEngagement(userEngagementData.result.rows);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching Dune Analytics data:', err);
        setError('Failed to fetch analytics data');
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);
  
  // Formatting functions
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };
  
  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };
  
  // Tab rendering functions
  const renderTradingActivityTab = () => {
    const recentActivity = tradingActivity.slice(0, 30).reverse(); // Get last 30 days, in chronological order
    
    return (
      <div className="space-y-8">
        <div className="bg-theme-bg-secondary p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Trading Activity (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={recentActivity}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'volume') return [formatCurrency(Number(value)), 'Volume'];
                  if (name === 'transactions') return [formatNumber(Number(value)), 'Transactions'];
                  return [value, name];
                }}
              />
              <Legend />
              <Area 
                yAxisId="left" 
                type="monotone" 
                dataKey="volume_usd" 
                name="Volume" 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.3} 
              />
              <Area 
                yAxisId="right" 
                type="monotone" 
                dataKey="transactions" 
                name="Transactions" 
                stroke="#82ca9d" 
                fill="#82ca9d" 
                fillOpacity={0.3} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-theme-bg-secondary p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Daily Traders vs Avg Trade Size</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={recentActivity}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'Traders') return [formatNumber(Number(value)), 'Traders'];
                  if (name === 'Avg Trade Size') return [formatCurrency(Number(value)), 'Avg Trade Size'];
                  return [value, name];
                }}
              />
              <Legend />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="unique_traders" 
                name="Traders" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="avg_trade_size" 
                name="Avg Trade Size" 
                stroke="#82ca9d" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };
  
  const renderWalletAnalysisTab = () => {
    // Sort by transaction count for the table
    const sortedWallets = [...walletAnalysis].sort((a, b) => b.transaction_count - a.transaction_count).slice(0, 10);
    
    // Group by volume for the pie chart
    const volumeGroups = [
      { name: '$1K-$10K', value: 0 },
      { name: '$10K-$100K', value: 0 },
      { name: '$100K-$1M', value: 0 },
      { name: '$1M+', value: 0 }
    ];
    
    walletAnalysis.forEach(wallet => {
      const volume = wallet.volume_usd;
      if (volume >= 1000000) {
        volumeGroups[3].value++;
      } else if (volume >= 100000) {
        volumeGroups[2].value++;
      } else if (volume >= 10000) {
        volumeGroups[1].value++;
      } else {
        volumeGroups[0].value++;
      }
    });
    
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-theme-bg-secondary p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Wallet Volume Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={volumeGroups}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {volumeGroups.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Wallets']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-theme-bg-secondary p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Top Wallets by Transaction Count</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={sortedWallets}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="wallet_address" 
                  tickFormatter={(value) => `${value.substring(0, 6)}...${value.substring(value.length - 4)}`}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'transaction_count') return [formatNumber(Number(value)), 'Transactions'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Wallet: ${label.substring(0, 6)}...${label.substring(label.length - 4)}`}
                />
                <Legend />
                <Bar dataKey="transaction_count" name="Transactions" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-theme-bg-secondary p-4 rounded-lg overflow-x-auto">
          <h3 className="text-lg font-medium mb-4">Top Active Wallets</h3>
          <table className="w-full">
            <thead className="bg-theme-bg">
              <tr>
                <th className="p-2 text-left">Wallet</th>
                <th className="p-2 text-right">Transactions</th>
                <th className="p-2 text-right">Volume</th>
                <th className="p-2 text-left">First Trade</th>
                <th className="p-2 text-left">Last Trade</th>
              </tr>
            </thead>
            <tbody>
              {sortedWallets.map((wallet, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-theme-bg-secondary' : 'bg-theme-bg'}>
                  <td className="p-2 text-left">{`${wallet.wallet_address.substring(0, 6)}...${wallet.wallet_address.substring(wallet.wallet_address.length - 4)}`}</td>
                  <td className="p-2 text-right">{formatNumber(wallet.transaction_count)}</td>
                  <td className="p-2 text-right">{formatCurrency(wallet.volume_usd)}</td>
                  <td className="p-2 text-left">{new Date(wallet.first_trade).toLocaleDateString()}</td>
                  <td className="p-2 text-left">{new Date(wallet.last_trade).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  const renderMarketTrendsTab = () => {
    const recentTrends = marketTrends.slice(0, 30).reverse(); // Get last 30 days, in chronological order
    
    return (
      <div className="space-y-8">
        <div className="bg-theme-bg-secondary p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Price and Market Cap Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={recentTrends}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'Price') return [`$${Number(value).toFixed(2)}`, 'Price'];
                  if (name === 'Market Cap') return [formatCurrency(Number(value)), 'Market Cap'];
                  return [value, name];
                }}
              />
              <Legend />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="price" 
                name="Price" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="market_cap" 
                name="Market Cap" 
                stroke="#82ca9d" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-theme-bg-secondary p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Volume and Price Change</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={recentTrends}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'Volume') return [formatCurrency(Number(value)), 'Volume'];
                  if (name === 'Change %') return [`${Number(value).toFixed(2)}%`, 'Change %'];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar 
                yAxisId="left" 
                dataKey="volume_24h" 
                name="Volume" 
                fill="#8884d8" 
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="change_percent" 
                name="Change %" 
                stroke="#82ca9d" 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };
  
  const renderTokenPerformanceTab = () => {
    // Get top 10 tokens by price
    const topTokens = [...tokenPerformance]
      .filter((token, index, self) => 
        index === self.findIndex(t => t.token === token.token)
      )
      .sort((a, b) => b.price_usd - a.price_usd)
      .slice(0, 10);
    
    return (
      <div className="space-y-8">
        <div className="bg-theme-bg-secondary p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Token Price Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={topTokens}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="token" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'Price') return [`$${Number(value).toFixed(2)}`, 'Price'];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar dataKey="price_usd" name="Price" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-theme-bg-secondary p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Token Performance Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={topTokens}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="token" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  return [`${Number(value).toFixed(2)}%`, name];
                }}
              />
              <Legend />
              <Bar dataKey="daily_change" name="Daily Change" fill="#8884d8" />
              <Bar dataKey="weekly_change" name="Weekly Change" fill="#82ca9d" />
              <Bar dataKey="monthly_change" name="Monthly Change" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-theme-bg-secondary p-4 rounded-lg overflow-x-auto">
          <h3 className="text-lg font-medium mb-4">Token Performance Summary</h3>
          <table className="w-full">
            <thead className="bg-theme-bg">
              <tr>
                <th className="p-2 text-left">Token</th>
                <th className="p-2 text-right">Price</th>
                <th className="p-2 text-right">Daily Change</th>
                <th className="p-2 text-right">Weekly Change</th>
                <th className="p-2 text-right">Monthly Change</th>
              </tr>
            </thead>
            <tbody>
              {topTokens.map((token, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-theme-bg-secondary' : 'bg-theme-bg'}>
                  <td className="p-2 text-left">{token.token}</td>
                  <td className="p-2 text-right">${token.price_usd.toFixed(2)}</td>
                  <td className={`p-2 text-right ${token.daily_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {token.daily_change.toFixed(2)}%
                  </td>
                  <td className={`p-2 text-right ${token.weekly_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {token.weekly_change.toFixed(2)}%
                  </td>
                  <td className={`p-2 text-right ${token.monthly_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {token.monthly_change.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  const renderTradingVolumeTab = () => {
    // Get volume by DEX
    const volumeByDex = tradingVolume.reduce((acc, item) => {
      if (!acc[item.dex]) {
        acc[item.dex] = 0;
      }
      acc[item.dex] += item.volume_usd;
      return acc;
    }, {} as Record<string, number>);
    
    const dexVolumeData = Object.entries(volumeByDex).map(([dex, volume]) => ({
      dex,
      volume
    })).sort((a, b) => b.volume - a.volume);
    
    // Get recent trading volume
    const recentVolume = tradingVolume
      .filter((value, index, self) => 
        index === self.findIndex(t => t.date === value.date)
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);
    
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-theme-bg-secondary p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Volume by DEX</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dexVolumeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="volume"
                  nameKey="dex"
                >
                  {dexVolumeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Volume']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-theme-bg-secondary p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Daily Trading Volume Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={recentVolume}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Volume']} />
                <Legend />
                <Line type="monotone" dataKey="volume_usd" name="Volume" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-theme-bg-secondary p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Trades Count vs Unique Users</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={recentVolume}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'Trades') return [formatNumber(Number(value)), 'Trades'];
                  if (name === 'Users') return [formatNumber(Number(value)), 'Users'];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="trades_count" name="Trades" fill="#8884d8" />
              <Bar yAxisId="right" dataKey="unique_users" name="Users" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };
  
  const renderUserEngagementTab = () => {
    const recentEngagement = userEngagement.slice(0, 30).reverse(); // Get last 30 days, in chronological order
    
    return (
      <div className="space-y-8">
        <div className="bg-theme-bg-secondary p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Daily Active Users</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={recentEngagement}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [formatNumber(Number(value)), 'Users']} />
              <Legend />
              <Area type="monotone" dataKey="active_users" name="Active Users" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
              <Area type="monotone" dataKey="new_users" name="New Users" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-theme-bg-secondary p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">User Retention & Session Duration</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={recentEngagement}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'Retention Rate') return [`${(Number(value) * 100).toFixed(2)}%`, 'Retention Rate'];
                  if (name === 'Avg Session (sec)') return [`${Number(value).toFixed(0)} sec`, 'Avg Session'];
                  return [value, name];
                }}
              />
              <Legend />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="retention_rate" 
                name="Retention Rate" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="avg_session_duration" 
                name="Avg Session (sec)" 
                stroke="#82ca9d" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };
  
  if (loading) {
    return <div className="flex justify-center items-center p-8">Loading Dune Analytics data...</div>;
  }
  
  if (error) {
    return <div className="text-red-500 p-8">{error}</div>;
  }
  
  return (
    <div className="bg-theme-bg rounded-lg border border-theme-border p-6">
      <h2 className="text-2xl font-bold mb-6">Solana Network Analytics</h2>
      <p className="text-theme-text-secondary mb-6">Comprehensive analysis of Solana ecosystem powered by Dune Analytics</p>
      
      {/* Tabs */}
      <div className="flex flex-wrap border-b border-theme-border mb-6">
        <button 
          className={`px-4 py-2 mr-2 ${activeTab === 'trading' ? 'border-b-2 border-theme-primary font-medium' : 'text-theme-text-secondary'}`}
          onClick={() => setActiveTab('trading')}
        >
          Trading Activity
        </button>
        <button 
          className={`px-4 py-2 mr-2 ${activeTab === 'wallet' ? 'border-b-2 border-theme-primary font-medium' : 'text-theme-text-secondary'}`}
          onClick={() => setActiveTab('wallet')}
        >
          Wallet Analysis
        </button>
        <button 
          className={`px-4 py-2 mr-2 ${activeTab === 'market' ? 'border-b-2 border-theme-primary font-medium' : 'text-theme-text-secondary'}`}
          onClick={() => setActiveTab('market')}
        >
          Market Trends
        </button>
        <button 
          className={`px-4 py-2 mr-2 ${activeTab === 'token' ? 'border-b-2 border-theme-primary font-medium' : 'text-theme-text-secondary'}`}
          onClick={() => setActiveTab('token')}
        >
          Token Performance
        </button>
        <button 
          className={`px-4 py-2 mr-2 ${activeTab === 'volume' ? 'border-b-2 border-theme-primary font-medium' : 'text-theme-text-secondary'}`}
          onClick={() => setActiveTab('volume')}
        >
          Trading Volume
        </button>
        <button 
          className={`px-4 py-2 mr-2 ${activeTab === 'users' ? 'border-b-2 border-theme-primary font-medium' : 'text-theme-text-secondary'}`}
          onClick={() => setActiveTab('users')}
        >
          User Engagement
        </button>
      </div>
      
      {/* Tab content */}
      <div className="mt-6">
        {activeTab === 'trading' && renderTradingActivityTab()}
        {activeTab === 'wallet' && renderWalletAnalysisTab()}
        {activeTab === 'market' && renderMarketTrendsTab()}
        {activeTab === 'token' && renderTokenPerformanceTab()}
        {activeTab === 'volume' && renderTradingVolumeTab()}
        {activeTab === 'users' && renderUserEngagementTab()}
      </div>
      
      <div className="mt-8 text-sm text-theme-text-secondary">
        <p>Source: Dune Analytics queries #4893631, #4894306, #4124453, #4832613, #4832245, #4832844</p>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default DuneAnalytics; 