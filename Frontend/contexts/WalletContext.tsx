"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { connectWallet } from '../lib/ethers';

interface WalletContextType {
  account: string | null;
  setAccount: (account: string | null) => void;
  connectWallet: () => Promise<void>;
  isConnecting: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const acc = await connectWallet();
      setAccount(acc);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    handleConnect(); // Auto-connect on load
  }, []);

  return (
    <WalletContext.Provider value={{
      account,
      setAccount,
      connectWallet: handleConnect,
      isConnecting
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
