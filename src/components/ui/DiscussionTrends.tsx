import React, { useState, useEffect } from 'react';
import { MessageCircle, TrendingUp, Users, BarChart2, RefreshCw, ExternalLink } from 'lucide-react';
import { useToken } from '../../context/TokenContext';
import { getMarketSentiment } from '../../services/twitterApi';

interface TrendingTopic {
  topic: string;
  count: string;
  change: string;
  selected?: boolean;
}

interface CommunityMood {
  community: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  score: number;
}

const DiscussionTrends: React.FC = () => {
  const { selectedToken } = useToken();
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([
    { topic: '#Bitcoin', count: '23.4K mentions', change: '+12%' },
    { topic: '#Ethereum', count: '18.7K mentions', change: '+8%' },
    { topic: '#NFT', count: '12.3K mentions', change: '-3%' },
    { topic: '#DeFi', count: '9.8K mentions', change: '+5%' },
    { topic: '#Regulation', count: '8.5K mentions', change: '+32%' }
  ]);
  
  const [communityMood, setCommunityMood] = useState<CommunityMood[]>([
    { community: 'Reddit', sentiment: 'Bullish', score: 72 },
    { community: 'Twitter', sentiment: 'Bullish', score: 67 },
    { community: 'Discord', sentiment: 'Neutral', score: 58 }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate random volume data for demo
  const generateRandomVolume = () => {
    const volume = Math.floor(Math.random() * 100000) + 5000;
    return `${(volume / 1000).toFixed(1)}K mentions`;
  };

  // Generate random change percentage for demo
  const generateRandomChange = () => {
    const isPositive = Math.random() > 0.3; // 70% chance of positive
    const change = Math.floor(Math.random() * 30) + 1;
    return isPositive ? `+${change}%` : `-${change}%`;
  };

  // Update trending topics based on selected token
  useEffect(() => {
    if (selectedToken) {
      setIsLoading(true);
      
      // Get market sentiment for the selected token
      getMarketSentiment(selectedToken.symbol.toLowerCase())
        .then(({ sentiment }) => {
          // Create trending topics related to the token
          const tokenTopics: TrendingTopic[] = [
            { 
              topic: `#${selectedToken.symbol.toUpperCase()}`, 
              count: generateRandomVolume(), 
              change: generateRandomChange(),
              selected: true
            },
            { 
              topic: `#${selectedToken.name.replace(/\s+/g, '')}`, 
              count: generateRandomVolume(), 
              change: generateRandomChange() 
            }
          ];
          
          // Add related topics from the default list
          const relatedTopics = trendingTopics
            .filter(topic => 
              !topic.topic.toLowerCase().includes(selectedToken.symbol.toLowerCase()) && 
              !topic.topic.toLowerCase().includes(selectedToken.name.toLowerCase())
            )
            .slice(0, 3);
          
          setTrendingTopics([...tokenTopics, ...relatedTopics]);
          
          // Update community mood based on sentiment analysis
          const sentimentScore = (sentiment.score + 1) * 50; // Convert -1 to 1 range to 0 to 100
          
          const sentimentLabel: 'Bullish' | 'Bearish' | 'Neutral' = 
            sentiment.label === 'positive' ? 'Bullish' : 
            sentiment.label === 'negative' ? 'Bearish' : 'Neutral';
          
          setCommunityMood([
            { 
              community: 'Twitter', 
              sentiment: sentimentLabel, 
              score: Math.round(sentimentScore)
            },
            { 
              community: 'Reddit', 
              sentiment: sentimentLabel, 
              score: Math.round(sentimentScore - 5 + Math.random() * 10)
            },
            { 
              community: 'Discord', 
              sentiment: Math.random() > 0.5 ? sentimentLabel : 'Neutral', 
              score: Math.round(sentimentScore - 10 + Math.random() * 20)
            }
          ]);
          
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error updating discussion trends:', err);
          setError('Failed to fetch sentiment data');
          setIsLoading(false);
        });
    } else {
      // Reset to default data when no token is selected
      setTrendingTopics([
        { topic: '#Bitcoin', count: '23.4K mentions', change: '+12%' },
        { topic: '#Ethereum', count: '18.7K mentions', change: '+8%' },
        { topic: '#NFT', count: '12.3K mentions', change: '-3%' },
        { topic: '#DeFi', count: '9.8K mentions', change: '+5%' },
        { topic: '#Regulation', count: '8.5K mentions', change: '+32%' }
      ]);
      
      setCommunityMood([
        { community: 'Reddit', sentiment: 'Bullish', score: 72 },
        { community: 'Twitter', sentiment: 'Bullish', score: 67 },
        { community: 'Discord', sentiment: 'Neutral', score: 58 }
      ]);
    }
  }, [selectedToken]);

  // Handle refresh
  const handleRefresh = () => {
    if (selectedToken) {
      setIsLoading(true);
      getMarketSentiment(selectedToken.symbol.toLowerCase())
        .then(({ sentiment }) => {
          // Update existing trending topics with new data
          const updatedTopics = trendingTopics.map(topic => ({
            ...topic,
            count: generateRandomVolume(),
            change: generateRandomChange()
          }));
          
          setTrendingTopics(updatedTopics);
          
          // Update community mood
          const sentimentScore = (sentiment.score + 1) * 50;
          const sentimentLabel: 'Bullish' | 'Bearish' | 'Neutral' = 
            sentiment.label === 'positive' ? 'Bullish' : 
            sentiment.label === 'negative' ? 'Bearish' : 'Neutral';
          
          setCommunityMood([
            { 
              community: 'Twitter', 
              sentiment: sentimentLabel, 
              score: Math.round(sentimentScore)
            },
            { 
              community: 'Reddit', 
              sentiment: sentimentLabel, 
              score: Math.round(sentimentScore - 5 + Math.random() * 10)
            },
            { 
              community: 'Discord', 
              sentiment: Math.random() > 0.5 ? sentimentLabel : 'Neutral', 
              score: Math.round(sentimentScore - 10 + Math.random() * 20)
            }
          ]);
          
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Error refreshing discussion trends:', err);
          setError('Failed to refresh data');
          setIsLoading(false);
        });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <div className="text-[10px] font-medium text-theme-text-primary flex items-center">
            <TrendingUp size={12} className="mr-1 text-theme-accent" />
            Trending Topics
            {selectedToken && (
              <span className="ml-1 text-[8px] px-1.5 py-0.5 rounded-full bg-theme-accent/10 text-theme-accent">
                {selectedToken.symbol.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex items-center">
            <div className="text-[9px] text-theme-accent mr-2">Last 24h</div>
            <button 
              onClick={handleRefresh}
              disabled={isLoading}
              className="text-theme-accent/70 hover:text-theme-accent"
            >
              <RefreshCw size={10} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
        
        <div className="space-y-1.5">
          {trendingTopics.map((topic, index) => (
            <div 
              key={index} 
              className={`flex justify-between items-center ${
                topic.selected 
                  ? 'bg-theme-accent/20 border-l-2 border-theme-accent' 
                  : 'bg-theme-accent/10'
              } p-1.5 rounded-md transition-colors duration-200`}
            >
              <div className="flex items-center">
                <MessageCircle size={10} className="text-theme-accent mr-1" />
                <span className="text-[10px] font-medium text-theme-text-primary">
                  {topic.topic}
                  {topic.selected && (
                    <span className="ml-1 text-[7px] text-theme-accent">★</span>
                  )}
                </span>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-theme-text-secondary">{topic.count}</div>
                <div className={`text-[8px] ${
                  topic.change.startsWith('+') 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }`}>
                  {topic.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-1">
          <div className="text-[10px] font-medium text-theme-text-primary flex items-center">
            <Users size={12} className="mr-1 text-theme-accent" />
            Community Mood
          </div>
          <div className="text-[9px] text-theme-accent">Sentiment Analysis</div>
        </div>
        
        <div className="space-y-2">
          {communityMood.map((item, index) => (
            <div key={index} className="flex items-center bg-theme-accent/10 p-1.5 rounded-md">
              <div className="w-16">
                <div className="text-[10px] font-medium text-theme-text-primary">{item.community}</div>
                <div className={`text-[8px] ${
                  item.sentiment === 'Bullish' 
                    ? 'text-green-400' 
                    : item.sentiment === 'Bearish' 
                    ? 'text-red-400' 
                    : 'text-theme-accent'
                }`}>
                  {item.sentiment}
                </div>
              </div>
              <div className="flex-grow mx-2">
                <div className="h-1.5 bg-theme-accent/20 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      item.sentiment === 'Bullish' 
                        ? 'bg-green-400' 
                        : item.sentiment === 'Bearish' 
                        ? 'bg-red-400' 
                        : 'bg-theme-accent'
                    }`}
                    style={{ width: `${item.score}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-[9px] font-medium text-theme-text-primary">{item.score}/100</div>
            </div>
          ))}
        </div>
        
        {error && (
          <div className="mt-2 text-center text-[9px] text-red-400">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscussionTrends;