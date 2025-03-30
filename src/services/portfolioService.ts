import { supabase } from '../utils/supabase';
import { Database } from '../types/supabase';

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface PortfolioAsset {
  id: string;
  portfolio_id: string;
  token_id: string;
  amount: number;
  purchase_price_usd: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  portfolio_id: string;
  token_id: string;
  type: 'buy' | 'sell';
  amount: number;
  price_usd: number;
  timestamp: string;
  fee_usd?: number;
  notes?: string;
}

// Portfolio Management
export const createPortfolio = async (name: string, description?: string): Promise<Portfolio> => {
  const { data, error } = await supabase
    .from('portfolios')
    .insert([{ name, description }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getPortfolios = async (): Promise<Portfolio[]> => {
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const updatePortfolio = async (id: string, updates: Partial<Portfolio>): Promise<Portfolio> => {
  const { data, error } = await supabase
    .from('portfolios')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deletePortfolio = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('portfolios')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Portfolio Assets
export const addAsset = async (
  portfolio_id: string,
  token_id: string,
  amount: number,
  purchase_price_usd: number
): Promise<PortfolioAsset> => {
  const { data, error } = await supabase
    .from('portfolio_assets')
    .insert([{ portfolio_id, token_id, amount, purchase_price_usd }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getPortfolioAssets = async (portfolio_id: string): Promise<PortfolioAsset[]> => {
  const { data, error } = await supabase
    .from('portfolio_assets')
    .select('*')
    .eq('portfolio_id', portfolio_id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const updateAsset = async (
  id: string,
  updates: Partial<PortfolioAsset>
): Promise<PortfolioAsset> => {
  const { data, error } = await supabase
    .from('portfolio_assets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteAsset = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('portfolio_assets')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Transactions
export const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getTransactions = async (portfolio_id: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('portfolio_id', portfolio_id)
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const updateTransaction = async (
  id: string,
  updates: Partial<Transaction>
): Promise<Transaction> => {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Analytics
export const getPortfolioStats = async (portfolio_id: string) => {
  const { data: assets, error: assetsError } = await supabase
    .from('portfolio_assets')
    .select(`
      token_id,
      amount,
      purchase_price_usd
    `)
    .eq('portfolio_id', portfolio_id);

  if (assetsError) throw assetsError;

  const { data: transactions, error: transactionsError } = await supabase
    .from('transactions')
    .select('*')
    .eq('portfolio_id', portfolio_id)
    .order('timestamp', { ascending: true });

  if (transactionsError) throw transactionsError;

  return {
    assets: assets || [],
    transactions: transactions || [],
    // Additional stats can be calculated here
  };
};