import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface PortfolioAsset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  lastUpdated: number;
}

export interface Transaction {
  id: string;
  assetId: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: number;
  total: number;
  fee: number;
}

interface PortfolioContextType {
  assets: PortfolioAsset[];
  transactions: Transaction[];
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  addAsset: (asset: Omit<PortfolioAsset, 'id' | 'lastUpdated'>) => void;
  updateAsset: (assetId: string, updates: Partial<Omit<PortfolioAsset, 'id'>>) => void;
  removeAsset: (assetId: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateAssetPrice: (assetId: string, currentPrice: number) => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

interface PortfolioProviderProps {
  children: ReactNode;
}

export const PortfolioProvider: React.FC<PortfolioProviderProps> = ({ children }) => {
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [dailyChange, setDailyChange] = useState<number>(0);
  const [dailyChangePercent, setDailyChangePercent] = useState<number>(0);

  // Load portfolio data from localStorage on initial render
  useEffect(() => {
    const savedAssets = localStorage.getItem('portfolioAssets');
    const savedTransactions = localStorage.getItem('portfolioTransactions');
    
    if (savedAssets) {
      try {
        setAssets(JSON.parse(savedAssets));
      } catch (e) {
        console.error('Error loading portfolio assets from localStorage:', e);
      }
    } else {
      // Set sample data for demonstration
      setAssets(sampleAssets);
    }
    
    if (savedTransactions) {
      try {
        setTransactions(JSON.parse(savedTransactions));
      } catch (e) {
        console.error('Error loading portfolio transactions from localStorage:', e);
      }
    } else {
      // Set sample data for demonstration
      setTransactions(sampleTransactions);
    }
  }, []);

  // Save portfolio data to localStorage when it changes
  useEffect(() => {
    if (assets.length > 0) {
      localStorage.setItem('portfolioAssets', JSON.stringify(assets));
    }
  }, [assets]);

  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('portfolioTransactions', JSON.stringify(transactions));
    }
  }, [transactions]);

  // Calculate total portfolio value and daily change whenever assets change
  useEffect(() => {
    const newTotalValue = assets.reduce(
      (sum, asset) => sum + asset.quantity * asset.currentPrice,
      0
    );
    
    // Calculate daily change (simulated for demo)
    const previousTotal = assets.reduce(
      (sum, asset) => sum + asset.quantity * (asset.currentPrice / (1 + Math.random() * 0.05 - 0.025)),
      0
    );
    
    const newDailyChange = newTotalValue - previousTotal;
    const newDailyChangePercent = previousTotal > 0 ? (newDailyChange / previousTotal) * 100 : 0;
    
    setTotalValue(newTotalValue);
    setDailyChange(newDailyChange);
    setDailyChangePercent(newDailyChangePercent);
  }, [assets]);

  const addAsset = (asset: Omit<PortfolioAsset, 'id' | 'lastUpdated'>) => {
    const newAsset: PortfolioAsset = {
      ...asset,
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      lastUpdated: Date.now(),
    };
    
    setAssets((prev) => [...prev, newAsset]);
  };

  const updateAsset = (assetId: string, updates: Partial<Omit<PortfolioAsset, 'id'>>) => {
    setAssets((prev) =>
      prev.map((asset) =>
        asset.id === assetId
          ? { ...asset, ...updates, lastUpdated: Date.now() }
          : asset
      )
    );
  };

  const removeAsset = (assetId: string) => {
    setAssets((prev) => prev.filter((asset) => asset.id !== assetId));
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
    };
    
    setTransactions((prev) => [...prev, newTransaction]);
    
    // Update asset quantity based on transaction
    const asset = assets.find((a) => a.id === transaction.assetId);
    
    if (asset) {
      const quantityChange = transaction.type === 'buy' ? transaction.quantity : -transaction.quantity;
      
      updateAsset(transaction.assetId, {
        quantity: asset.quantity + quantityChange,
      });
    }
  };

  const updateAssetPrice = (assetId: string, currentPrice: number) => {
    setAssets((prev) =>
      prev.map((asset) =>
        asset.id === assetId
          ? { ...asset, currentPrice, lastUpdated: Date.now() }
          : asset
      )
    );
  };

  return (
    <PortfolioContext.Provider
      value={{
        assets,
        transactions,
        totalValue,
        dailyChange,
        dailyChangePercent,
        addAsset,
        updateAsset,
        removeAsset,
        addTransaction,
        updateAssetPrice,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

// Sample data for demonstration
const sampleAssets: PortfolioAsset[] = [
  {
    id: 'btc-asset',
    symbol: 'BTC',
    name: 'Bitcoin',
    quantity: 1.55,
    purchasePrice: 42000,
    currentPrice: 45678.32,
    lastUpdated: Date.now(),
  },
  {
    id: 'eth-asset',
    symbol: 'ETH',
    name: 'Ethereum',
    quantity: 15.3,
    purchasePrice: 2800,
    currentPrice: 3245.67,
    lastUpdated: Date.now(),
  },
  {
    id: 'sol-asset',
    symbol: 'SOL',
    name: 'Solana',
    quantity: 210.5,
    purchasePrice: 110,
    currentPrice: 120.89,
    lastUpdated: Date.now(),
  },
  {
    id: 'bnb-asset',
    symbol: 'BNB',
    name: 'Binance Coin',
    quantity: 12.75,
    purchasePrice: 380,
    currentPrice: 402.56,
    lastUpdated: Date.now(),
  },
  {
    id: 'ada-asset',
    symbol: 'ADA',
    name: 'Cardano',
    quantity: 5400,
    purchasePrice: 1.15,
    currentPrice: 1.23,
    lastUpdated: Date.now(),
  },
  {
    id: 'dot-asset',
    symbol: 'DOT',
    name: 'Polkadot',
    quantity: 300,
    purchasePrice: 22.50,
    currentPrice: 25.89,
    lastUpdated: Date.now(),
  },
  {
    id: 'doge-asset',
    symbol: 'DOGE',
    name: 'Dogecoin',
    quantity: 10500,
    purchasePrice: 0.095,
    currentPrice: 0.089,
    lastUpdated: Date.now(),
  },
];

const sampleTransactions: Transaction[] = [
  {
    id: 'tx1',
    assetId: 'btc-asset',
    symbol: 'BTC',
    type: 'buy',
    quantity: 1,
    price: 41000,
    timestamp: Date.now() - 3024000000, // 35 days ago
    total: 41000,
    fee: 20.5,
  },
  {
    id: 'tx2',
    assetId: 'btc-asset',
    symbol: 'BTC',
    type: 'buy',
    quantity: 0.55,
    price: 43800,
    timestamp: Date.now() - 1209600000, // 14 days ago
    total: 24090,
    fee: 12.05,
  },
  {
    id: 'tx3',
    assetId: 'eth-asset',
    symbol: 'ETH',
    type: 'buy',
    quantity: 10,
    price: 2750,
    timestamp: Date.now() - 2592000000, // 30 days ago
    total: 27500,
    fee: 13.75,
  },
  {
    id: 'tx4',
    assetId: 'eth-asset',
    symbol: 'ETH',
    type: 'buy',
    quantity: 5.3,
    price: 2900,
    timestamp: Date.now() - 864000000, // 10 days ago
    total: 15370,
    fee: 7.69,
  },
  {
    id: 'tx5',
    assetId: 'sol-asset',
    symbol: 'SOL',
    type: 'buy',
    quantity: 200,
    price: 105,
    timestamp: Date.now() - 1728000000, // 20 days ago
    total: 21000,
    fee: 10.5,
  },
  {
    id: 'tx6',
    assetId: 'sol-asset',
    symbol: 'SOL',
    type: 'buy',
    quantity: 10.5,
    price: 118,
    timestamp: Date.now() - 345600000, // 4 days ago
    total: 1239,
    fee: 0.62,
  },
];