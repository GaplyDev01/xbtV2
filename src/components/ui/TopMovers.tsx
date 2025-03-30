import React, { useState } from 'react';
import { useCrypto } from '../../context/CryptoContext';
import { useToken } from '../../context/TokenContext';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/solid';
import { formatTokenPrice } from '../../utils/tokenUtils';

type FilterType = 'all' | 'gainers' | 'losers';

const TopMovers: React.FC = () => {
  const { topGainers, topLosers, isLoading, selectedTimeframe, setSelectedTimeframe } = useCrypto();
  const { selectedToken, setSelectedToken } = useToken();
  const [filter, setFilter] = useState<FilterType>('all');

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-900 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Top Movers</h2>
          <div className="skeleton-loader w-24 h-8"></div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse flex items-center space-x-4">
              <div className="rounded-full bg-gray-700 h-8 w-8"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const highlightCoin = (coinId: string) => {
    return selectedToken === coinId ? 'border-l-4 border-indigo-500 bg-gray-800' : '';
  };

  const renderTimeframeButtons = () => (
    <div className="flex space-x-1 text-xs">
      <button 
        className={`px-2 py-1 rounded ${selectedTimeframe === '1h' ? 'bg-indigo-600' : 'bg-gray-700'}`}
        onClick={() => setSelectedTimeframe('1h')}
      >
        1H
      </button>
      <button 
        className={`px-2 py-1 rounded ${selectedTimeframe === '24h' ? 'bg-indigo-600' : 'bg-gray-700'}`}
        onClick={() => setSelectedTimeframe('24h')}
      >
        24H
      </button>
      <button 
        className={`px-2 py-1 rounded ${selectedTimeframe === '7d' ? 'bg-indigo-600' : 'bg-gray-700'}`}
        onClick={() => setSelectedTimeframe('7d')}
      >
        7D
      </button>
    </div>
  );

  const renderFilterButtons = () => (
    <div className="flex space-x-1 text-xs mb-4">
      <button 
        className={`px-2 py-1 rounded ${filter === 'all' ? 'bg-indigo-600' : 'bg-gray-700'}`}
        onClick={() => setFilter('all')}
      >
        All
      </button>
      <button 
        className={`px-2 py-1 rounded ${filter === 'gainers' ? 'bg-indigo-600' : 'bg-gray-700'}`}
        onClick={() => setFilter('gainers')}
      >
        Gainers
      </button>
      <button 
        className={`px-2 py-1 rounded ${filter === 'losers' ? 'bg-indigo-600' : 'bg-gray-700'}`}
        onClick={() => setFilter('losers')}
      >
        Losers
      </button>
    </div>
  );

  const renderCoinRow = (coin: any, type: 'gainer' | 'loser') => (
    <div 
      key={coin.id} 
      className={`p-2 hover:bg-gray-800 cursor-pointer flex items-center justify-between ${highlightCoin(coin.id)}`}
      onClick={() => setSelectedToken(coin.id)}
    >
      <div className="flex items-center space-x-2">
        <img 
          src={coin.image} 
          alt={coin.name} 
          className="w-6 h-6 rounded-full"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/30?text=' + coin.symbol?.substring(0, 2)?.toUpperCase();
          }}
        />
        <div>
          <div className="text-sm font-medium">{coin.symbol?.toUpperCase()}</div>
          <div className="text-xs text-gray-400">{coin.name}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm">${formatTokenPrice(coin.current_price)}</div>
        <div className={`text-xs flex items-center justify-end ${type === 'gainer' ? 'text-green-500' : 'text-red-500'}`}>
          {type === 'gainer' ? (
            <ArrowUpIcon className="h-3 w-3 mr-1" />
          ) : (
            <ArrowDownIcon className="h-3 w-3 mr-1" />
          )}
          {Math.abs(coin.price_change_percentage).toFixed(2)}%
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 bg-gray-900 rounded-lg text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Top Movers</h2>
        {renderTimeframeButtons()}
      </div>
      
      {renderFilterButtons()}
      
      <div className="space-y-4">
        {(filter === 'all' || filter === 'gainers') && (
          <div>
            <h3 className="text-sm font-semibold text-green-500 mb-2">Top Gainers</h3>
            <div className="space-y-1">
              {topGainers.slice(0, 4).map(coin => renderCoinRow(coin, 'gainer'))}
            </div>
          </div>
        )}
        
        {(filter === 'all' || filter === 'losers') && (
          <div>
            <h3 className="text-sm font-semibold text-red-500 mb-2">Top Losers</h3>
            <div className="space-y-1">
              {topLosers.slice(0, 4).map(coin => renderCoinRow(coin, 'loser'))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopMovers;