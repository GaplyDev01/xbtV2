import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Loader2, Code, Database, Activity } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface ApiEndpoint {
  name: string;
  endpoint: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  parameters: string[];
  responseExample: string;
  platform: 'ethereum' | 'solana' | 'bitcoin' | 'polkadot';
}

interface UserMetric {
  name: string;
  value: number;
  change: number;
  period: 'day' | 'week' | 'month';
  platform: 'ethereum' | 'solana' | 'bitcoin' | 'polkadot';
}

interface DeveloperDashboardProps {
  className?: string;
  defaultTab?: string;
}

const DeveloperDashboard: React.FC<DeveloperDashboardProps> = ({
  className = '',
  defaultTab = 'apis'
}) => {
  // Use setActiveTab when needed in future implementations
  const [_, setActiveTab] = useState(defaultTab);
  const [isLoading, setIsLoading] = useState(true);
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([]);
  const [userMetrics, setUserMetrics] = useState<UserMetric[]>([]);
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDeveloperData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real implementation, we would fetch from actual API
        // This is a mock implementation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock API endpoints
        const mockApiEndpoints: ApiEndpoint[] = [
          {
            name: 'Token Balances',
            endpoint: '/api/v1/eth/balances/:address',
            description: 'Retrieve token balances for an Ethereum address',
            method: 'GET',
            parameters: ['address', 'includeNFTs', 'includeERC20'],
            responseExample: '{"address": "0x123...", "balances": [{"token": "ETH", "balance": "1.5"}]}',
            platform: 'ethereum'
          },
          {
            name: 'Transaction History',
            endpoint: '/api/v1/eth/transactions/:address',
            description: 'Retrieve transaction history for an Ethereum address',
            method: 'GET',
            parameters: ['address', 'startBlock', 'endBlock', 'limit'],
            responseExample: '{"transactions": [{"hash": "0x123...", "value": "0.5", "timestamp": 1615482912}]}',
            platform: 'ethereum'
          },
          {
            name: 'Solana Account Info',
            endpoint: '/api/v1/sol/account/:address',
            description: 'Get Solana account details',
            method: 'GET',
            parameters: ['address', 'commitment'],
            responseExample: '{"lamports": 100000, "owner": "11111...", "executable": false}',
            platform: 'solana'
          },
          {
            name: 'BTC UTXO Set',
            endpoint: '/api/v1/btc/utxo/:address',
            description: 'Get unspent transaction outputs for a Bitcoin address',
            method: 'GET',
            parameters: ['address', 'confirmations'],
            responseExample: '{"utxos": [{"txid": "abc123...", "vout": 0, "value": 0.1}]}',
            platform: 'bitcoin'
          },
          {
            name: 'Polkadot Staking Info',
            endpoint: '/api/v1/dot/staking/:address',
            description: 'Get staking information for a Polkadot address',
            method: 'GET',
            parameters: ['address', 'era'],
            responseExample: '{"bonded": 100, "rewardDestination": "Staked", "nominators": []}',
            platform: 'polkadot'
          },
        ];
        
        // Mock user metrics
        const mockUserMetrics: UserMetric[] = [
          {
            name: 'Daily Active Addresses',
            value: 1250000,
            change: 5.2,
            period: 'day',
            platform: 'ethereum'
          },
          {
            name: 'New Wallets',
            value: 25600,
            change: 3.7,
            period: 'day',
            platform: 'ethereum'
          },
          {
            name: 'Average Transaction Value',
            value: 0.25,
            change: -1.2,
            period: 'day',
            platform: 'ethereum'
          },
          {
            name: 'Daily Active Addresses',
            value: 850000,
            change: 8.7,
            period: 'day',
            platform: 'solana'
          },
          {
            name: 'New Wallets',
            value: 42300,
            change: 12.3,
            period: 'day',
            platform: 'solana'
          },
          {
            name: 'Daily Active Addresses',
            value: 950000,
            change: 1.5,
            period: 'day',
            platform: 'bitcoin'
          },
          {
            name: 'Daily Active Addresses',
            value: 125000,
            change: 15.2,
            period: 'day',
            platform: 'polkadot'
          },
        ];
        
        setApiEndpoints(mockApiEndpoints);
        setUserMetrics(mockUserMetrics);
      } catch (err) {
        console.error('Error fetching developer data:', err);
        setError('Failed to fetch developer data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDeveloperData();
  }, []);
  
  const filteredApiEndpoints = platformFilter === 'all' 
    ? apiEndpoints 
    : apiEndpoints.filter(endpoint => endpoint.platform === platformFilter);
    
  const filteredUserMetrics = platformFilter === 'all'
    ? userMetrics
    : userMetrics.filter(metric => metric.platform === platformFilter);
  
  const formatNumber = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    } else {
      return value.toString();
    }
  };

  return (
    <div className={`bg-theme-bg border border-theme-border rounded-lg p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Developer Dashboard</h3>
        <div className="flex space-x-2">
          <select
            className="text-sm bg-theme-bg-secondary border border-theme-border rounded-md p-1"
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
          >
            <option value="all">All Platforms</option>
            <option value="ethereum">Ethereum</option>
            <option value="solana">Solana</option>
            <option value="bitcoin">Bitcoin</option>
            <option value="polkadot">Polkadot</option>
          </select>
        </div>
      </div>
      
      <Tabs defaultValue={defaultTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="apis" className="text-sm flex items-center">
            <Code size={16} className="mr-2" /> API Reference
          </TabsTrigger>
          <TabsTrigger value="metrics" className="text-sm flex items-center">
            <Activity size={16} className="mr-2" /> User Metrics
          </TabsTrigger>
          <TabsTrigger value="integration" className="text-sm flex items-center">
            <Database size={16} className="mr-2" /> Integration
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="apis" className="mt-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="text-theme-accent animate-spin" />
              <span className="ml-2 text-theme-text-secondary">Loading API reference...</span>
            </div>
          ) : error ? (
            <Alert variant="warning">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : filteredApiEndpoints.length === 0 ? (
            <div className="text-center py-8 text-theme-text-secondary">
              <p>No API endpoints found for the selected platform.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApiEndpoints.map((endpoint, index) => (
                <div key={index} className="border border-theme-border rounded-lg p-3 hover:bg-theme-bg-secondary">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{endpoint.name}</h4>
                      <div className="text-sm text-theme-text-secondary">{endpoint.description}</div>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-theme-bg-secondary capitalize">
                      {endpoint.platform}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${endpoint.method === 'GET' ? 'bg-green-500/10 text-green-500' : 
                                      endpoint.method === 'POST' ? 'bg-blue-500/10 text-blue-500' : 
                                      endpoint.method === 'PUT' ? 'bg-yellow-500/10 text-yellow-500' : 
                                      'bg-red-500/10 text-red-500'}`}>
                      {endpoint.method}
                    </span>
                    <code className="px-2 py-1 bg-theme-bg-secondary rounded text-xs">
                      {endpoint.endpoint}
                    </code>
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-xs text-theme-text-secondary mb-1">Parameters:</div>
                    <div className="flex flex-wrap gap-1">
                      {endpoint.parameters.map((param, i) => (
                        <span key={i} className="px-2 py-1 text-xs rounded-full bg-theme-bg-secondary">
                          {param}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-theme-text-secondary mb-1">Example Response:</div>
                    <pre className="text-xs bg-theme-bg-secondary p-2 rounded overflow-x-auto">
                      {endpoint.responseExample}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="metrics" className="mt-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="text-theme-accent animate-spin" />
              <span className="ml-2 text-theme-text-secondary">Loading user metrics...</span>
            </div>
          ) : error ? (
            <Alert variant="warning">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : filteredUserMetrics.length === 0 ? (
            <div className="text-center py-8 text-theme-text-secondary">
              <p>No user metrics found for the selected platform.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredUserMetrics.map((metric, index) => (
                <div key={index} className="border border-theme-border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-theme-text-secondary text-sm">{metric.name}</h4>
                    <span className="text-xs px-2 py-1 rounded-full bg-theme-bg-secondary capitalize">
                      {metric.platform}
                    </span>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-semibold mr-2">{formatNumber(metric.value)}</span>
                    <span className={`text-sm ${metric.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {metric.change >= 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                  <div className="text-xs text-theme-text-secondary mt-1">
                    vs. previous {metric.period}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4">
            <button className="w-full py-2 border border-theme-border rounded-lg text-sm hover:bg-theme-bg-secondary">
              Download Complete Analytics Report
            </button>
          </div>
        </TabsContent>
        
        <TabsContent value="integration" className="mt-2">
          <div className="space-y-4">
            <div className="mb-4">
              <h4 className="font-medium mb-2">Integration Options</h4>
              <p className="text-sm text-theme-text-secondary mb-4">
                Choose from multiple integration methods to incorporate our blockchain data into your applications.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-theme-border rounded-lg p-4 hover:bg-theme-bg-secondary cursor-pointer">
                  <h5 className="font-medium mb-1">REST API</h5>
                  <p className="text-xs text-theme-text-secondary mb-2">
                    Standard HTTP endpoints for straightforward integration with any application.
                  </p>
                  <div className="text-xs px-2 py-1 inline-block rounded-full bg-green-500/10 text-green-500">
                    Documentation Available
                  </div>
                </div>
                
                <div className="border border-theme-border rounded-lg p-4 hover:bg-theme-bg-secondary cursor-pointer">
                  <h5 className="font-medium mb-1">GraphQL API</h5>
                  <p className="text-xs text-theme-text-secondary mb-2">
                    Query exactly what you need with our flexible GraphQL interface.
                  </p>
                  <div className="text-xs px-2 py-1 inline-block rounded-full bg-green-500/10 text-green-500">
                    Documentation Available
                  </div>
                </div>
                
                <div className="border border-theme-border rounded-lg p-4 hover:bg-theme-bg-secondary cursor-pointer">
                  <h5 className="font-medium mb-1">WebSocket Streams</h5>
                  <p className="text-xs text-theme-text-secondary mb-2">
                    Real-time data streams for live updates and notifications.
                  </p>
                  <div className="text-xs px-2 py-1 inline-block rounded-full bg-yellow-500/10 text-yellow-500">
                    Beta
                  </div>
                </div>
                
                <div className="border border-theme-border rounded-lg p-4 hover:bg-theme-bg-secondary cursor-pointer">
                  <h5 className="font-medium mb-1">SDK Libraries</h5>
                  <p className="text-xs text-theme-text-secondary mb-2">
                    Ready-to-use libraries for popular languages including JavaScript, Python, and Go.
                  </p>
                  <div className="text-xs px-2 py-1 inline-block rounded-full bg-green-500/10 text-green-500">
                    Multiple Languages
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Implementation Examples</h4>
              
              <div className="mb-3">
                <div className="text-sm font-medium mb-1">JavaScript/TypeScript</div>
                <pre className="text-xs bg-theme-bg-secondary p-3 rounded overflow-x-auto">
{`import { BlockchainClient } from '@blockchain-platform/sdk';

const client = new BlockchainClient({
  apiKey: 'YOUR_API_KEY',
  platform: 'ethereum'
});

// Get token balances
const balances = await client.getTokenBalances('0x1234...');
console.log(balances);`}
                </pre>
              </div>
              
              <div className="mb-3">
                <div className="text-sm font-medium mb-1">Python</div>
                <pre className="text-xs bg-theme-bg-secondary p-3 rounded overflow-x-auto">
{`from blockchain_platform import BlockchainClient

client = BlockchainClient(
    api_key="YOUR_API_KEY",
    platform="ethereum"
)

# Get token balances
balances = client.get_token_balances("0x1234...")
print(balances)`}
                </pre>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Need Help?</h4>
              <div className="flex space-x-4">
                <button className="px-4 py-2 bg-theme-accent text-white rounded-lg hover:bg-theme-accent-hover transition-colors">
                  Contact Support
                </button>
                <button className="px-4 py-2 border border-theme-border rounded-lg hover:bg-theme-bg-secondary">
                  View Documentation
                </button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeveloperDashboard;
