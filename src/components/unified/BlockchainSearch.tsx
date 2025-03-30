import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import SolanaTokenSearch from '../platforms/solana/TokenSearch';
import EthereumTokenSearch from '../platforms/ethereum/TokenSearch';
import BitcoinTransactionViewer from '../platforms/bitcoin/TransactionViewer';
import PolkadotValidatorList from '../platforms/polkadot/ValidatorList';
import { CoinSearchResult } from '../../services/cryptoApi';

interface BlockchainSearchProps {
  onSelectToken?: (token: CoinSearchResult, blockchain: string) => void;
  className?: string;
  defaultTab?: string;
}

const BlockchainSearch: React.FC<BlockchainSearchProps> = ({
  onSelectToken,
  className = '',
  defaultTab = 'ethereum'
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTokenSelect = (token: CoinSearchResult) => {
    if (onSelectToken) {
      onSelectToken(token, activeTab);
    }
  };

  return (
    <div className={`bg-theme-bg border border-theme-border rounded-lg p-4 ${className}`}>
      <Tabs defaultValue={defaultTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="ethereum" className="text-sm">
            Ethereum
          </TabsTrigger>
          <TabsTrigger value="solana" className="text-sm">
            Solana
          </TabsTrigger>
          <TabsTrigger value="bitcoin" className="text-sm">
            Bitcoin
          </TabsTrigger>
          <TabsTrigger value="polkadot" className="text-sm">
            Polkadot
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="ethereum" className="mt-2">
          <EthereumTokenSearch
            onSelectToken={handleTokenSelect}
            placeholder="Search Ethereum tokens..."
          />
        </TabsContent>
        
        <TabsContent value="solana" className="mt-2">
          <SolanaTokenSearch
            onSelectToken={handleTokenSelect}
            placeholder="Search Solana tokens..."
          />
        </TabsContent>
        
        <TabsContent value="bitcoin" className="mt-2">
          <BitcoinTransactionViewer limit={5} />
        </TabsContent>
        
        <TabsContent value="polkadot" className="mt-2">
          <PolkadotValidatorList limit={5} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlockchainSearch;
