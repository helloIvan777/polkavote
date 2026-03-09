'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';

const STORAGE_KEY = 'polkavote_connected';
const WALLET_TYPE_KEY = 'polkavote_wallet_type';

// Moonbase Alpha Chain ID
const MOONBASE_ALPHA_CHAIN_ID = 1287;
const MOONBASE_ALPHA_HEX = '0x507';

const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletType, setWalletType] = useState(null); // 'metamask' or 'phantom'

  /**
   * Get all available EVM providers
   * Modern wallets inject themselves into window.ethereum.providers array
   */
  const getProviders = useCallback(() => {
    if (typeof window === 'undefined') return [];
    
    const providers = [];
    
    // Check for providers array (injected by multiple wallet extensions)
    if (window.ethereum?.providers && Array.isArray(window.ethereum.providers)) {
      providers.push(...window.ethereum.providers);
    }
    
    // Also check for window.phantom.ethereum (Phantom's EVM provider)
    if (window.phantom?.ethereum) {
      providers.push(window.phantom.ethereum);
    }
    
    // Check for window.ethereum itself (might be the only provider)
    if (window.ethereum && !providers.includes(window.ethereum)) {
      providers.push(window.ethereum);
    }
    
    return providers;
  }, []);

  /**
   * Find MetaMask provider specifically
   * Filter: isMetaMask === true AND isPhantom === undefined
   */
  const getMetaMaskProvider = useCallback(() => {
    const providers = getProviders();
    console.log('[Web3Context] Available providers:', providers.map(p => ({
      isMetaMask: p?.isMetaMask,
      isPhantom: p?.isPhantom,
      isCoinbaseWallet: p?.isCoinbaseWallet,
    })));

    // First, try to find provider with isMetaMask === true and isPhantom === undefined
    const metaMaskProvider = providers.find(p => 
      p?.isMetaMask === true && p?.isPhantom === undefined
    );

    if (metaMaskProvider) {
      console.log('[Web3Context] Found MetaMask provider');
      return metaMaskProvider;
    }

    // Fallback: if window.ethereum exists and no other provider found, use it
    if (window.ethereum && providers.length === 1) {
      console.log('[Web3Context] Using window.ethereum as MetaMask');
      return window.ethereum;
    }

    return null;
  }, [getProviders]);

  /**
   * Find Phantom EVM provider specifically
   * Filter: isPhantom === true OR use window.phantom.ethereum
   */
  const getPhantomEVMProvider = useCallback(() => {
    // First check for window.phantom.ethereum (Phantom's dedicated EVM provider)
    if (window.phantom?.ethereum) {
      console.log('[Web3Context] Found Phantom EVM provider via window.phantom.ethereum');
      return window.phantom.ethereum;
    }

    const providers = getProviders();

    // Find provider with isPhantom === true
    const phantomProvider = providers.find(p => p?.isPhantom === true);

    if (phantomProvider) {
      console.log('[Web3Context] Found Phantom EVM provider in providers array');
      return phantomProvider;
    }

    return null;
  }, [getProviders]);

  const isMetaMaskInstalled = useCallback(() => {
    return getMetaMaskProvider() !== null;
  }, [getMetaMaskProvider]);

  const isPhantomEVMInstalled = useCallback(() => {
    return getPhantomEVMProvider() !== null;
  }, [getPhantomEVMProvider]);

  /**
   * Switch network to Moonbase Alpha
   */
  const switchToMoonbaseAlpha = useCallback(async (ethereumProvider) => {
    console.log('[Web3Context] Attempting to switch to Moonbase Alpha...');
    
    try {
      await ethereumProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MOONBASE_ALPHA_HEX }],
      });
      console.log('[Web3Context] Successfully switched to Moonbase Alpha');
      return true;
    } catch (switchError) {
      console.error('[Web3Context] Switch chain error:', switchError);
      
      // If the chain hasn't been added to the wallet, try to add it
      if (switchError.code === 4902) {
        console.log('[Web3Context] Moonbase Alpha not added, attempting to add...');
        try {
          await ethereumProvider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: MOONBASE_ALPHA_HEX,
              chainName: 'Moonbase Alpha',
              nativeCurrency: {
                name: 'DEV',
                symbol: 'DEV',
                decimals: 18,
              },
              rpcUrls: ['https://rpc.api.moonbase.moonbeam.network'],
              blockExplorerUrls: ['https://moonbase.moonscan.io/'],
            }],
          });
          console.log('[Web3Context] Moonbase Alpha added successfully');
          return true;
        } catch (addError) {
          console.error('[Web3Context] Add chain error:', addError);
          throw new Error('Failed to add Moonbase Alpha network');
        }
      }
      
      // User rejected the switch
      if (switchError.code === 4001) {
        throw new Error('Network switch rejected by user');
      }
      
      throw new Error('Failed to switch to Moonbase Alpha network');
    }
  }, []);

  /**
   * Connect to MetaMask specifically
   */
  const connectMetaMask = useCallback(async () => {
    console.log('[Web3Context] Connecting to MetaMask...');

    const metaMaskProvider = getMetaMaskProvider();
    
    if (!metaMaskProvider) {
      throw new Error('MetaMask is not installed. Please install MetaMask to use this feature.');
    }

    // Request account access from MetaMask specifically
    const accounts = await metaMaskProvider.request({ method: 'eth_requestAccounts' });

    if (accounts.length === 0) {
      throw new Error('No accounts found. Please unlock your MetaMask wallet.');
    }

    const address = accounts[0];
    const browserProvider = new ethers.BrowserProvider(metaMaskProvider);
    const signerInstance = await browserProvider.getSigner();
    const network = await browserProvider.getNetwork();

    console.log('[Web3Context] Connected to MetaMask:', address, 'Chain:', Number(network.chainId));

    // Check and switch to Moonbase Alpha if needed
    if (Number(network.chainId) !== MOONBASE_ALPHA_CHAIN_ID) {
      console.log('[Web3Context] Not on Moonbase Alpha, switching...');
      await switchToMoonbaseAlpha(metaMaskProvider);
      
      // Re-fetch network after switch
      const updatedNetwork = await browserProvider.getNetwork();
      setChainId(Number(updatedNetwork.chainId));
    } else {
      setChainId(Number(network.chainId));
    }

    setAccount(address);
    setProvider(browserProvider);
    setSigner(signerInstance);
    setIsConnected(true);
    setWalletType('metamask');

    localStorage.setItem(STORAGE_KEY, 'true');
    localStorage.setItem(WALLET_TYPE_KEY, 'metamask');

    return { address, chainId: Number(network.chainId), walletType: 'metamask' };
  }, [getMetaMaskProvider, switchToMoonbaseAlpha]);

  /**
   * Connect to Phantom EVM specifically (NOT Solana)
   */
  const connectPhantomEVM = useCallback(async () => {
    console.log('[Web3Context] Connecting to Phantom EVM...');

    const phantomProvider = getPhantomEVMProvider();

    if (!phantomProvider) {
      throw new Error('Phantom wallet is not installed or EVM support is not enabled. Please install Phantom and enable EVM support.');
    }

    try {
      // Request account access from Phantom EVM
      const accounts = await phantomProvider.request({ method: 'eth_requestAccounts' });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your Phantom wallet.');
      }

      const address = accounts[0];
      const browserProvider = new ethers.BrowserProvider(phantomProvider);
      const signerInstance = await browserProvider.getSigner();
      const network = await browserProvider.getNetwork();

      console.log('[Web3Context] Connected to Phantom EVM:', address, 'Chain:', Number(network.chainId));

      // Check and switch to Moonbase Alpha if needed
      if (Number(network.chainId) !== MOONBASE_ALPHA_CHAIN_ID) {
        console.log('[Web3Context] Not on Moonbase Alpha, switching...');
        await switchToMoonbaseAlpha(phantomProvider);
        
        // Re-fetch network after switch
        const updatedNetwork = await browserProvider.getNetwork();
        setChainId(Number(updatedNetwork.chainId));
      } else {
        setChainId(Number(network.chainId));
      }

      setAccount(address);
      setProvider(browserProvider);
      setSigner(signerInstance);
      setIsConnected(true);
      setWalletType('phantom');

      localStorage.setItem(STORAGE_KEY, 'true');
      localStorage.setItem(WALLET_TYPE_KEY, 'phantom');

      return { address, chainId: Number(network.chainId), walletType: 'phantom' };
    } catch (error) {
      console.error('[Web3Context] Phantom EVM connection error:', error);
      throw error;
    }
  }, [getPhantomEVMProvider, switchToMoonbaseAlpha]);

  /**
   * Main connect wallet function
   * @param {string} type - 'metamask' or 'phantom'
   */
  const connectWallet = useCallback(async (type) => {
    // If already connected and no explicit wallet type requested, do nothing —
    // this prevents navigation / indirect calls from popping the modal.
    if (isConnected && !['metamask', 'phantom'].includes(type)) {
      console.log('[Web3Context] Already connected, skipping modal');
      return null;
    }

    console.log('[Web3Context] connectWallet called with type:', type);
    setIsConnecting(true);

    try {
      if (type === 'metamask') {
        await connectMetaMask();
      } else if (type === 'phantom') {
        await connectPhantomEVM();
      } else {
        // No valid type supplied — show the wallet selection modal
        setShowWalletModal(true);
        return null;
      }

      setShowWalletModal(false);
      return { account, walletType };
    } catch (error) {
      console.error('[Web3Context] Connection error:', error);
      if (error.code === 4001) {
        throw new Error('Connection rejected by user');
      }
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [isConnected, connectMetaMask, connectPhantomEVM, account, walletType]);

  const disconnectWallet = useCallback(() => {
    console.log('[Web3Context] Disconnecting wallet...');

    setAccount(null);
    setChainId(null);
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
    setShowAccountMenu(false);
    setShowWalletModal(false);
    setWalletType(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(WALLET_TYPE_KEY);
    console.log('[Web3Context] Wallet disconnected');
  }, []);

  const switchAccount = useCallback(async () => {
    console.log('[Web3Context] Switch account requested');
    try {
      if (walletType === 'metamask') {
        const metaMaskProvider = getMetaMaskProvider();
        if (metaMaskProvider) {
          await metaMaskProvider.request({ method: 'eth_requestAccounts' });
        }
      } else if (walletType === 'phantom') {
        const phantomProvider = getPhantomEVMProvider();
        if (phantomProvider) {
          await phantomProvider.request({ method: 'eth_requestAccounts' });
        }
      }
    } catch (error) {
      console.error('[Web3Context] Switch account error:', error);
      throw error;
    }
  }, [walletType, getMetaMaskProvider, getPhantomEVMProvider]);

  /**
   * Check for existing connection on mount
   */
  const checkExistingConnection = useCallback(async () => {
    console.log('[Web3Context] Checking existing connection...');

    const savedWalletType = localStorage.getItem(WALLET_TYPE_KEY);
    const shouldConnect = localStorage.getItem(STORAGE_KEY) === 'true';

    console.log('[Web3Context] localStorage shouldConnect:', shouldConnect, 'walletType:', savedWalletType);

    if (!shouldConnect || !savedWalletType) {
      console.log('[Web3Context] No previous connection found');
      return;
    }

    try {
      if (savedWalletType === 'metamask') {
        const metaMaskProvider = getMetaMaskProvider();
        if (metaMaskProvider) {
          const accounts = await metaMaskProvider.request({ method: 'eth_accounts' });
          console.log('[Web3Context] eth_accounts returned:', accounts);

          if (accounts && accounts.length > 0) {
            const address = accounts[0];
            const browserProvider = new ethers.BrowserProvider(metaMaskProvider);
            const signerInstance = await browserProvider.getSigner();
            const network = await browserProvider.getNetwork();

            console.log('[Web3Context] Restored MetaMask connection:', address);

            setAccount(address);
            setChainId(Number(network.chainId));
            setProvider(browserProvider);
            setSigner(signerInstance);
            setIsConnected(true);
            setWalletType('metamask');
          }
        }
      } else if (savedWalletType === 'phantom') {
        const phantomProvider = getPhantomEVMProvider();
        if (phantomProvider) {
          const accounts = await phantomProvider.request({ method: 'eth_accounts' });
          console.log('[Web3Context] Phantom eth_accounts returned:', accounts);

          if (accounts && accounts.length > 0) {
            const address = accounts[0];
            const browserProvider = new ethers.BrowserProvider(phantomProvider);
            const signerInstance = await browserProvider.getSigner();
            const network = await browserProvider.getNetwork();

            console.log('[Web3Context] Restored Phantom EVM connection:', address);

            setAccount(address);
            setChainId(Number(network.chainId));
            setProvider(browserProvider);
            setSigner(signerInstance);
            setIsConnected(true);
            setWalletType('phantom');
          }
        }
      } else {
        console.log('[Web3Context] Unknown wallet type, clearing storage');
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(WALLET_TYPE_KEY);
      }
    } catch (error) {
      console.error('[Web3Context] Error during silent reconnect:', error);
      // Only clear storage if the wallet is definitively disconnected.
      // Do NOT clear on network/RPC errors — the next page load should retry.
      const msg = error?.message?.toLowerCase() ?? '';
      const isNetworkError =
        msg.includes('failed to fetch') ||
        msg.includes('network') ||
        msg.includes('timeout') ||
        msg.includes('etimedout') ||
        error?.code === 'NETWORK_ERROR';

      if (!isNetworkError) {
        console.log('[Web3Context] Clearing stored session (non-network error).');
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(WALLET_TYPE_KEY);
      } else {
        console.log('[Web3Context] Network error during reconnect — keeping storage for next refresh.');
      }
    }
  }, [getMetaMaskProvider, getPhantomEVMProvider]);

  // Keep a ref to the latest live values so event handlers never go stale
  // and never need to change identity (which would re-trigger effects).
  const stateRef = React.useRef({ account, provider, walletType, disconnectWallet });
  useEffect(() => {
    stateRef.current = { account, provider, walletType, disconnectWallet };
  });

  /**
   * Handle account changes — stable identity (no deps on mutable state).
   * Reads live values via stateRef so it always sees the latest account.
   */
  const handleAccountsChanged = useCallback((accounts) => {
    console.log('[Web3Context] accountsChanged event:', accounts);
    const { account: currentAccount, provider: currentProvider, walletType: currentWalletType, disconnectWallet: doDisconnect } = stateRef.current;

    if (accounts.length === 0) {
      console.log('[Web3Context] User disconnected from wallet');
      doDisconnect();
    } else if (accounts[0] !== currentAccount) {
      const newAddress = accounts[0];
      console.log('[Web3Context] Account switched to:', newAddress);
      setAccount(newAddress);
      // Update localStorage to keep the new account's session alive
      localStorage.setItem(STORAGE_KEY, 'true');

      if (currentWalletType === 'metamask' && currentProvider) {
        currentProvider.getSigner().then(newSigner => {
          setSigner(newSigner);
          console.log('[Web3Context] Signer updated after account switch');
        });
      }
    }
  }, []); // stable — reads via ref

  /**
   * Handle chain changes — stable identity.
   */
  const handleChainChanged = useCallback((newChainId) => {
    console.log('[Web3Context] chainChanged event:', newChainId);
    setChainId(parseInt(newChainId, 16));
    window.location.reload();
  }, []);

  /**
   * EFFECT 1 — Run once on mount: silently restore any prior connection.
   * Waits for the wallet extension to finish injecting into window.ethereum
   * before calling checkExistingConnection, to avoid a race where the
   * provider is not yet available and the restore silently fails.
   */
  const didCheckConnection = React.useRef(false);
  useEffect(() => {
    if (didCheckConnection.current) return;
    didCheckConnection.current = true;

    const savedWalletType = localStorage.getItem(WALLET_TYPE_KEY);
    const shouldReconnect = localStorage.getItem(STORAGE_KEY) === 'true';

    // If nothing is saved, skip entirely — don't bother waiting.
    if (!shouldReconnect || !savedWalletType) {
      console.log('[Web3Context] No saved session, skipping auto-connect.');
      return;
    }

    console.log('[Web3Context] Saved session found, waiting for wallet extension...');

    const runCheck = () => {
      console.log('[Web3Context] Extension ready — running checkExistingConnection');
      checkExistingConnection();
    };

    if (typeof window === 'undefined') return;

    // MetaMask fires 'ethereum#initialized' when its provider is fully ready.
    // Phantom doesn't fire this event, so we also set a max-wait fallback.
    const timeout = setTimeout(runCheck, 500); // fallback: run after 500 ms

    const onEthereumInit = () => {
      clearTimeout(timeout);
      runCheck();
    };

    window.addEventListener('ethereum#initialized', onEthereumInit, { once: true });

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('ethereum#initialized', onEthereumInit);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * EFFECT 2 — Attach wallet event listeners once on mount.
   * Uses stable callbacks (handleAccountsChanged / handleChainChanged)
   * so this never tears down and re-registers unnecessarily.
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      console.log('[Web3Context] window.ethereum event listeners attached');
    }

    if (window.phantom?.ethereum) {
      window.phantom.ethereum.on('accountsChanged', handleAccountsChanged);
      window.phantom.ethereum.on('chainChanged', handleChainChanged);
      console.log('[Web3Context] Phantom EVM event listeners attached');
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
      if (window.phantom?.ethereum) {
        window.phantom.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.phantom.ethereum.removeListener('chainChanged', handleChainChanged);
      }
      console.log('[Web3Context] Event listeners removed');
    };
  }, [handleAccountsChanged, handleChainChanged]); // both are stable, runs once

  /**
   * Get signer for contract interactions
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

  const toggleAccountMenu = useCallback(() => {
    setShowAccountMenu(prev => !prev);
  }, []);

  const closeAccountMenu = useCallback(() => {
    setShowAccountMenu(false);
  }, []);

  const openWalletModal = useCallback(() => {
    setShowWalletModal(true);
  }, []);

  const closeWalletModal = useCallback(() => {
    setShowWalletModal(false);
  }, []);

  const value = useMemo(() => ({
    account,
    chainId,
    isConnected,
    isConnecting,
    provider,
    signer,
    showAccountMenu,
    showWalletModal,
    walletType,
    connectWallet,
    disconnectWallet,
    switchAccount,
    getSigner,
    isMetaMaskInstalled,
    isPhantomEVMInstalled,
    toggleAccountMenu,
    closeAccountMenu,
    openWalletModal,
    closeWalletModal,
  }), [
    account,
    chainId,
    isConnected,
    isConnecting,
    provider,
    signer,
    showAccountMenu,
    showWalletModal,
    walletType,
    connectWallet,
    disconnectWallet,
    switchAccount,
    getSigner,
    isMetaMaskInstalled,
    isPhantomEVMInstalled,
    toggleAccountMenu,
    closeAccountMenu,
    openWalletModal,
    closeWalletModal,
  ]);

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);

  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }

  return context;
}

export function truncateAddress(address, start = 6, end = 4) {
  if (!address) return '';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function formatChainId(chainId) {
  const chains = {
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    11155111: 'Sepolia Testnet',
    137: 'Polygon',
    80001: 'Mumbai Testnet',
    80002: 'Polygon Amoy',
    1287: 'Moonbase Alpha',
    1284: 'Moonbeam',
    42161: 'Arbitrum One',
    10: 'Optimism',
  };
  return chains[chainId] || `Chain ${chainId}`;
}
