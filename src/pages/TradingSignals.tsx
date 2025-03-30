import React from 'react';
import { Helmet } from 'react-helmet';
import TradingSignalsComponent from '../components/ui/TradingSignals';

const TradingSignalsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <Helmet>
        <title>Trading Signals | TradesXBT</title>
      </Helmet>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-theme-text-primary">Trading Signals</h1>
        <p className="text-theme-text-secondary mt-2">
          AI-generated trading signals for popular cryptocurrencies
        </p>
      </div>

      <TradingSignalsComponent />
    </div>
  );
};

export default TradingSignalsPage; 