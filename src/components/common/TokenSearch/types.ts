import { CoinSearchResult } from '../../../services/cryptoApi';

export interface TokenSearchProps {
  onSelectToken?: (token: CoinSearchResult) => void;
  platform?: 'all' | 'ethereum' | 'solana' | 'bitcoin';
  className?: string;
  placeholder?: string;
  variant?: 'default' | 'minimal' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  maxResults?: number;
  autoFocus?: boolean;
}