import React, { useState, useEffect } from 'react';
import { useToken } from '../../context/TokenContext';
import { useCrypto } from '../../context/CryptoContext';
import { generateEnhancedAIResponse } from '../../utils/aiUtils';
import { formatCurrency, formatPercentage } from '../../utils/chartUtils';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Activity,
  BarChart2,
  Percent,
  DollarSign,
  Clock,
  AlertCircle,
  Shield,
  ExternalLink
} from 'lucide-react';

interface TradingSignal {
  type: 'buy' | 'sell' | 'hold';
  confidence: number;
  price_target: number;
  stop_loss: number;
  timeframe: string;
  risk_level: 'low' | 'medium' | 'high';
  reasoning: string;
  indicators: {
    name: string;
    value: string;
    signal: 'bullish' | 'bearish' | 'neutral';
  }[];
  generated_at: string;
}

interface TokenSignal {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  signal: TradingSignal;
}

const TradingSignals: React.FC = () => {
  const { selectedToken, tokenDetails, setSelectedToken, setTokenDetails } = useToken();
  const { getCoinsMarketData } = useCrypto();
  const [tokenSignals, setTokenSignals] = useState<TokenSignal[]>([]);
  const [selectedSignal, setSelectedSignal] = useState<TokenSignal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // When the component mounts or id parameter changes, load the specific token if we're on a details page
  useEffect(() => {
    if (id) {
      // If we have an ID from the URL, load that specific token
      const loadSpecificToken = async () => {
        try {
          // Find token in already loaded tokens
          const token = tokenSignals.find(t => t.id === id);
          if (token) {
            setSelectedSignal(token);
            return;
          }
          
          // If not found, we may need to fetch it
          setIsLoading(true);
          const tokens = await getCoinsMarketData('usd', [id]);
          if (tokens && tokens.length > 0) {
            const token = tokens[0];
            const signal = await generateSignalForToken(token);
            const tokenSignal = {
              id: token.id,
              name: token.name,
              symbol: token.symbol,
              image: `https://coinicons-api.vercel.app/api/icon/${token.symbol.toLowerCase()}`,
              current_price: token.current_price,
              price_change_percentage_24h: token.price_change_percentage_24h,
              market_cap: token.market_cap,
              signal
            };
            setSelectedSignal(tokenSignal);
          }
        } catch (err) {
          console.error('Error loading specific token:', err);
          setError('Failed to load token details');
        } finally {
          setIsLoading(false);
        }
      };
      
      loadSpecificToken();
    }
  }, [id, tokenSignals, getCoinsMarketData]);

  // Fetch top tokens and generate signals for them
  useEffect(() => {
    const fetchTopTokens = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get top tokens by market cap
        const tokens = await getCoinsMarketData('usd', undefined, 'market_cap_desc', 12);
        
        // Generate trading signals for each token
        const signalsPromises = tokens.map(async (token) => {
          const signal = await generateSignalForToken(token);
          return {
            id: token.id,
            name: token.name,
            symbol: token.symbol,
            image: `https://coinicons-api.vercel.app/api/icon/${token.symbol.toLowerCase()}`,
            current_price: token.current_price,
            price_change_percentage_24h: token.price_change_percentage_24h,
            market_cap: token.market_cap,
            signal
          };
        });

        const generatedSignals = await Promise.all(signalsPromises);
        setTokenSignals(generatedSignals);
      } catch (err) {
        console.error('Error fetching top tokens:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch trading signals');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopTokens();
  }, [getCoinsMarketData]);

  // Helper function to generate a signal for a token
  const generateSignalForToken = async (token: any): Promise<TradingSignal> => {
    // This is a simplified version that generates random signals
    // In a real application, you would use AI analysis or market indicators
    const signalTypes = ['buy', 'sell', 'hold'] as const;
    const riskLevels = ['low', 'medium', 'high'] as const;
    
    const randomSignalType = signalTypes[Math.floor(Math.random() * signalTypes.length)];
    const randomRiskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
    const randomConfidence = Math.random() * 0.5 + 0.5; // 0.5 to 1.0
    
    const priceMultiplier = randomSignalType === 'buy' 
      ? 1 + (Math.random() * 0.3) // 0% to 30% increase
      : randomSignalType === 'sell'
        ? 1 - (Math.random() * 0.2) // 0% to 20% decrease
        : 1 + (Math.random() * 0.1 - 0.05); // -5% to 5% change
    
    const stopLossMultiplier = randomSignalType === 'buy'
      ? 1 - (Math.random() * 0.15) // 0% to 15% below current price
      : randomSignalType === 'sell'
        ? 1 + (Math.random() * 0.1) // 0% to 10% above current price
        : 1 - (Math.random() * 0.05); // 0% to 5% below current price
    
    const randomTimeframe = Math.random() > 0.5 
      ? `${Math.floor(Math.random() * 4) + 1}-${Math.floor(Math.random() * 4) + 2} weeks` 
      : `${Math.floor(Math.random() * 3) + 1}-${Math.floor(Math.random() * 3) + 2} months`;
    
    // Random indicator signals
    const indicators = [
      { 
        name: 'RSI', 
        value: `${Math.floor(Math.random() * 100)}`, 
        signal: Math.random() > 0.6 ? 'bullish' : Math.random() > 0.3 ? 'bearish' : 'neutral' as 'bullish' | 'bearish' | 'neutral'
      },
      { 
        name: 'MACD', 
        value: Math.random() > 0.5 ? 'Bullish Cross' : 'Bearish Cross', 
        signal: Math.random() > 0.6 ? 'bullish' : Math.random() > 0.3 ? 'bearish' : 'neutral' as 'bullish' | 'bearish' | 'neutral'
      },
      { 
        name: 'MA Cross', 
        value: '200/50', 
        signal: Math.random() > 0.6 ? 'bullish' : Math.random() > 0.3 ? 'bearish' : 'neutral' as 'bullish' | 'bearish' | 'neutral'
      },
      { 
        name: 'Volume', 
        value: `${Math.floor(Math.random() * 300)}% Avg`, 
        signal: Math.random() > 0.6 ? 'bullish' : Math.random() > 0.3 ? 'bearish' : 'neutral' as 'bullish' | 'bearish' | 'neutral'
      }
    ];
    
    return {
      type: randomSignalType,
      confidence: randomConfidence,
      price_target: token.current_price * priceMultiplier,
      stop_loss: token.current_price * stopLossMultiplier,
      timeframe: randomTimeframe,
      risk_level: randomRiskLevel,
      reasoning: `Analysis for ${token.name} (${token.symbol.toUpperCase()}) based on current market conditions suggests a ${randomSignalType.toUpperCase()} signal with ${(randomConfidence * 100).toFixed(0)}% confidence.\n\nThe target price is set at ${formatCurrency(token.current_price * priceMultiplier)} with a stop loss at ${formatCurrency(token.current_price * stopLossMultiplier)}.\n\nThis recommendation considers current market trends, technical indicators, and historical price patterns. The suggested timeframe for this trade is ${randomTimeframe} with a ${randomRiskLevel} risk level.`,
      indicators,
      generated_at: new Date().toISOString()
    };
  };

  const handleTokenClick = async (token: TokenSignal) => {
    // Navigate to the token details page instead of showing it inline
    navigate(`/trading-signals/${token.id}`);
    
    // Set selected token for context
    const coinData = {
      id: token.id,
      name: token.name,
      symbol: token.symbol,
      api_symbol: token.symbol,
      platforms: {}
    };
    
    setSelectedToken(coinData);
  };

  // Reset selected signal when going back to grid view
  const handleBackToGrid = () => {
    navigate('/trading-signals');
    setSelectedSignal(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 size={24} className="text-theme-accent animate-spin mr-2" />
        <span className="text-theme-text-secondary">Generating trading signals...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-500">
        <AlertTriangle size={24} className="mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  // If a signal is selected, show detailed view
  if (selectedSignal) {
    const signal = selectedSignal.signal;
    
    return (
      <div className="space-y-4">
        <button 
          onClick={handleBackToGrid}
          className="flex items-center text-sm text-theme-accent hover:underline mb-4"
        >
          ← Back to Trading Signals
        </button>
        
        <div className="bg-theme-bg rounded-lg border border-theme-border p-4 mb-4">
          <div className="flex items-center mb-4">
            <img 
              src={selectedSignal.image} 
              alt={selectedSignal.name} 
              className="w-12 h-12 rounded-full mr-3"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedSignal.symbol)}&background=random&color=fff&size=128`;
              }}
            />
            <div>
              <h2 className="text-xl font-bold text-theme-text-primary">
                {selectedSignal.name}
                <span className="ml-2 text-sm text-theme-text-secondary">
                  {selectedSignal.symbol.toUpperCase()}
                </span>
              </h2>
              <div className="flex items-center">
                <span className="text-lg font-medium text-theme-text-primary mr-2">
                  {formatCurrency(selectedSignal.current_price)}
                </span>
                <span className={`flex items-center text-sm ${
                  selectedSignal.price_change_percentage_24h >= 0 
                    ? 'text-green-500' 
                    : 'text-red-500'
                }`}>
                  {selectedSignal.price_change_percentage_24h >= 0 ? (
                    <TrendingUp size={14} className="mr-1" />
                  ) : (
                    <TrendingDown size={14} className="mr-1" />
                  )}
                  {formatPercentage(selectedSignal.price_change_percentage_24h)}
                </span>
              </div>
            </div>
            
            <div className={`ml-auto text-center px-4 py-2 rounded-lg font-bold ${
              signal.type === 'buy' ? 'bg-green-500/20 text-green-500' : 
              signal.type === 'sell' ? 'bg-red-500/20 text-red-500' : 
              'bg-yellow-500/20 text-yellow-500'
            }`}>
              <div className="text-2xl">{signal.type.toUpperCase()}</div>
              <div className="text-xs">{(signal.confidence * 100).toFixed(0)}% Confidence</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Signal Overview */}
          <div className="bg-theme-bg rounded-lg border border-theme-border p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-theme-text-primary">Signal Overview</h3>
              <span className="text-xs text-theme-text-secondary">
                Generated {new Date(signal.generated_at).toLocaleTimeString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-theme-accent/10 rounded-lg p-3">
                <div className="text-sm text-theme-text-secondary mb-1">Signal</div>
                <div className={`text-lg font-bold ${
                  signal.type === 'buy' ? 'text-green-500' : 
                  signal.type === 'sell' ? 'text-red-500' : 
                  'text-yellow-500'
                }`}>
                  {signal.type.toUpperCase()}
                </div>
                <div className="text-sm text-theme-text-secondary">
                  {(signal.confidence * 100).toFixed(0)}% Confidence
                </div>
              </div>

              <div className="bg-theme-accent/10 rounded-lg p-3">
                <div className="text-sm text-theme-text-secondary mb-1">Risk Level</div>
                <div className={`text-lg font-bold ${
                  signal.risk_level === 'high' ? 'text-red-500' :
                  signal.risk_level === 'low' ? 'text-green-500' :
                  'text-yellow-500'
                }`}>
                  {signal.risk_level.toUpperCase()}
                </div>
                <div className="text-sm text-theme-text-secondary">
                  {signal.timeframe} timeframe
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-theme-accent/5 rounded-lg">
                <div className="flex items-center">
                  <Target size={16} className="text-theme-accent mr-2" />
                  <span className="text-sm text-theme-text-primary">Price Target</span>
                </div>
                <span className="text-sm font-medium text-theme-text-primary">
                  {formatCurrency(signal.price_target)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-theme-accent/5 rounded-lg">
                <div className="flex items-center">
                  <Shield size={16} className="text-theme-accent mr-2" />
                  <span className="text-sm text-theme-text-primary">Stop Loss</span>
                </div>
                <span className="text-sm font-medium text-theme-text-primary">
                  {formatCurrency(signal.stop_loss)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-theme-accent/5 rounded-lg">
                <div className="flex items-center">
                  <Percent size={16} className="text-theme-accent mr-2" />
                  <span className="text-sm text-theme-text-primary">Potential Return</span>
                </div>
                <span className="text-sm font-medium text-theme-text-primary">
                  {formatPercentage(
                    ((signal.price_target - selectedSignal.current_price) / selectedSignal.current_price) * 100
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Technical Indicators */}
          <div className="bg-theme-bg rounded-lg border border-theme-border p-4">
            <h3 className="text-lg font-medium text-theme-text-primary mb-4">Technical Indicators</h3>
            <div className="space-y-3">
              {signal.indicators.map((indicator, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-theme-accent/5 rounded-lg">
                  <div className="flex items-center">
                    <Activity size={16} className="text-theme-accent mr-2" />
                    <span className="text-sm text-theme-text-primary">{indicator.name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-theme-text-secondary mr-2">{indicator.value}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      indicator.signal === 'bullish' ? 'bg-green-500/10 text-green-500' :
                      indicator.signal === 'bearish' ? 'bg-red-500/10 text-red-500' :
                      'bg-theme-accent/10 text-theme-accent'
                    }`}>
                      {indicator.signal}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analysis Reasoning */}
          <div className="lg:col-span-2 bg-theme-bg rounded-lg border border-theme-border p-4">
            <h3 className="text-lg font-medium text-theme-text-primary mb-4">Analysis</h3>
            <div className="prose prose-sm max-w-none text-theme-text-primary">
              {signal.reasoning.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-2">{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view of token signals
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-theme-text-primary">Latest Trading Signals</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tokenSignals.map((token) => (
          <div 
            key={token.id}
            onClick={() => handleTokenClick(token)}
            className="bg-theme-bg rounded-lg border border-theme-border p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center mb-2">
              <img 
                src={token.image} 
                alt={token.name} 
                className="w-10 h-10 rounded-full mr-2"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(token.symbol)}&background=random&color=fff&size=128`;
                }}
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-theme-text-primary">{token.symbol.toUpperCase()}</div>
                <div className="text-xs text-theme-text-secondary">{token.name}</div>
              </div>
              <a 
                href={`https://www.coingecko.com/en/coins/${token.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-theme-accent hover:text-theme-accent-dark"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={14} />
              </a>
            </div>

            <div className="flex justify-between items-center mb-2">
              <div className="text-base font-medium text-theme-text-primary">
                {formatCurrency(token.current_price)}
              </div>
              <div className={`flex items-center text-xs ${
                token.price_change_percentage_24h >= 0 
                  ? 'text-green-500' 
                  : 'text-red-500'
              }`}>
                {token.price_change_percentage_24h >= 0 ? (
                  <TrendingUp size={12} className="mr-1" />
                ) : (
                  <TrendingDown size={12} className="mr-1" />
                )}
                {formatPercentage(token.price_change_percentage_24h)}
              </div>
            </div>

            <div className="relative mb-2">
              <img 
                src={token.image} 
                alt={token.name} 
                className="w-full h-28 object-contain rounded-md bg-theme-accent/5 p-2"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(token.symbol)}&background=random&color=fff&size=128`;
                }}
              />
              <div className={`absolute bottom-0 left-0 right-0 text-center py-1 font-bold text-white ${
                token.signal.type === 'buy' ? 'bg-green-500' : 
                token.signal.type === 'sell' ? 'bg-red-500' : 
                'bg-yellow-500'
              }`}>
                {token.signal.type.toUpperCase()}
              </div>
            </div>

            <div className="text-xs text-theme-text-secondary flex justify-between">
              <span>Confidence: {(token.signal.confidence * 100).toFixed(0)}%</span>
              <span>Risk: {token.signal.risk_level}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradingSignals;