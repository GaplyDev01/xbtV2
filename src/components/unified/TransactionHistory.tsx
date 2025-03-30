import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { Loader2, ExternalLink, Filter, ArrowUp, ArrowDown } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface Transaction {
  id: string;
  hash: string;
  type: 'send' | 'receive' | 'swap' | 'stake' | 'unstake' | 'other';
  amount: number;
  symbol: string;
  from: string;
  to: string;
  timestamp: number;
  fee: number;
  status: 'confirmed' | 'pending' | 'failed';
  platform: 'ethereum' | 'solana' | 'bitcoin' | 'polkadot';
}

interface TransactionHistoryProps {
  className?: string;
  defaultTab?: string;
  limit?: number;
  walletAddresses?: Record<string, string>;
  onConnectWallet?: (platform: string) => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  className = '',
  defaultTab = 'all',
  limit = 10,
  walletAddresses = {},
  onConnectWallet
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Transaction>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<Transaction['type'] | 'all'>('all');

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // In a real implementation, we would call a blockchain API for transaction history
        // This is a mock implementation with dummy data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock transaction data
        const mockTransactions: Transaction[] = [
          // Ethereum transactions
          {
            id: 'eth1',
            hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3',
            type: 'send',
            amount: 0.5,
            symbol: 'ETH',
            from: '0x1234...5678',
            to: '0xabcd...efgh',
            timestamp: Date.now() - 60000, // 1 minute ago
            fee: 0.002,
            status: 'confirmed',
            platform: 'ethereum'
          },
          {
            id: 'eth2',
            hash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
            type: 'swap',
            amount: 200,
            symbol: 'USDC',
            from: '0x1234...5678',
            to: '0xdefg...hijk',
            timestamp: Date.now() - 3600000, // 1 hour ago
            fee: 0.004,
            status: 'confirmed',
            platform: 'ethereum'
          },
          
          // Solana transactions
          {
            id: 'sol1',
            hash: '4Nvt7Kcf3PQCh1pBjJarJf2SdGK7KzEv2jp5ft9NY3SJMbw3aXKHm6zKVxDYByxH',
            type: 'receive',
            amount: 2.5,
            symbol: 'SOL',
            from: 'Bv84...2R5q',
            to: 'Hj29...9Lm3',
            timestamp: Date.now() - 120000, // 2 minutes ago
            fee: 0.00001,
            status: 'confirmed',
            platform: 'solana'
          },
          {
            id: 'sol2',
            hash: '3MvB8Kcq2PQCj5oBmJbpJn2RfGQ7LyDx1km4gn9MZ4JJNbe3bXJGl6yLVcDZAzxG',
            type: 'stake',
            amount: 10,
            symbol: 'SOL',
            from: 'Hj29...9Lm3',
            to: 'StakeProgram',
            timestamp: Date.now() - 7200000, // 2 hours ago
            fee: 0.00001,
            status: 'confirmed',
            platform: 'solana'
          },
          
          // Bitcoin transactions
          {
            id: 'btc1',
            hash: '6a2c4f8b0e9d1c3a5b7f4e8c2d9b6a4f8e2c1d3b5a7f9e1c3d5b7a9f1e3c5d7b9',
            type: 'receive',
            amount: 0.02,
            symbol: 'BTC',
            from: '15Rwz...9Kpq',
            to: '18dFg...4Vbn',
            timestamp: Date.now() - 180000, // 3 minutes ago
            fee: 0.0001,
            status: 'confirmed',
            platform: 'bitcoin'
          },
          
          // Polkadot transactions
          {
            id: 'dot1',
            hash: '0x4c8d2e9f3b1a7c5d8e2f6b9a3c7d4e8f1b2a3c4d5e6f7b8a9c1d2e3f4b5c6d7e8',
            type: 'send',
            amount: 15,
            symbol: 'DOT',
            from: '14Ghj...9Trd',
            to: '15Jkl...8Wqp',
            timestamp: Date.now() - 240000, // 4 minutes ago
            fee: 0.01,
            status: 'confirmed',
            platform: 'polkadot'
          },
          {
            id: 'dot2',
            hash: '0x7d9e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f1a2b3c4d5e6f7a8b9c0d1e',
            type: 'unstake',
            amount: 5,
            symbol: 'DOT',
            from: 'StakeProgram',
            to: '14Ghj...9Trd',
            timestamp: Date.now() - 86400000, // 1 day ago
            fee: 0.01,
            status: 'pending',
            platform: 'polkadot'
          },
        ];
        
        setTransactions(mockTransactions);
      } catch (err) {
        console.error('Error fetching transaction history:', err);
        setError('Failed to fetch transaction history. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTransactionHistory();
  }, [walletAddresses]);

  // Filter transactions based on active tab
  let filteredTransactions = activeTab === 'all'
    ? [...transactions]
    : transactions.filter(tx => tx.platform === activeTab);
  
  // Apply type filter if needed
  if (filterType !== 'all') {
    filteredTransactions = filteredTransactions.filter(tx => tx.type === filterType);
  }

  // Sort transactions
  filteredTransactions = [...filteredTransactions].sort((a, b) => {
    const valueA = a[sortField];
    const valueB = b[sortField];
    
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
    }
    
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortDirection === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    
    return 0;
  });

  // Limit the number of transactions
  filteredTransactions = filteredTransactions.slice(0, limit);

  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatAddress = (address: string) => {
    return address.length > 10 ? address : address;
  };

  const getTransactionTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'send':
        return <ArrowUp size={16} className="text-red-500" />;
      case 'receive':
        return <ArrowDown size={16} className="text-green-500" />;
      case 'swap':
        return <ArrowDown size={16} className="rotate-90 text-blue-500" />;
      case 'stake':
        return <ArrowDown size={16} className="text-purple-500" />;
      case 'unstake':
        return <ArrowUp size={16} className="text-purple-500" />;
      default:
        return null;
    }
  };

  const getConnectButton = (platform: string) => {
    return (
      <div className="mt-8 flex flex-col items-center justify-center">
        <p className="text-theme-text-secondary mb-4">
          Connect your {platform} wallet to view transactions
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Transaction History</h3>
        <div className="flex items-center space-x-2">
          <select
            className="text-sm bg-theme-bg-secondary border border-theme-border rounded-md p-1"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as Transaction['type'] | 'all')}
          >
            <option value="all">All Types</option>
            <option value="send">Send</option>
            <option value="receive">Receive</option>
            <option value="swap">Swap</option>
            <option value="stake">Stake</option>
            <option value="unstake">Unstake</option>
            <option value="other">Other</option>
          </select>
          <button
            className="p-1 rounded-md bg-theme-bg-secondary border border-theme-border hover:bg-theme-accent/10"
            title="Filter"
          >
            <Filter size={16} />
          </button>
        </div>
      </div>

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
        
        {['all', 'ethereum', 'solana', 'bitcoin', 'polkadot'].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="mt-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="text-theme-accent animate-spin" />
                <span className="ml-2 text-theme-text-secondary">
                  Loading {tabValue === 'all' ? 'transactions' : `${tabValue} transactions`}...
                </span>
              </div>
            ) : error ? (
              <Alert variant="warning">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : tabValue !== 'all' && !walletAddresses[tabValue] ? (
              getConnectButton(tabValue)
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-theme-text-secondary">
                <p>
                  {filterType !== 'all'
                    ? `No ${filterType} transactions found.`
                    : `No ${tabValue === 'all' ? '' : tabValue + ' '}transactions found.`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-theme-text-secondary border-b border-theme-border">
                      <th className="pb-2 text-left font-medium" onClick={() => handleSort('type')}>
                        Type
                      </th>
                      <th className="pb-2 text-left font-medium" onClick={() => handleSort('timestamp')}>
                        Date
                      </th>
                      <th className="pb-2 text-left font-medium">
                        Details
                      </th>
                      <th className="pb-2 text-right font-medium" onClick={() => handleSort('amount')}>
                        Amount
                      </th>
                      <th className="pb-2 text-right font-medium" onClick={() => handleSort('status')}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-theme-border/40 hover:bg-theme-bg-secondary">
                        <td className="py-2 flex items-center">
                          {getTransactionTypeIcon(tx.type)}
                          <span className="ml-2 capitalize">{tx.type}</span>
                        </td>
                        <td className="py-2">{formatTimestamp(tx.timestamp)}</td>
                        <td className="py-2">
                          <div className="flex flex-col">
                            <span className="text-xs text-theme-text-secondary">
                              {tx.type === 'receive' ? 'From' : 'To'}: {formatAddress(tx.type === 'receive' ? tx.from : tx.to)}
                            </span>
                            <a 
                              href={`https://${tx.platform === 'ethereum' ? 'etherscan.io' : 
                                     tx.platform === 'solana' ? 'solscan.io' : 
                                     tx.platform === 'bitcoin' ? 'blockchain.com/btc' : 
                                     'polkadot.subscan.io'}/tx/${tx.hash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs flex items-center text-theme-accent hover:underline"
                            >
                              {tx.hash.substring(0, 8)}...{tx.hash.substring(tx.hash.length - 8)}
                              <ExternalLink size={12} className="ml-1" />
                            </a>
                          </div>
                        </td>
                        <td className="py-2 text-right">
                          <span className={tx.type === 'receive' ? 'text-green-500' : ''}>
                            {tx.type === 'receive' ? '+' : ''}{tx.amount} {tx.symbol}
                          </span>
                        </td>
                        <td className="py-2 text-right">
                          <span className={`px-2 py-1 text-xs rounded-full ${tx.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 
                                          tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 
                                          'bg-red-500/10 text-red-500'}`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {!isLoading && !error && filteredTransactions.length > 0 && (
        <div className="mt-4 flex justify-between items-center text-sm text-theme-text-secondary">
          <div>Showing {filteredTransactions.length} of {transactions.length} transactions</div>
          <button className="text-theme-accent hover:underline">
            View All Transactions
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
