import React, { useState, useEffect } from 'react';
import { Loader2, ExternalLink, ChevronRight, Award, Users, ArrowUpDown, RefreshCw } from 'lucide-react';

interface Validator {
  address: string;
  name: string;
  totalStake: number;
  ownStake: number;
  commission: number;
  nominators: number;
  active: boolean;
  apy: number;
}

interface ValidatorListProps {
  className?: string;
  limit?: number;
  onValidatorSelect?: (validator: Validator) => void;
}

const ValidatorList: React.FC<ValidatorListProps> = ({
  className = '',
  limit = 10,
  onValidatorSelect
}) => {
  const [validators, setValidators] = useState<Validator[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Validator>('totalStake');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [activeOnly, setActiveOnly] = useState<boolean>(true);

  const fetchValidators = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, we would call a Polkadot API
      // This is a mock implementation with dummy data
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Mock validators data
      const mockValidators: Validator[] = [
        {
          address: '14Ns6kKbCoka3sfilSKWJ5XG8yLKMQnMxiKb8PVqiVtqFgNB',
          name: 'Validator A',
          totalStake: 1250000,
          ownStake: 350000,
          commission: 2.5,
          nominators: 245,
          active: true,
          apy: 12.3
        },
        {
          address: '12Y8b4C9r3U7rdS4nDEH15R7QdLyU1D4imxxHQK2QBBkwqN1',
          name: 'Validator B',
          totalStake: 2780000,
          ownStake: 580000,
          commission: 3.0,
          nominators: 312,
          active: true,
          apy: 11.8
        },
        {
          address: '16SPHrAGCKH7zFbR8LwbP5qTQL2TvaP59X4VaHbR8rYDVHQm',
          name: 'Validator C',
          totalStake: 950000,
          ownStake: 250000,
          commission: 2.0,
          nominators: 185,
          active: true,
          apy: 13.1
        },
        {
          address: '15KDFYbHgXystW5SjLjSpcDjGJWmHaFqIUNxnmQpFW3VHiLg',
          name: 'Validator D',
          totalStake: 3450000,
          ownStake: 750000,
          commission: 3.5,
          nominators: 405,
          active: true,
          apy: 11.2
        },
        {
          address: '13RDY9nrJpyTDBSUdBw12dGwhk19sGwsrVZ2bxkzYHBSagP2',
          name: 'Validator E',
          totalStake: 820000,
          ownStake: 220000,
          commission: 2.8,
          nominators: 160,
          active: false,
          apy: 10.5
        },
        {
          address: '1zugcacY7pJP8XxnSQ9YwmPVA3Ej7vFJ4qKQEyjpkCaALM1',
          name: 'Validator F',
          totalStake: 1650000,
          ownStake: 420000,
          commission: 4.0,
          nominators: 278,
          active: true,
          apy: 10.9
        },
        {
          address: '15FxvBFVBp8ZJHTw6MVFkmi6SWxmUGfJcPACYdwYxeEAUj4t',
          name: 'Validator G',
          totalStake: 1120000,
          ownStake: 290000,
          commission: 3.2,
          nominators: 198,
          active: false,
          apy: 11.4
        },
        {
          address: '16Vyqv8J7UczuQpTJQXPHkhŠy9QrBTZ6QxDdqy2T9kJxaqNr',
          name: 'Validator H',
          totalStake: 3980000,
          ownStake: 850000,
          commission: 2.2,
          nominators: 475,
          active: true,
          apy: 12.5
        },
        {
          address: '14ShUZUYUR35RBZW6uVVt1zXDxmSQddkeDdXf1JkMA6P721N',
          name: 'Validator I',
          totalStake: 2250000,
          ownStake: 520000,
          commission: 2.8,
          nominators: 325,
          active: true,
          apy: 11.7
        },
        {
          address: '15yk1DNhoBnYkbpEpVDEzhy1FYpyJu8W7aQrbZJQg9PjEWaH',
          name: 'Validator J',
          totalStake: 1880000,
          ownStake: 480000,
          commission: 3.5,
          nominators: 290,
          active: true,
          apy: 11.0
        }
      ];

      setValidators(mockValidators);
    } catch (err) {
      console.error('Error fetching Polkadot validators:', err);
      setError('Failed to fetch validators. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchValidators();
  }, []);

  const handleSort = (field: keyof Validator) => {
    if (sortField === field) {
      // Toggle sort direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to descending for most fields
      setSortField(field);
      setSortDirection(field === 'commission' ? 'asc' : 'desc');
    }
  };

  const handleRefresh = () => {
    fetchValidators();
  };

  const handleValidatorClick = (validator: Validator) => {
    if (onValidatorSelect) {
      onValidatorSelect(validator);
    }
  };

  // Format numbers for better display
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDOT = (num: number) => {
    const dotValue = num / 10000; // Convert to DOT (assuming the values are in DOT * 10000)
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(dotValue);
  };

  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`;
  };

  // Sort and filter validators
  const sortedValidators = [...validators]
    .filter(v => !activeOnly || v.active)
    .sort((a, b) => {
      if (sortDirection === 'asc') {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });

  // Get the visible validators based on limit
  const visibleValidators = sortedValidators.slice(0, limit);

  return (
    <div className={`bg-theme-bg border border-theme-border rounded-lg p-4 ${className}`}>
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Polkadot Validators</h3>
          <div className="flex items-center space-x-3">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={activeOnly}
                onChange={() => setActiveOnly(!activeOnly)}
                className="mr-2 h-4 w-4 rounded border-theme-border text-theme-accent focus:ring-theme-accent/50"
              />
              Active only
            </label>
            <button
              onClick={handleRefresh}
              className="p-2 bg-theme-accent/10 text-theme-accent hover:bg-theme-accent/20 rounded-lg"
              title="Refresh validators"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={24} className="text-theme-accent animate-spin" />
            <span className="ml-2 text-theme-text-secondary">Loading validators...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-theme-text-secondary">
            <p>{error}</p>
          </div>
        ) : validators.length === 0 ? (
          <div className="text-center py-8 text-theme-text-secondary">
            <p>No validators found.</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-theme-text-secondary mb-2 px-2">
              <div className="col-span-4 flex items-center cursor-pointer" onClick={() => handleSort('name')}>
                <span>Validator</span>
                {sortField === 'name' && (
                  <ArrowUpDown size={12} className="ml-1" />
                )}
              </div>
              <div className="col-span-2 flex items-center justify-end cursor-pointer" onClick={() => handleSort('totalStake')}>
                <span>Total Stake</span>
                {sortField === 'totalStake' && (
                  <ArrowUpDown size={12} className="ml-1" />
                )}
              </div>
              <div className="col-span-2 flex items-center justify-end cursor-pointer" onClick={() => handleSort('commission')}>
                <span>Commission</span>
                {sortField === 'commission' && (
                  <ArrowUpDown size={12} className="ml-1" />
                )}
              </div>
              <div className="col-span-2 flex items-center justify-end cursor-pointer" onClick={() => handleSort('nominators')}>
                <span>Nominators</span>
                {sortField === 'nominators' && (
                  <ArrowUpDown size={12} className="ml-1" />
                )}
              </div>
              <div className="col-span-2 flex items-center justify-end cursor-pointer" onClick={() => handleSort('apy')}>
                <span>Est. APY</span>
                {sortField === 'apy' && (
                  <ArrowUpDown size={12} className="ml-1" />
                )}
              </div>
            </div>

            <div className="overflow-y-auto max-h-80">
              <div className="divide-y divide-theme-border">
                {visibleValidators.map((validator) => (
                  <div 
                    key={validator.address} 
                    className="py-3 px-2 hover:bg-theme-accent/5 rounded-lg cursor-pointer transition-colors duration-150 grid grid-cols-12 gap-2 items-center"
                    onClick={() => handleValidatorClick(validator)}
                  >
                    <div className="col-span-4 flex items-center">
                      <div className={`p-1.5 rounded-full ${validator.active ? 'bg-green-500/10 text-green-500' : 'bg-gray-400/10 text-gray-400'} mr-2`}>
                        <Award size={14} />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{validator.name}</div>
                        <div className="text-xs text-theme-text-secondary">{truncateAddress(validator.address)}</div>
                      </div>
                    </div>
                    <div className="col-span-2 text-right">
                      <div className="text-sm">{formatDOT(validator.totalStake)} DOT</div>
                      <div className="text-xs text-theme-text-secondary">{formatDOT(validator.ownStake)} self</div>
                    </div>
                    <div className="col-span-2 text-right">
                      <div className="text-sm">{validator.commission}%</div>
                    </div>
                    <div className="col-span-2 text-right flex items-center justify-end">
                      <Users size={12} className="mr-1 text-theme-text-secondary" />
                      <span>{formatNumber(validator.nominators)}</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <div className={`inline-block px-2 py-1 rounded-full text-xs ${validator.apy > 12 ? 'bg-green-500/10 text-green-500' : validator.apy > 10 ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        {validator.apy}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {sortedValidators.length > limit && (
              <div className="mt-3 text-center">
                <a 
                  href="https://polkadot.js.org/apps/#/staking" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-theme-accent hover:underline"
                >
                  View all {sortedValidators.length} validators
                  <ChevronRight size={14} className="ml-1" />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidatorList;
