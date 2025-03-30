import React, { useState } from 'react';
// Import only the icons we're certain exist in the dependencies
import { 
  FaWallet, 
  FaTwitter,
  FaBell,
  FaFile
} from 'react-icons/fa';
import { BsDiscord } from 'react-icons/bs';
import { AiFillSetting } from 'react-icons/ai';

// Simplified activity bar that's less likely to cause rendering errors
const ActivityBar: React.FC = () => {
  const [isConnected] = useState(true);

  return (
    <div className="fixed top-0 left-0 right-0 w-full bg-gray-900 text-white py-2 px-4 flex items-center justify-between border-b border-gray-800 z-20 shadow-md">
      <div className="flex items-center space-x-4">
        {/* Preset Toggle */}
        <div className="flex items-center bg-blue-900 bg-opacity-30 px-2 py-1 rounded">
          <span className="text-blue-400 mr-2 font-medium text-sm">PRESET 1</span>
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
      </div>
      
      <div className="flex items-center space-x-3">
        {/* Connection Status */}
        <div className="flex items-center space-x-1 px-2 py-1 rounded cursor-pointer">
          <span className={isConnected ? "w-2 h-2 rounded-full bg-green-500" : "w-2 h-2 rounded-full bg-red-500"}></span>
          <span className={isConnected ? "text-green-400 text-sm" : "text-red-400 text-sm"}>
            Connection is {isConnected ? 'stable' : 'unstable'}
          </span>
        </div>
        
        {/* Action Icons */}
        <div className="flex items-center space-x-4">
          <FaBell className="text-gray-400 cursor-pointer hover:text-gray-200" />
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