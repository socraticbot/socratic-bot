'use client';

import { useState } from 'react';

interface WalletConnectionProps {
  onConnect?: (address: string) => void;
}

export default function WalletConnection({ onConnect }: WalletConnectionProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    // Simulate wallet connection
    // In production, this will use wagmi/viem
    setTimeout(() => {
      const mockAddress = '0x1234...5678';
      setConnectedAddress(mockAddress);
      setIsConnecting(false);
      onConnect?.(mockAddress);
    }, 1500);
  };

  if (connectedAddress) {
    return (
      <div className="fade-in space-y-2">
        <p className="text-base text-gray-600">
          Connected: <span className="font-mono text-sm">{connectedAddress}</span>
        </p>
        <p className="text-sm text-gray-500">
          Your identity is tied to this wallet. Your thinking is yours.
        </p>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-4">
      <p className="text-lg text-gray-600 leading-relaxed">
        To begin, connect your wallet.
      </p>
      <p className="text-sm text-gray-500">
        Your identity and memory will be tied to your wallet address.
      </p>
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="px-6 py-3 text-base text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    </div>
  );
}
