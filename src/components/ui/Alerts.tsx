import React from 'react';
import { Bell, ArrowUp, ArrowDown, Activity } from 'lucide-react';

const Alerts: React.FC = () => {
  const alerts = [
    {
      type: 'price',
      asset: 'BTC',
      condition: 'above',
      value: '$48,000',
      status: 'pending'
    },
    {
      type: 'price',
      asset: 'ETH',
      condition: 'below',
      value: '$3,000',
      status: 'triggered',
      time: '2h ago'
    },
    {
      type: 'volume',
      asset: 'SOL',
      condition: 'spike',
      value: '+200%',
      status: 'pending'
    },
    {
      type: 'volatility',
      asset: 'Market',
      condition: 'high',
      status: 'triggered',
      time: '5h ago'
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-medium text-theme-text-primary">Your Alerts</span>
        <button className="text-[9px] bg-theme-accent hover:bg-theme-accent-dark text-theme-bg px-2 py-0.5 rounded-full flex items-center">
          <Bell size={9} className="mr-0.5" />
          New
        </button>
      </div>
      
      <div className="space-y-2">
        {alerts.map((alert, index) => (
          <div 
            key={index} 
            className={`p-1.5 rounded-md border-l-2 ${
              alert.status === 'triggered' 
                ? 'bg-theme-accent/10 border-theme-accent'
                : 'bg-theme-accent/5 border-theme-accent/50'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center">
                {alert.type === 'price' && alert.condition === 'above' && (
                  <ArrowUp size={10} className="text-theme-accent mr-1" />
                )}
                {alert.type === 'price' && alert.condition === 'below' && (
                  <ArrowDown size={10} className="text-theme-accent mr-1" />
                )}
                {alert.type === 'volume' && (
                  <Activity size={10} className="text-theme-accent mr-1" />
                )}
                {alert.type === 'volatility' && (
                  <Activity size={10} className="text-theme-accent mr-1" />
                )}
                <span className="text-[10px] font-medium text-theme-text-primary">{alert.asset}</span>
              </div>
              <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${
                alert.status === 'triggered' 
                  ? 'bg-theme-accent/20 text-theme-accent'
                  : 'bg-theme-accent/10 text-theme-accent'
              }`}>
                {alert.status === 'triggered' ? 'Triggered' : 'Pending'}
              </span>
            </div>
            
            <div className="flex justify-between text-[9px]">
              <span className="text-theme-text-secondary">
                {alert.type === 'price' && `Price ${alert.condition} ${alert.value}`}
                {alert.type === 'volume' && `Volume ${alert.condition} ${alert.value}`}
                {alert.type === 'volatility' && `${alert.condition} volatility`}
              </span>
              {alert.status === 'triggered' && (
                <span className="text-theme-text-secondary">{alert.time}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-auto pt-2 text-center">
        <button className="text-[10px] text-theme-accent hover:text-theme-accent-dark">
          View All Alerts
        </button>
      </div>
    </div>
  );
};

export default Alerts;