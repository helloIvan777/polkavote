'use client';

import React from 'react';
import Link from 'next/link';
import { useWeb3, truncateAddress } from '../context/Web3Context';

/**
 * PolkaVote Logo Component
 */
export function PolkaVoteLogo({ className = "w-10 h-10" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="22" fill="#DB2777" />
      <path d="M14 32V16L20 28L26 16V32" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30 16V32" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <path d="M34 16L28 32" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2" fill="white" />
      <circle cx="36" cy="36" r="2" fill="white" />
    </svg>
  );
}

/**
 * Connect Wallet Button - Simplified
 * Direct connection without modal or dropdown
 */
export function ConnectWalletButton() {
  const {
    account,
    chainId,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
  } = useWeb3();

  const handleConnect = async () => {
    console.log('[Header] Connect Wallet button clicked!');
    try {
      await connectWallet();
    } catch (error) {
      console.error('[Header] Connection error:', error);
    }
  };

  if (isConnected && account) {
    return (
      <button
        onClick={disconnectWallet}
        className="px-6 py-2 rounded-full font-bold text-sm
          bg-gradient-to-r from-pink-500 to-pink-600 text-white
          hover:from-pink-600 hover:to-pink-700
          transition-all duration-200
          hover:shadow-lg hover:shadow-pink-500/30"
      >
        {truncateAddress(account, 4, 4)}
      </button>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="px-6 py-2 rounded-full font-bold text-sm
        bg-gradient-to-r from-pink-500 to-pink-600 text-white
        hover:from-pink-600 hover:to-pink-700
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:shadow-lg hover:shadow-pink-500/30"
    >
      {isConnecting ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Connecting...
        </span>
      ) : (
        'Connect Wallet'
      )}
    </button>
  );
}
