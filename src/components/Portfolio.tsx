import React from 'react';
import CanonicalLink from './CanonicalLink';
import { PortfolioSnapshot } from './ui';
import { Briefcase, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

const Portfolio: React.FC = () => {
  return (
    <>
      <CanonicalLink path="/portfolio" />
      <div className="space-y-4">
        <div className="bg-theme-bg bg-opacity-70 backdrop-blur-sm rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-xl font-bold text-theme-text-primary flex items-center">
                <Briefcase size={24} className="mr-2 text-theme-accent" />
                Portfolio Management
              </h2>
              <p className="text-sm text-theme-accent">Track and analyze your investments</p>
            </div>
            <button className="flex items-center px-4 py-2 bg-theme-accent text-theme-bg rounded-lg hover:bg-theme-accent-dark transition-colors">
              <TrendingUp size={16} className="mr-2" />
              Add Transaction
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Portfolio Overview */}
            <div className="lg:col-span-2">
              <PortfolioSnapshot />
            </div>
            
            {/* Quick Actions */}
            <div className="space-y-4">
              <div className="bg-theme-accent/10 rounded-lg p-4 border border-theme-border">
                <h3 className="text-sm font-medium text-theme-text-primary mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-between p-3 bg-theme-bg rounded-lg hover:bg-theme-accent/5 transition-colors">
                    <span className="text-sm text-theme-text-primary">Add New Asset</span>
                    <ArrowRight size={16} className="text-theme-accent" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-theme-bg rounded-lg hover:bg-theme-accent/5 transition-colors">
                    <span className="text-sm text-theme-text-primary">Import Portfolio</span>
                    <ArrowRight size={16} className="text-theme-accent" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-theme-bg rounded-lg hover:bg-theme-accent/5 transition-colors">
                    <span className="text-sm text-theme-text-primary">Connect Exchange</span>
                    <ArrowRight size={16} className="text-theme-accent" />
                  </button>
                </div>
              </div>
              
              <div className="bg-theme-accent/10 rounded-lg p-4 border border-theme-border">
                <h3 className="text-sm font-medium text-theme-text-primary mb-3">Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-theme-text-secondary">24h Change</span>
                    <span className="text-sm text-green-500 flex items-center">
                      <TrendingUp size={14} className="mr-1" />
                      +2.45%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-theme-text-secondary">7d Change</span>
                    <span className="text-sm text-red-500 flex items-center">
                      <TrendingDown size={14} className="mr-1" />
                      -1.23%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-theme-text-secondary">30d Change</span>
                    <span className="text-sm text-green-500 flex items-center">
                      <TrendingUp size={14} className="mr-1" />
                      +8.67%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Portfolio;