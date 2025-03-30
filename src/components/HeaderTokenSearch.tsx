import React from 'react';
import SolanaTokenSearch from './SolanaTokenSearch';
import { useToken } from '../context/TokenContext';
import { CoinSearchResult } from '../services/cryptoApi';

interface HeaderTokenSearchProps {
  className?: string;
}

const HeaderTokenSearch: React.FC<HeaderTokenSearchProps> = ({ className = '' }) => {
  const { setSelectedToken, setTokenDetails, addTokenToHistory } = useToken();

  const handleTokenSelect = async (token: CoinSearchResult) => {
    setSelectedToken(token);
    
    try {
      const options = {
        method: 'GET',
        headers: { 
          'accept': 'application/json', 
          'x-cg-pro-api-key': 'CG-qsva2ctaarLBpZ3KDqYmzu6p'
        }
      };
      
      const response = await fetch(`https://pro-api.coingecko.com/api/v3/coins/${token.id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`, options);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const details = await response.json();
      setTokenDetails(details);
      
      // Add to token history
      addTokenToHistory(token, details);
    } catch (err) {
      console.error('Error fetching token details:', err);
      setTokenDetails(null);
      
      // Still add to history even if details fetch fails
      addTokenToHistory(token, null);
    }
  };

  return (
    <div className={`max-w-xs ${className}`}>
      <SolanaTokenSearch 
        onSelectToken={handleTokenSelect}
        placeholder="Search token..."
        className="w-full"
      />
    </div>
  );
};

export default HeaderTokenSearch;