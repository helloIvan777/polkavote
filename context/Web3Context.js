'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';

// Storage key for localStorage
const STORAGE_KEY = 'polkavote_connected';

/**
 * Web3 Context
 */
const Web3Context = createContext(null);

/**
 * Web3 Provider Component - Wraps the entire app
 */
export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  /**
   * Check if MetaMask is installed
   */
  const isMetaMaskInstalled = useCallback(() => {
    if (typeof window !== 'undefined') {
      return typeof window.ethereum !== 'undefined';
    }
    return false;
  }, []);

  /**
   * Connect to MetaMask wallet
   */
  const connectWallet = useCallback(async () => {
    console.log('[Web3Context] connectWallet called');
    
    if (!isMetaMaskInstalled()) {
      const error = new Error('MetaMask is not installed. Please install MetaMask to use this feature.');
      console.error('[Web3Context] MetaMask not installed');
      throw error;
    }

    try {
      setIsConnecting(true);
      console.log('[Web3Context] Requesting account access...');

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('[Web3Context] Accounts received:', accounts);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your MetaMask wallet.');
      }

      const address = accounts[0];
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signerInstance = await browserProvider.getSigner();
      const network = await browserProvider.getNetwork();

      console.log('[Web3Context] Connected to:', address, 'Chain:', Number(network.chainId));

      setAccount(address);
      setChainId(Number(network.chainId));
      setProvider(browserProvider);
      setSigner(signerInstance);
      setIsConnected(true);

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, 'true');
      console.log('[Web3Context] Connection saved to localStorage');

      return { address, chainId: Number(network.chainId) };
    } catch (error) {
      console.error('[Web3Context] Connection error:', error);
      if (error.code === 4001) {
        throw new Error('Connection rejected by user');
      }
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [isMetaMaskInstalled]);

  /**
   * Disconnect wallet
   */
  const disconnectWallet = useCallback(() => {
    console.log('[Web3Context] Disconnecting wallet...');
    setAccount(null);
    setChainId(null);
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
    setShowAccountMenu(false);
    localStorage.removeItem(STORAGE_KEY);
    console.log('[Web3Context] Wallet disconnected');
  }, []);

  /**
   * Switch account (triggers MetaMask account switch)
   */
  const switchAccount = useCallback(async () => {
    console.log('[Web3Context] Switch account requested');
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    } catch (error) {
      console.error('[Web3Context] Switch account error:', error);
      throw error;
    }
  }, []);

  /**
   * Eager connection check on mount
   */
  const checkExistingConnection = useCallback(async () => {
    console.log('[Web3Context] Checking existing connection...');
    
    if (!isMetaMaskInstalled()) {
      console.log('[Web3Context] MetaMask not installed');
      return;
    }

    // Check if user was previously connected
    const shouldConnect = localStorage.getItem(STORAGE_KEY) === 'true';
    console.log('[Web3Context] localStorage shouldConnect:', shouldConnect);
    
    if (!shouldConnect) {
      console.log('[Web3Context] No previous connection found');
      return;
    }

    try {
      // Try to get accounts without prompting
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      console.log('[Web3Context] eth_accounts returned:', accounts);
      
      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const signerInstance = await browserProvider.getSigner();
        const network = await browserProvider.getNetwork();

        console.log('[Web3Context] Restored connection:', address);

        setAccount(address);
        setChainId(Number(network.chainId));
        setProvider(browserProvider);
        setSigner(signerInstance);
        setIsConnected(true);
      } else {
        console.log('[Web3Context] No accounts available, clearing storage');
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('[Web3Context] Error checking existing connection:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [isMetaMaskInstalled]);

  /**
   * Handle account changes from MetaMask
   */
  const handleAccountsChanged = useCallback((accounts) => {
    console.log('[Web3Context] accountsChanged event:', accounts);
    
    if (accounts.length === 0) {
      // User disconnected from MetaMask
      console.log('[Web3Context] User disconnected from MetaMask');
      disconnectWallet();
    } else if (accounts[0] !== account) {
      // User switched account
      const newAddress = accounts[0];
      console.log('[Web3Context] Account switched to:', newAddress);
      setAccount(newAddress);
      
      // Update signer
      if (provider) {
        provider.getSigner().then(newSigner => {
          setSigner(newSigner);
          console.log('[Web3Context] Signer updated');
        });
      }
    }
  }, [account, provider, disconnectWallet]);

  /**
   * Handle chain changes from MetaMask
   */
  const handleChainChanged = useCallback((newChainId) => {
    console.log('[Web3Context] chainChanged event:', newChainId);
    setChainId(parseInt(newChainId, 16));
    // Reload page on chain change to ensure clean state
    window.location.reload();
  }, []);

  /**
   * Setup MetaMask event listeners on mount
   */
  useEffect(() => {
    console.log('[Web3Context] Provider mounted, setting up listeners');
    
    if (!isMetaMaskInstalled()) {
      return;
    }

    // Check for existing connection
    checkExistingConnection();

    // Add event listeners
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      console.log('[Web3Context] Event listeners attached');
    }

    // Cleanup listeners on unmount
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        console.log('[Web3Context] Event listeners removed');
      }
    };
  }, [isMetaMaskInstalled, checkExistingConnection, handleAccountsChanged, handleChainChanged]);

  /**
   * Get signer (ensures we have a valid signer)
   */
  const getSigner = useCallback(async () => {
    console.log('[Web3Context] getSigner called, has signer:', !!signer);
    
    if (signer) {
      return signer;
    }
    
    if (provider) {
      const newSigner = await provider.getSigner();
      setSigner(newSigner);
      return newSigner;
    }
    
    console.warn('[Web3Context] No signer or provider available');
    return null;
  }, [signer, provider]);

  /**
   * Toggle account menu
   */
  const toggleAccountMenu = useCallback(() => {
    setShowAccountMenu(prev => !prev);
  }, []);

  /**
   * Close account menu
   */
  const closeAccountMenu = useCallback(() => {
    setShowAccountMenu(false);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    account,
    chainId,
    isConnected,
    isConnecting,
    provider,
    signer,
    showAccountMenu,
    connectWallet,
    disconnectWallet,
    switchAccount,
    getSigner,
    isMetaMaskInstalled,
    toggleAccountMenu,
    closeAccountMenu,
  }), [
    account,
    chainId,
    isConnected,
    isConnecting,
    provider,
    signer,
    showAccountMenu,
    connectWallet,
    disconnectWallet,
    switchAccount,
    getSigner,
    isMetaMaskInstalled,
    toggleAccountMenu,
    closeAccountMenu,
  ]);

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}

/**
 * Custom hook to use Web3 context
 */
export function useWeb3() {
  const context = useContext(Web3Context);
  
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  
  return context;
}

/**
 * Truncate an Ethereum address for display
 */
export function truncateAddress(address, start = 6, end = 4) {
  if (!address) return '';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/**
 * Format chain ID to readable name
 */
export function formatChainId(chainId) {
  const chains = {
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    11155111: 'Sepolia Testnet',
    137: 'Polygon',
    80001: 'Mumbai Testnet',
    80002: 'Polygon Amoy',
    42161: 'Arbitrum One',
    10: 'Optimism',
  };
  return chains[chainId] || `Chain ${chainId}`;
}
