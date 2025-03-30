import React from 'react';
import { TrendingUp, TrendingDown, Star } from 'lucide-react';

const Watchlist: React.FC = () => {
  const watchlistItems = [
    { 
      symbol: 'BTC', 
      name: 'Bitcoin', 
      price: '$45,678.32', 
      change: '+2.4%', 
      status: 'up',
      marketCap: '$876.5B',
      favorite: true
    },
    { 
      symbol: 'ETH', 
      name: 'Ethereum', 
      price: '$3,245.67', 
      change: '+1.8%', 
      status: 'up',
      marketCap: '$387.2B',
      favorite: true
    },
    { 
      symbol: 'BNB', 
      name: 'Binance Coin', 
      price: '$402.56', 
      change: '-0.7%', 
      status: 'down',
      marketCap: '$67.8B',
      favorite: false
    },
    { 
      symbol: 'SOL', 
      name: 'Solana', 
      price: '$120.89', 
      change: '+5.2%', 
      status: 'up',
      marketCap: '$48.3B',
      favorite: false
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-medium text-theme-text-primary">My Watchlist</span>
        <div className="flex space-x-1">
          <button className="text-[9px] px-2 py-0.5 rounded-full bg-theme-accent text-theme-bg">All</button>
          <button className="text-[9px] px-2 py-0.5 rounded-full bg-theme-accent/10 text-theme-accent">Favorites</button>
        </div>
      </div>
      
      <div className="flex-grow">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="text-theme-accent border-b border-theme-border">
              <th className="pb-2 font-medium text-left">#</th>
              <th className="pb-2 font-medium text-left">Asset</th>
              <th className="pb-2 font-medium text-right">Price</th>
              <th className="pb-2 font-medium text-right">24h</th>
              <th className="pb-2 font-medium text-right">Market Cap</th>
            </tr>
          </thead>
          <tbody>
            {watchlistItems.map((item, index) => (
              <tr key={index} className="border-b border-theme-border hover:bg-theme-accent/10">
                <td className="py-1.5 text-theme-text-secondary">
                  <div className="flex items-center">
                    <Star size={10} className={`mr-1 ${item.favorite ? 'text-theme-accent fill-theme-accent' : 'text-theme-text-secondary'}`} />
                    {index + 1}
                  </div>
                </td>
                <td className="py-1.5">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-theme-accent/10 rounded-full flex items-center justify-center mr-1">
                      <span className="text-[8px] font-bold text-theme-accent">{item.symbol.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-medium text-theme-text-primary">{item.symbol}</div>
                      <div className="text-[8px] text-theme-text-secondary">{item.name}</div>
                    </div>
                  </div>
                </td>
                <td className="py-1.5 text-right font-medium text-theme-text-primary">{item.price}</td>
                <td className="py-1.5 text-right">
                  <div className={`flex items-center justify-end ${item.status === 'up' ? 'text-theme-accent' : 'text-theme-accent'}`}>
                    {item.status === 'up' ? <TrendingUp size={10} className="mr-0.5" /> : <TrendingDown size={10} className="mr-0.5" />}
                    {item.change}
                  </div>
                </td>
                <td className="py-1.5 text-right text-theme-text-secondary">{item.marketCap}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-2 text-center">
        <button className="text-[10px] text-theme-accent hover:text-theme-accent-dark">
          Add to Watchlist
        </button>
      </div>
    </div>
  );
};

export default Watchlist;