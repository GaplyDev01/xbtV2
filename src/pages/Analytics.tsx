import React from 'react';
import DuneAnalytics from '../components/ui/DuneAnalytics';
// import DuneTokenVisualization from '../components/ui/DuneTokenVisualization';
import { Helmet } from 'react-helmet';

const Analytics: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Solana Analytics | Trading Dashboard</title>
        <meta name="description" content="Comprehensive analytics for the Solana ecosystem, including trading activities, wallet analysis, and token performance." />
      </Helmet>
      
      <h1 className="text-3xl font-bold mb-6">Solana Analytics Dashboard</h1>
      <p className="text-theme-text-secondary mb-8">
        Comprehensive data-driven insights into the Solana ecosystem. All data sourced from Dune Analytics.
      </p>
      
      <div className="space-y-12">
        {/* Comprehensive analytics from multiple Dune queries */}
        <section>
          <DuneAnalytics />
        </section>
        
        {/* Removed token analysis visualization as it's redundant */}
      </div>
    </div>
  );
};

export default Analytics; 