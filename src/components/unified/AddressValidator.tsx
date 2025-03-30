import React, { useState, useEffect } from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface AddressValidatorProps {
  address: string;
  blockchain: 'ethereum' | 'solana' | 'bitcoin' | 'polkadot';
  className?: string;
  onValidationChange?: (isValid: boolean) => void;
}

const AddressValidator: React.FC<AddressValidatorProps> = ({
  address,
  blockchain,
  className = '',
  onValidationChange
}) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!address) {
      setIsValid(null);
      setErrorMessage('');
      if (onValidationChange) onValidationChange(false);
      return;
    }

    // Reset state when address changes
    setIsValidating(true);
    setIsValid(null);
    setErrorMessage('');

    // Simple validation based on regex patterns and address length
    // In a real app, you might use blockchain-specific validation libraries
    const validateAddress = () => {
      let valid = false;
      let error = '';

      switch (blockchain) {
        case 'ethereum':
          // Ethereum addresses are 42 characters long and start with 0x
          valid = /^0x[a-fA-F0-9]{40}$/.test(address);
          error = valid ? '' : 'Invalid Ethereum address format';
          break;
        
        case 'solana':
          // Solana addresses are typically 32-44 characters, base58 encoded
          valid = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
          error = valid ? '' : 'Invalid Solana address format';
          break;
        
        case 'bitcoin':
          // Bitcoin addresses vary in format (Legacy, SegWit, Bech32)
          // This is a simplified validation
          const btcPatterns = [
            /^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/, // Legacy
            /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/, // SegWit
            /^bc1[a-zA-Z0-9]{39,59}$/ // Bech32
          ];
          valid = btcPatterns.some(pattern => pattern.test(address));
          error = valid ? '' : 'Invalid Bitcoin address format';
          break;
        
        case 'polkadot':
          // Polkadot addresses typically start with 1 and are 47-48 characters
          valid = /^1[a-zA-Z0-9]{46,47}$/.test(address);
          error = valid ? '' : 'Invalid Polkadot address format';
          break;
        
        default:
          error = 'Unsupported blockchain';
      }

      // Simulate network delay for validation
      setTimeout(() => {
        setIsValid(valid);
        setErrorMessage(error);
        setIsValidating(false);
        if (onValidationChange) onValidationChange(valid);
      }, 500);
    };

    const timer = setTimeout(validateAddress, 300);
    return () => clearTimeout(timer);
  }, [address, blockchain, onValidationChange]);

  if (isValid === null && !address) {
    return null;
  }

  return (
    <div className={`address-validator mt-2 ${className}`}>
      {isValidating ? (
        <div className="flex items-center text-theme-text-secondary text-sm">
          <div className="w-4 h-4 mr-2 rounded-full border-2 border-t-transparent border-theme-text-secondary animate-spin"></div>
          Validating address...
        </div>
      ) : isValid === true ? (
        <div className="flex items-center text-green-500 text-sm">
          <Check size={16} className="mr-2" />
          Valid {blockchain} address
        </div>
      ) : isValid === false ? (
        <Alert variant="warning" className="mt-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {errorMessage || `Invalid ${blockchain} address`}
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
};

export default AddressValidator;
