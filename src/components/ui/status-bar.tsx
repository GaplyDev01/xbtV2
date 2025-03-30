import React, { useState, useEffect } from 'react';
import { Clock, Bitcoin } from 'lucide-react';

interface StatusBarProps {
  className?: string;
  isSidebarExpanded?: boolean;
}

interface TokenBoostResponse {
  url: string;
  chainId: string;
  tokenAddress: string;
  description: string;
  icon?: string;
  header?: string;
  openGraph: string;
  links?: Array<{
    type?: string;
    label?: string;
    url: string;
  }>;
  totalAmount: number;
  amount: number;
}

interface TokenBoost {
  chainId: string;
  tokenAddress: string;
  name: string;
  symbol: string;
  description: string;
  amount: number;
  totalAmount: number;
  links: {
    website?: string;
    twitter?: string;
    telegram?: string;
  };
}

const StatusBar: React.FC<StatusBarProps> = ({ className, isSidebarExpanded = false }) => {
  const btcPrice = '$37.5K';
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const [currentTime, setCurrentTime] = useState(time);
  const [topBoosts, setTopBoosts] = useState<TokenBoost[]>([]);
  const [latestBoosts, setLatestBoosts] = useState<TokenBoost[]>([]);
  const [currentBoostIndex, setCurrentBoostIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Transform API response to TokenBoost format
  const transformBoostData = (data: TokenBoostResponse[]): TokenBoost[] => {
    return data.map(boost => {
      // Extract symbol from description or use address as fallback
      const symbol = boost.tokenAddress.split('::').pop() || boost.tokenAddress.slice(-4);
      
      // Get website and social links
      const links = boost.links?.reduce((acc, link) => ({
        ...acc,
        [link.type || 'website']: link.url
      }), {});

      return {
        chainId: boost.chainId,
        tokenAddress: boost.tokenAddress,
        name: boost.description || symbol,
        symbol: symbol.toUpperCase(),
        description: boost.description || '',
        amount: boost.amount,
        totalAmount: boost.totalAmount,
        links: {
          website: links?.website,
          twitter: links?.twitter,
          telegram: links?.telegram
        }
      };
    });
  };

  // Fetch token boosts
  useEffect(() => {
    const fetchTokenBoosts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch both top and latest boosts in parallel
        const [topResponse, latestResponse] = await Promise.all([
          fetch('https://api.dexscreener.com/token-boosts/top/v1', {
            headers: {
              'Cookie': '__cf_bm=3HFZVkh7L2n0oTjI1Y0e_Zf9gH37kgW67Ec9vrczY5k-1743273766-1.0.1.1-PaKn9_FxH2SXdZU80aD5fpHiIyiRYIAH4O1WLwSB.kMozSxjvmbpUXlJg6Vm6McBd9eIYpZEaqwtW1vuY3CiPGwFEvruhlC8Dv0fUyVGoRRMdSZh6OWg3aH3SS1MSHmZ'
            }
          }),
          fetch('https://api.dexscreener.com/token-boosts/latest/v1', {
            headers: {
              'Cookie': '__cf_bm=3HFZVkh7L2n0oTjI1Y0e_Zf9gH37kgW67Ec9vrczY5k-1743273766-1.0.1.1-PaKn9_FxH2SXdZU80aD5fpHiIyiRYIAH4O1WLwSB.kMozSxjvmbpUXlJg6Vm6McBd9eIYpZEaqwtW1vuY3CiPGwFEvruhlC8Dv0fUyVGoRRMdSZh6OWg3aH3SS1MSHmZ'
            }
          })
        ]);

        if (!topResponse.ok || !latestResponse.ok) {
          throw new Error(`API returned ${topResponse.status} or ${latestResponse.status}`);
        }

        const [topData, latestData] = await Promise.all([
          topResponse.json(),
          latestResponse.json()
        ]);

        setTopBoosts(transformBoostData(topData));
        setLatestBoosts(transformBoostData(latestData));
      } catch (err) {
        console.error('Error fetching token boosts:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch token boosts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenBoosts();
    // Refresh boosts every minute
    const refreshInterval = setInterval(fetchTokenBoosts, 60000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Cycle through boosts
  useEffect(() => {
    const allBoosts = [...topBoosts, ...latestBoosts];
    if (allBoosts.length === 0) return;

    const cycleInterval = setInterval(() => {
      setCurrentBoostIndex(prev => (prev + 1) % allBoosts.length);
    }, 5000); // Change boost every 5 seconds

    return () => clearInterval(cycleInterval);
  }, [topBoosts, latestBoosts]);

  const sidebarWidth = isSidebarExpanded ? 'left-64' : 'left-16';

  const formatAmount = (amount: number, total: number) => {
    const percentage = ((amount / total) * 100).toFixed(0);
    return `${percentage}%`;
  };

  const allBoosts = [...topBoosts, ...latestBoosts];
  const currentBoost = allBoosts[currentBoostIndex];

  return (
    <div className={`fixed bottom-0 ${sidebarWidth} right-0 h-7 bg-theme-bg border-t border-theme-border text-xs flex items-center justify-between z-30 font-mono px-2 overflow-hidden ${className}`}>
      <div className="flex items-center space-x-3 overflow-hidden">
        {isLoading ? (
          <span className="text-theme-text-secondary">Loading token boosts...</span>
        ) : error ? (
          <span className="text-theme-text-secondary">{error}</span>
        ) : currentBoost ? (
          <div className="flex items-center space-x-2">
            <span className="text-theme-text-primary">
              {currentBoost.symbol} ({currentBoost.chainId})
            </span>
            <span className="text-[#71c58f]">
              {formatAmount(currentBoost.amount, currentBoost.totalAmount)} Boost
            </span>
            {currentBoost.links.twitter && (
              <a
                href={currentBoost.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-theme-accent hover:text-theme-accent-dark"
              >
                @{currentBoost.links.twitter.split('/').pop()}
              </a>
            )}
          </div>
        ) : (
          <span className="text-theme-text-secondary">No token boosts available</span>
        )}
        <div className="h-4 border-r border-theme-border/30"></div>
        <div className="flex items-center">
          <Bitcoin size={12} className="mr-1 text-yellow-500" />
          <span className="text-theme-text-primary truncate">{btcPrice}</span>
        </div>
      </div>
      
      <div className="flex items-center">
        <Clock size={12} className="mr-1 text-theme-text-secondary" />
        <span>{currentTime}</span>
      </div>
    </div>
  );
};

export default StatusBar;