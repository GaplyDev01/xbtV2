import React, { useState, useEffect } from 'react';
import { Loader2, ExternalLink, ArrowDown, ArrowUp, Clock, RefreshCw } from 'lucide-react';

interface Transaction {
  txid: string;
  amount: number;
  confirmations: number;
  timestamp: number;
  type: 'incoming' | 'outgoing';
  address: string;
  fees?: number;
}

interface TransactionViewerProps {
  address?: string;
  className?: string;
  limit?: number;
}

const TransactionViewer: React.FC<TransactionViewerProps> = ({
  address,
  className = '',
  limit = 10
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAddress, setActiveAddress] = useState<string | undefined>(address);

  const fetchTransactions = async (addr: string) => {
    if (!addr) {
      setError('No Bitcoin address provided');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, we would call a Bitcoin API
      // This is a mock implementation with dummy data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock transactions data
      const mockTransactions: Transaction[] = [
        {
          txid: '8f7a88e5c88b89c2b67f70b3601dde766f96194e18397f12cbc0ace68c9ab236',
          amount: 0.0352,
          confirmations: 120,
          timestamp: Date.now() - 86400000, // 1 day ago
          type: 'incoming',
          address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
        },
        {
          txid: '9e2bc8fbd3e5b9082aabd8927a4a24f5e8b0cd9d1c0d770586e0aa9c57105217',
          amount: 0.0125,
          confirmations: 85,
          timestamp: Date.now() - 172800000, // 2 days ago
          type: 'outgoing',
          address: '1Hf2CKoVDyPj7dNn3vgTeFMgDqVvbVNZQq',
          fees: 0.00015
        },
        {
          txid: '99214576d307f7b8c1574c5cd463421ed2284343d7e2b1b9eb82e22d7a6f4c33',
          amount: 0.0223,
          confirmations: 210,
          timestamp: Date.now() - 259200000, // 3 days ago
          type: 'incoming',
          address: '1MZmwgyMyjM11LY5uzNxkRywHWS4uxbLwy'
        },
        {
          txid: '0e3e2357e806b6cdb1f70b54c3a3a17b6714ee1f0e68bebb44a74b1efd512098',
          amount: 0.0522,
          confirmations: 350,
          timestamp: Date.now() - 432000000, // 5 days ago
          type: 'outgoing',
          address: '1BW18n7MfpU35q4MTBSk8pse3XzQF8XvzT',
          fees: 0.00022
        },
        {
          txid: '6359f0868171b1d194cbee1af2f16ea598ae8fad666d9b012c8ed2b79a236ec4',
          amount: 0.0174,
          confirmations: 422,
          timestamp: Date.now() - 518400000, // 6 days ago
          type: 'incoming',
          address: '15ubicBBWFnvoZLT7GiU2qxjRaKJPdkDMG'
        }
      ];

      setTransactions(mockTransactions);
    } catch (err) {
      console.error('Error fetching Bitcoin transactions:', err);
      setError('Failed to fetch transactions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeAddress) {
      fetchTransactions(activeAddress);
    }
  }, [activeAddress]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActiveAddress(e.target.value);
  };

  const handleRefresh = () => {
    if (activeAddress) {
      fetchTransactions(activeAddress);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncateAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 6)}`;
  };

  return (
    <div className={`bg-theme-bg border border-theme-border rounded-lg p-4 ${className}`}>
      <div className="flex flex-col">
        <h3 className="text-lg font-medium mb-4">Bitcoin Transaction Viewer</h3>
        
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={activeAddress || ''}
              onChange={handleAddressChange}
              placeholder="Enter Bitcoin address"
              className="flex-1 py-2 px-3 text-sm bg-theme-bg border border-theme-border rounded-lg focus:ring-2 focus:ring-theme-accent/50 focus:border-theme-accent text-theme-text-primary placeholder:text-theme-text-secondary"
            />
            <button
              onClick={handleRefresh}
              className="p-2 bg-theme-accent/10 text-theme-accent hover:bg-theme-accent/20 rounded-lg"
              title="Refresh transactions"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={24} className="text-theme-accent animate-spin" />
            <span className="ml-2 text-theme-text-secondary">Loading transactions...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-theme-text-secondary">
            <p>{error}</p>
            {!activeAddress && (
              <p className="mt-2 text-sm">Please enter a Bitcoin address to view transactions.</p>
            )}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-theme-text-secondary">
            <p>No transactions found for this address.</p>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-80">
            <div className="divide-y divide-theme-border">
              {transactions.slice(0, limit).map((tx) => (
                <div key={tx.txid} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${tx.type === 'incoming' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'} mr-3`}>
                        {tx.type === 'incoming' ? <ArrowDown size={16} /> : <ArrowUp size={16} />}
                      </div>
                      <div>
                        <div className="font-medium text-sm flex items-center">
                          {tx.type === 'incoming' ? 'Received' : 'Sent'} {tx.amount} BTC
                          {tx.fees && tx.type === 'outgoing' && (
                            <span className="text-xs text-theme-text-secondary ml-2">
                              (Fee: {tx.fees} BTC)
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-theme-text-secondary flex items-center">
                          <Clock size={12} className="mr-1" />
                          {formatDate(tx.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-theme-text-secondary">
                        {tx.type === 'incoming' ? 'From' : 'To'}: {truncateAddress(tx.address)}
                      </div>
                      <div className="flex items-center justify-end mt-1">
                        <div className="text-xs bg-theme-accent/5 text-theme-accent px-2 py-1 rounded-full mr-2 flex items-center">
                          <span>{tx.confirmations} confirmations</span>
                        </div>
                        <a
                          href={`https://www.blockchain.com/explorer/transactions/btc/${tx.txid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-theme-accent hover:text-theme-accent-dark"
                          title="View transaction"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionViewer;
