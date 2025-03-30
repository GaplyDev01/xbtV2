import React, { useState } from 'react';
import { 
  FaWallet, 
  FaTwitter, 
  FaEthereum, 
  FaBitcoin,
  FaBell,
  FaFile,
  FaBoxes
} from 'react-icons/fa';
import { SiDogecoin } from 'react-icons/si';
import { TbCurrencyDollar } from 'react-icons/tb';
import { AiFillSetting } from 'react-icons/ai';
import { VscCircleFilled } from 'react-icons/vsc';
import { BsDiscord } from 'react-icons/bs';
import { RiExchangeDollarFill } from 'react-icons/ri';

const ActivityBar: React.FC = () => {
  const [preset, setPreset] = useState(1);
  const [isConnected, setIsConnected] = useState(true);
  const [currency, setCurrency] = useState('US-C');

  // Toggle connection status (for demo purposes)
  const toggleConnection = () => {
    setIsConnected(!isConnected);
  };

  return (
    <div className="fixed top-0 left-0 right-0 w-full bg-gray-900 text-white py-2 px-4 flex items-center justify-between border-b border-gray-800 z-20 shadow-md">
      <div className="flex items-center space-x-4 overflow-x-auto scrollbar-none">
        {/* Preset Toggle */}
        <div className="flex items-center bg-blue-900 bg-opacity-30 px-2 py-1 rounded">
          <span className="text-blue-400 mr-2 font-medium text-sm">PRESET {preset}</span>
        </div>

        {/* Counter Indicators */}
        <div className="flex items-center space-x-2 px-2 py-1 bg-gray-800 bg-opacity-30 rounded">
          <span className="font-semibold text-gray-300">1</span>
          <span className="text-gray-400">≡</span>
          <span className="font-semibold text-gray-300">0</span>
          <span className="text-gray-500">▼</span>
        </div>

        {/* Wallet Tracker */}
        <div className="flex items-center space-x-1">
          <div className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-800 cursor-pointer">
            <FaWallet className="text-gray-400" />
            <span className="text-gray-300 text-sm">Wallet Tracker</span>
          </div>
        </div>

        {/* Twitter Tracker */}
        <div className="flex items-center space-x-1">
          <div className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-800 cursor-pointer">
            <FaTwitter className="text-gray-400" />
            <span className="text-gray-300 text-sm">Twitter Tracker</span>
          </div>
        </div>

        {/* Crypto Values */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <FaBitcoin className="text-orange-500 mr-1" />
            <span className="text-gray-200">$82.8K</span>
          </div>
          
          <div className="flex items-center">
            <FaEthereum className="text-blue-400 mr-1" />
            <span className="text-gray-200">$1831</span>
          </div>
          
          <div className="flex items-center">
            <SiDogecoin className="text-green-400 mr-1" />
            <span className="text-gray-200">$126.66</span>
          </div>
          
          <div className="flex items-center">
            <TbCurrencyDollar className="text-gray-300 mr-1" />
            <span className="text-gray-200">$51.3K</span>
          </div>
          
          <div className="flex items-center">
            <RiExchangeDollarFill className="text-gray-300 mr-1" />
            <span className="text-gray-200">0.0₄</span>
          </div>
          
          <div className="flex items-center">
            <TbCurrencyDollar className="text-gray-300 mr-1" />
            <span className="text-gray-200">0.0₂₆</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Connection Status */}
        <div 
          className="flex items-center space-x-1 px-2 py-1 rounded cursor-pointer"
          onClick={toggleConnection}
        >
          <VscCircleFilled className={isConnected ? "text-green-500" : "text-red-500"} />
          <span className={isConnected ? "text-green-400 text-sm" : "text-red-400 text-sm"}>
            Connection is {isConnected ? 'stable' : 'unstable'}
          </span>
        </div>
        
        {/* Currency Selector */}
        <div className="flex items-center space-x-1 px-2 py-1 bg-gray-800 bg-opacity-30 rounded cursor-pointer">
          <span className="text-gray-300 text-sm">{currency}</span>
          <span className="text-gray-500">▼</span>
        </div>
        
        {/* Action Icons */}
        <div className="flex items-center space-x-4">
          <FaBell className="text-gray-400 cursor-pointer hover:text-gray-200" />
          <FaBoxes className="text-gray-400 cursor-pointer hover:text-gray-200" />
          <AiFillSetting className="text-gray-400 cursor-pointer hover:text-gray-200" />
          <BsDiscord className="text-gray-400 cursor-pointer hover:text-gray-200" />
          <FaTwitter className="text-gray-400 cursor-pointer hover:text-gray-200" />
          <FaFile className="text-gray-400 cursor-pointer hover:text-gray-200" />
        </div>
      </div>
    </div>
  );
};

export default ActivityBar; 