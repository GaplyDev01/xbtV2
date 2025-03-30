import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Filter, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToken } from '../../context/TokenContext';

// Define interface for economic events
interface EconomicEvent {
  date: string;
  time: string;
  event: string;
  impact: 'high' | 'medium' | 'low';
  currency: string;
  forecast: string;
  previous: string;
  highlighted?: boolean;
  timeframe?: string;
}

// Mock data for events (to be replaced with API)
const mockEvents: EconomicEvent[] = [
  {
    date: '2025-03-15',
    time: '14:00 UTC',
    event: 'FED Interest Rate Decision',
    impact: 'high',
    currency: 'USD',
    forecast: 'No change expected',
    previous: '5.25%'
  },
  {
    date: '2025-03-15',
    time: '18:30 UTC',
    event: 'BTC Options Expiry ($2.7B)',
    impact: 'medium',
    currency: 'CRYPTO',
    forecast: 'N/A',
    previous: 'N/A'
  },
  {
    date: '2025-03-16',
    time: '12:30 UTC',
    event: 'US CPI Data Release',
    impact: 'high',
    currency: 'USD',
    forecast: '2.8% y/y',
    previous: '3.1% y/y'
  },
  {
    date: '2025-03-20',
    time: '08:00 UTC',
    event: 'ETH Shanghai Upgrade',
    impact: 'high',
    currency: 'CRYPTO',
    forecast: 'N/A',
    previous: 'N/A'
  }
];

// In a real implementation, this would be a service function to fetch economic events
const fetchEconomicEvents = async (tokenSymbol?: string): Promise<EconomicEvent[]> => {
  // This should be replaced with real API call based on needs.md
  // Simulating API call with 500ms delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock successful response with data
  // For tokenSymbol filter, we'd normally send this to the API
  if (tokenSymbol) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // For demo, create some token-specific events
    const tokenEvents: EconomicEvent[] = [
      {
        date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:00 UTC`,
        event: `${tokenSymbol.toUpperCase()} Network Upgrade`,
        impact: 'high',
        currency: 'CRYPTO',
        forecast: 'N/A',
        previous: 'N/A',
        highlighted: true
      },
      {
        date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:30 UTC`,
        event: `${tokenSymbol.toUpperCase()} Options Expiry`,
        impact: 'medium',
        currency: 'CRYPTO',
        forecast: 'N/A',
        previous: 'N/A',
        highlighted: true
      }
    ];
    
    // Return a mix of token-specific and general events
    return [...tokenEvents, ...mockEvents].slice(0, 5);
  }
  
  return mockEvents;
};

const EconomicCalendar: React.FC = () => {
  const { selectedToken } = useToken();
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'crypto' | 'macro'>('all');
  
  // Get current month and year for display
  const now = new Date();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonth = monthNames[now.getMonth()];
  const currentYear = now.getFullYear();

  // Fetch economic events on mount and when token changes
  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await fetchEconomicEvents(selectedToken?.symbol);
        
        // Apply filter if needed
        let filteredData = data;
        if (filter === 'crypto') {
          filteredData = data.filter(event => event.currency === 'CRYPTO');
        } else if (filter === 'macro') {
          filteredData = data.filter(event => event.currency !== 'CRYPTO');
        }
        
        setEvents(filteredData);
      } catch (err) {
        console.error('Error fetching economic events:', err);
        setError('Failed to load economic calendar');
        setEvents([]); // Clear events on error
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEvents();
  }, [selectedToken, filter]);

  // Handle filter change
  const handleFilterChange = (newFilter: 'all' | 'crypto' | 'macro') => {
    setFilter(newFilter);
  };

  // Handle refresh
  const handleRefresh = () => {
    // Re-fetch events with current settings
    const loadEvents = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await fetchEconomicEvents(selectedToken?.symbol);
        
        // Apply filter
        let filteredData = data;
        if (filter === 'crypto') {
          filteredData = data.filter(event => event.currency === 'CRYPTO');
        } else if (filter === 'macro') {
          filteredData = data.filter(event => event.currency !== 'CRYPTO');
        }
        
        setEvents(filteredData);
      } catch (err) {
        console.error('Error refreshing economic events:', err);
        setError('Failed to refresh calendar');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEvents();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <Calendar size={14} className="text-theme-accent mr-1" />
          <span className="text-[10px] font-medium text-theme-text-primary">
            {currentMonth} {currentYear}
            {selectedToken && (
              <span className="ml-1 text-[8px] px-1.5 py-0.5 rounded-full bg-theme-accent/10 text-theme-accent">
                {selectedToken.symbol.toUpperCase()}
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center">
          <div className="flex space-x-1 mr-2">
            <button 
              className={`text-[9px] px-2 py-0.5 rounded-full ${
                filter === 'all' 
                  ? 'bg-theme-accent text-theme-bg' 
                  : 'bg-theme-accent/10 text-theme-accent hover:bg-theme-accent/20'
              }`}
              onClick={() => handleFilterChange('all')}
            >
              All
            </button>
            <button 
              className={`text-[9px] px-2 py-0.5 rounded-full ${
                filter === 'crypto' 
                  ? 'bg-theme-accent text-theme-bg' 
                  : 'bg-theme-accent/10 text-theme-accent hover:bg-theme-accent/20'
              }`}
              onClick={() => handleFilterChange('crypto')}
            >
              Crypto
            </button>
            <button 
              className={`text-[9px] px-2 py-0.5 rounded-full ${
                filter === 'macro' 
                  ? 'bg-theme-accent text-theme-bg' 
                  : 'bg-theme-accent/10 text-theme-accent hover:bg-theme-accent/20'
              }`}
              onClick={() => handleFilterChange('macro')}
            >
              Macro
            </button>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className="text-theme-accent/70 hover:text-theme-accent"
          >
            <RefreshCw size={10} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-theme-accent/10 p-2 rounded-md text-[10px] text-theme-text-secondary mb-2">
          <AlertTriangle size={12} className="inline-block mr-1 text-theme-accent" />
          {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="flex items-start p-2 rounded-md border-l-2 border-theme-accent/20 bg-theme-accent/5 animate-pulse">
              <div className="mr-2">
                <div className="w-2 h-2 rounded-full mt-1 bg-theme-accent/20"></div>
              </div>
              <div className="flex-grow">
                <div className="w-3/4 h-2.5 bg-theme-accent/20 rounded mb-1.5"></div>
                <div className="w-1/2 h-2 bg-theme-accent/20 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {events.length > 0 ? (
            events.map((event, index) => (
              <div 
                key={index} 
                className={`flex items-start p-2 rounded-md ${
                  event.highlighted
                    ? 'border-l-2 border-theme-accent bg-theme-accent/20' 
                    : 'border-l-2 border-theme-accent bg-theme-accent/10'
                } transition-colors duration-200`}
              >
                <div className="mr-2">
                  <div className={`w-2 h-2 rounded-full mt-1 ${
                    event.impact === 'high' 
                      ? 'bg-red-400' 
                      : event.impact === 'medium'
                      ? 'bg-orange-400'
                      : 'bg-theme-accent'
                  }`}></div>
                </div>
                <div className="flex-grow">
                  <div className="text-[10px] font-medium text-theme-text-primary">
                    {event.event}
                    {event.highlighted && (
                      <span className="ml-1 text-[7px] text-theme-accent">★</span>
                    )}
                  </div>
                  <div className="flex justify-between text-[9px]">
                    <span className="text-theme-text-secondary">{event.date} • {event.time}</span>
                    <span className="flex items-center text-theme-accent">
                      <Clock size={9} className="mr-0.5" />
                      {event.impact}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-[10px] text-theme-text-secondary">
              No events found for the selected filter
            </div>
          )}
        </div>
      )}
      
      <div className="mt-auto pt-2 text-center">
        <button className="text-[10px] text-theme-accent hover:text-theme-accent-dark flex items-center mx-auto">
          <Filter size={10} className="mr-1" />
          View Full Calendar
        </button>
      </div>
    </div>
  );
};

export default EconomicCalendar;