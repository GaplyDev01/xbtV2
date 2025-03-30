import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCrypto } from '../context/CryptoContext';
import { useToken } from '../context/TokenContext';
import TradingSignals from '../components/ui/TradingSignals';
import { Loader2, ArrowLeft } from 'lucide-react';

const TradingSignalDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCoinsMarketData } = useCrypto();
  const { setSelectedToken } = useToken();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokenData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!id) {
          throw new Error('Token ID not provided');
        }

        // Fetch token data
        const data = await getCoinsMarketData('usd', [id]);
        
        if (data && data.length > 0) {
          // Set the selected token for the trading signals component
          setSelectedToken({
            id: data[0].id,
            name: data[0].name,
            symbol: data[0].symbol,
            api_symbol: data[0].symbol,
            platforms: {}
          });
        } else {
          throw new Error('Token not found');
        }
      } catch (err) {
        console.error('Error fetching token data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch token data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenData();
  }, [id, getCoinsMarketData, setSelectedToken]);

  return (
    <div className="container mx-auto px-4 py-6">
      <button 
        onClick={() => navigate('/trading-signals')}
        className="flex items-center text-theme-accent hover:underline mb-6"
      >
        <ArrowLeft size={18} className="mr-2" />
        Back to Trading Signals
      </button>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="text-theme-accent animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg p-4 mb-6">
          {error}
        </div>
      ) : (
        <TradingSignals />
      )}
    </div>
  );
};

export default TradingSignalDetails; 