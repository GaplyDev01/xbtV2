import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import AITrader from '../components/AITrader';
import { FaRobot, FaChartLine, FaExchangeAlt, FaInfoCircle } from 'react-icons/fa';

const TradingPage: React.FC = () => {
  return (
    <DashboardLayout className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:space-x-6">
          {/* Main trading view area - 2/3 width on desktop */}
          <div className="lg:w-2/3 bg-gray-800 rounded-lg p-4 mb-6 lg:mb-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Trading Dashboard</h2>
              <div className="flex space-x-2">
                <button className="p-2 bg-blue-600 rounded text-sm">Chart View</button>
                <button className="p-2 bg-gray-700 rounded text-sm">Order Book</button>
                <button className="p-2 bg-gray-700 rounded text-sm">Positions</button>
              </div>
            </div>
            
            {/* Chart placeholder */}
            <div className="bg-gray-900 rounded-lg p-4 h-[400px] flex items-center justify-center border border-gray-700">
              <div className="text-center">
                <FaChartLine className="text-4xl text-blue-400 mx-auto mb-2" />
                <p>Advanced Trading Charts</p>
                <p className="text-gray-400 text-sm mt-2">Price data and technical indicators would appear here</p>
              </div>
            </div>
            
            {/* Trading controls */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <h3 className="font-medium mb-2 flex items-center">
                  <FaExchangeAlt className="mr-2 text-green-400" />
                  Quick Trade
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-400">Asset</label>
                    <select className="w-full bg-gray-800 border border-gray-700 rounded p-2 mt-1">
                      <option>BTC/USD</option>
                      <option>ETH/USD</option>
                      <option>SOL/USD</option>
                      <option>XRP/USD</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Type</label>
                    <select className="w-full bg-gray-800 border border-gray-700 rounded p-2 mt-1">
                      <option>Market</option>
                      <option>Limit</option>
                      <option>Stop</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Amount</label>
                    <input type="text" className="w-full bg-gray-800 border border-gray-700 rounded p-2 mt-1" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Price</label>
                    <input type="text" className="w-full bg-gray-800 border border-gray-700 rounded p-2 mt-1" placeholder="Market" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded">Buy</button>
                  <button className="bg-red-600 hover:bg-red-700 text-white p-2 rounded">Sell</button>
                </div>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <h3 className="font-medium mb-2">Market Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">BTC/USD</span>
                    <span className="text-green-400">$41,235.67 (+2.4%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ETH/USD</span>
                    <span className="text-red-400">$2,876.21 (-0.8%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">SOL/USD</span>
                    <span className="text-green-400">$126.66 (+5.2%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">XRP/USD</span>
                    <span className="text-green-400">$0.58 (+1.3%)</span>
                  </div>
                </div>
                <button className="w-full mt-3 p-2 bg-blue-600 hover:bg-blue-700 rounded text-sm">
                  View All Markets
                </button>
              </div>
            </div>
          </div>
          
          {/* AI Assistant sidebar - 1/3 width on desktop */}
          <div className="lg:w-1/3">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center">
                  <FaRobot className="text-blue-400 mr-2" />
                  AI Trading Assistant
                </h2>
                <button className="text-sm text-gray-400 hover:text-white">
                  <FaInfoCircle />
                </button>
              </div>
              
              <div className="text-sm text-gray-300 mb-4 bg-blue-900/20 p-3 rounded-lg border border-blue-800/50">
                <p>Your AI trading assistant is powered by <span className="font-bold">deepseek-r1-distill-llama-70b</span> and can help with market analysis, trade execution, and more.</p>
              </div>
              
              {/* AI Trading Assistant */}
              <AITrader />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TradingPage; 