import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Loader2, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  amount: number;
  value: number;
  price: number;
  change24h: number;
  color: string;
  platform: 'ethereum' | 'solana' | 'bitcoin' | 'polkadot';
}

interface PortfolioOverviewProps {
  className?: string;
  defaultTab?: string;
  walletAddresses?: Record<string, string>;
  onConnectWallet?: (platform: string) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2', '#48C9B0', '#F4D03F'];

const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({
  className = '',
  defaultTab = 'all',
  walletAddresses = {},
  onConnectWallet
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalValue, setTotalValue] = useState(0);
  const [totalChange, setTotalChange] = useState(0);
  
  // Filter assets based on active tab
  const filteredAssets = activeTab === 'all' 
    ? assets 
    : assets.filter(asset => asset.platform === activeTab);

  // Calculate platform totals
  const platformTotals = {
    ethereum: assets.filter(a => a.platform === 'ethereum').reduce((sum, asset) => sum + asset.value, 0),
    solana: assets.filter(a => a.platform === 'solana').reduce((sum, asset) => sum + asset.value, 0),
    bitcoin: assets.filter(a => a.platform === 'bitcoin').reduce((sum, asset) => sum + asset.value, 0),
    polkadot: assets.filter(a => a.platform === 'polkadot').reduce((sum, asset) => sum + asset.value, 0),
  };

  useEffect(() => {
    const fetchPortfolioData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real implementation, you would call wallet APIs for each platform
        // This is a mock implementation with dummy data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockAssets: Asset[] = [
          // Ethereum assets
          {
            id: 'eth',
            name: 'Ethereum',
            symbol: 'ETH',
            amount: 1.24,
            price: 2856.12,
            value: 3541.59,
            change24h: 3.21,
            color: COLORS[0],
            platform: 'ethereum'
          },
          {
            id: 'link',
            name: 'Chainlink',
            symbol: 'LINK',
            amount: 45.5,
            price: 13.76,
            value: 626.08,
            change24h: 2.45,
            color: COLORS[1],
            platform: 'ethereum'
          },
          
          // Solana assets
          {
            id: 'sol',
            name: 'Solana',
            symbol: 'SOL',
            amount: 12.5,
            price: 101.85,
            value: 1273.13,
            change24h: 5.67,
            color: COLORS[2],
            platform: 'solana'
          },
          
          // Bitcoin assets
          {
            id: 'btc',
            name: 'Bitcoin',
            symbol: 'BTC',
            amount: 0.12,
            price: 52361.23,
            value: 6283.35,
            change24h: 2.53,
            color: COLORS[3],
            platform: 'bitcoin'
          },
          
          // Polkadot assets
          {
            id: 'dot',
            name: 'Polkadot',
            symbol: 'DOT',
            amount: 58.3,
            price: 6.87,
            value: 400.52,
            change24h: 4.12,
            color: COLORS[4],
            platform: 'polkadot'
          },
        ];
        
        setAssets(mockAssets);
        
        // Calculate totals
        const total = mockAssets.reduce((sum, asset) => sum + asset.value, 0);
        setTotalValue(total);
        
        const weightedChange = mockAssets.reduce((sum, asset) => {
          const weight = asset.value / total;
          return sum + (asset.change24h * weight);
        }, 0);
        setTotalChange(weightedChange);
      } catch (err) {
        console.error('Error fetching portfolio data:', err);
        setError('Failed to fetch portfolio data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPortfolioData();
  }, [walletAddresses]);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };
  
  const getConnectButton = (platform: string) => {
    return (
      <div className="mt-8 flex flex-col items-center justify-center">
        <p className="text-theme-text-secondary mb-4">
          Connect your {platform} wallet to view your assets
        </p>
        <button
          onClick={() => onConnectWallet && onConnectWallet(platform)}
          className="px-4 py-2 bg-theme-accent text-white rounded-lg hover:bg-theme-accent-hover transition-colors"
        >
          Connect {platform.charAt(0).toUpperCase() + platform.slice(1)} Wallet
        </button>
      </div>
    );
  };

  return (
    <div className={`bg-theme-bg border border-theme-border rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-medium mb-4">Portfolio Overview</h3>
      
      <Tabs defaultValue={defaultTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all" className="text-sm">
            All
          </TabsTrigger>
          <TabsTrigger value="ethereum" className="text-sm">
            Ethereum
          </TabsTrigger>
          <TabsTrigger value="solana" className="text-sm">
            Solana
          </TabsTrigger>
          <TabsTrigger value="bitcoin" className="text-sm">
            Bitcoin
          </TabsTrigger>
          <TabsTrigger value="polkadot" className="text-sm">
            Polkadot
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="text-theme-accent animate-spin" />
              <span className="ml-2 text-theme-text-secondary">Loading portfolio...</span>
            </div>
          ) : error ? (
            <Alert variant="warning">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : assets.length === 0 ? (
            <div className="text-center py-8 text-theme-text-secondary">
              <p>No assets found. Connect your wallets to view your portfolio.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="overview">
                <div className="mb-4">
                  <div className="text-sm text-theme-text-secondary">Total Portfolio Value</div>
                  <div className="text-2xl font-semibold">{formatCurrency(totalValue)}</div>
                  <div className={`text-sm ${totalChange >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                    {totalChange >= 0 ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
                    {formatPercent(totalChange)} (24h)
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="text-sm text-theme-text-secondary mb-2">Allocation by Platform</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(platformTotals).map(([platform, value]) => (
                      <div key={platform} className="flex justify-between items-center p-2 rounded-lg bg-theme-bg-secondary">
                        <span className="capitalize">{platform}</span>
                        <span>{((value / totalValue) * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="chart-container h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assets}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {assets.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Value']} 
                      labelFormatter={(index: number) => assets[index].name}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {!isLoading && !error && assets.length > 0 && (
            <div className="mt-4">
              <div className="text-sm text-theme-text-secondary mb-2">Assets</div>
              <div className="space-y-2">
                {assets.map((asset) => (
                  <div key={asset.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-theme-bg-secondary">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full" style={{ backgroundColor: asset.color }} />
                      <div className="ml-2">
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-sm text-theme-text-secondary">{asset.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div>{formatCurrency(asset.value)}</div>
                      <div className={`text-sm ${asset.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatPercent(asset.change24h)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
        
        {['ethereum', 'solana', 'bitcoin', 'polkadot'].map((platform) => (
          <TabsContent key={platform} value={platform} className="mt-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="text-theme-accent animate-spin" />
                <span className="ml-2 text-theme-text-secondary">Loading {platform} assets...</span>
              </div>
            ) : error ? (
              <Alert variant="warning">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : !walletAddresses[platform] ? (
              getConnectButton(platform)
            ) : filteredAssets.length === 0 ? (
              <div className="text-center py-8 text-theme-text-secondary">
                <p>No {platform} assets found in your wallet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAssets.map((asset) => (
                  <div key={asset.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-theme-bg-secondary">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full" style={{ backgroundColor: asset.color }} />
                      <div className="ml-2">
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-sm text-theme-text-secondary">{asset.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-theme-text-secondary">{asset.amount} {asset.symbol}</div>
                      <div>{formatCurrency(asset.value)}</div>
                      <div className={`text-sm ${asset.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatPercent(asset.change24h)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
      
      <div className="mt-4 pt-4 border-t border-theme-border flex items-center justify-between text-xs text-theme-text-secondary">
        <span>Last updated: {new Date().toLocaleTimeString()}</span>
        <div className="flex items-center">
          <Info size={14} className="mr-1" />
          <span>Prices from CoinGecko API</span>
        </div>
      </div>
    </div>
  );
};

export default PortfolioOverview;
