import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as portfolioService from '../services/portfolioService';
import type { Portfolio, PortfolioAsset, Transaction } from '../services/portfolioService';

export const usePortfolio = (portfolioId?: string) => {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch portfolios
  useEffect(() => {
    const fetchPortfolios = async () => {
      if (!user) return;
      
      try {
        const data = await portfolioService.getPortfolios();
        setPortfolios(data);
      } catch (err) {
        console.error('Error fetching portfolios:', err);
        setError('Failed to load portfolios');
      }
    };

    fetchPortfolios();
  }, [user]);

  // Fetch portfolio details if portfolioId is provided
  useEffect(() => {
    const fetchPortfolioDetails = async () => {
      if (!portfolioId || !user) return;
      
      setIsLoading(true);
      setError(null);

      try {
        const [assetsData, transactionsData] = await Promise.all([
          portfolioService.getPortfolioAssets(portfolioId),
          portfolioService.getTransactions(portfolioId)
        ]);

        setAssets(assetsData);
        setTransactions(transactionsData);
      } catch (err) {
        console.error('Error fetching portfolio details:', err);
        setError('Failed to load portfolio details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolioDetails();
  }, [portfolioId, user]);

  // Create portfolio
  const createPortfolio = async (name: string, description?: string) => {
    try {
      const newPortfolio = await portfolioService.createPortfolio(name, description);
      setPortfolios(prev => [newPortfolio, ...prev]);
      return newPortfolio;
    } catch (err) {
      console.error('Error creating portfolio:', err);
      throw err;
    }
  };

  // Update portfolio
  const updatePortfolio = async (id: string, updates: Partial<Portfolio>) => {
    try {
      const updatedPortfolio = await portfolioService.updatePortfolio(id, updates);
      setPortfolios(prev => 
        prev.map(p => p.id === id ? updatedPortfolio : p)
      );
      return updatedPortfolio;
    } catch (err) {
      console.error('Error updating portfolio:', err);
      throw err;
    }
  };

  // Delete portfolio
  const deletePortfolio = async (id: string) => {
    try {
      await portfolioService.deletePortfolio(id);
      setPortfolios(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting portfolio:', err);
      throw err;
    }
  };

  // Add asset
  const addAsset = async (
    portfolio_id: string,
    token_id: string,
    amount: number,
    purchase_price_usd: number
  ) => {
    try {
      const newAsset = await portfolioService.addAsset(
        portfolio_id,
        token_id,
        amount,
        purchase_price_usd
      );
      setAssets(prev => [newAsset, ...prev]);
      return newAsset;
    } catch (err) {
      console.error('Error adding asset:', err);
      throw err;
    }
  };

  // Update asset
  const updateAsset = async (id: string, updates: Partial<PortfolioAsset>) => {
    try {
      const updatedAsset = await portfolioService.updateAsset(id, updates);
      setAssets(prev => 
        prev.map(a => a.id === id ? updatedAsset : a)
      );
      return updatedAsset;
    } catch (err) {
      console.error('Error updating asset:', err);
      throw err;
    }
  };

  // Delete asset
  const deleteAsset = async (id: string) => {
    try {
      await portfolioService.deleteAsset(id);
      setAssets(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error deleting asset:', err);
      throw err;
    }
  };

  // Add transaction
  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const newTransaction = await portfolioService.addTransaction(transaction);
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      console.error('Error adding transaction:', err);
      throw err;
    }
  };

  // Update transaction
  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const updatedTransaction = await portfolioService.updateTransaction(id, updates);
      setTransactions(prev => 
        prev.map(t => t.id === id ? updatedTransaction : t)
      );
      return updatedTransaction;
    } catch (err) {
      console.error('Error updating transaction:', err);
      throw err;
    }
  };

  // Delete transaction
  const deleteTransaction = async (id: string) => {
    try {
      await portfolioService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting transaction:', err);
      throw err;
    }
  };

  return {
    portfolios,
    assets,
    transactions,
    isLoading,
    error,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    addAsset,
    updateAsset,
    deleteAsset,
    addTransaction,
    updateTransaction,
    deleteTransaction
  };
};