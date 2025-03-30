import React from 'react';
import { useToken } from '../../context/TokenContext';
import { MessageCircle, TrendingUp, Users, BarChart2, RefreshCw } from 'lucide-react';

const SocialSentiment: React.FC = () => {
  const { selectedToken } = useToken();
  const [isLoading, setIsLoading] = React.useState(false);

  // Mock data for demonstration
  const trendingTopics = [
    { topic: '#Bitcoin', count: '23.4K mentions', change: '+12%' },
    { topic: '#Ethereum', count: '18.7K mentions', change: '+8%' },
    { topic: '#NFT', count: '12.3K mentions', change: '-3%' },
    { topic: '#DeFi', count: '9.8K mentions', change: '+5%' },
    { topic: '#Regulation', count: '8.5K mentions', change: '+32%' }
  ];

  const communityMood = [
    { community: 'Reddit', sentiment: 'Bullish', score: 72 },
    { community: 'Twitter', sentiment: 'Bullish', score: 67 },
    { community: 'Discord', sentiment: 'Neutral', score: 58 }
  ];

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
              onClick={() => setIsLoading(prev => !prev)}
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
              className="flex justify-between items-center bg-theme-accent/10 p-1.5 rounded-md"
            >
              <div className="flex items-center">
                <MessageCircle size={10} className="text-theme-accent mr-1" />
                <span className="text-[10px] font-medium text-theme-text-primary">
                  {topic.topic}
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
      </div>
    </div>
  );
};

export default SocialSentiment;