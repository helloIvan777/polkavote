'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useWeb3, truncateAddress, formatChainId } from '../context/Web3Context';

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
 * Account Menu Dropdown Component
 */
function AccountMenu({ account, chainId, onDisconnect, onSwitchAccount, onClose, isOpen }) {
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={menuRef}
      className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden"
    >
      {/* Account Info */}
      <div className="p-4 border-b border-slate-700 bg-slate-800/50">
        <p className="text-xs text-slate-400 mb-1">Connected Account</p>
        <p className="text-white font-mono text-sm break-all">{account}</p>
        {chainId && (
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <p className="text-pink-400 text-xs">{formatChainId(chainId)}</p>
          </div>
        )}
      </div>

      {/* Menu Actions */}
      <div className="p-2 space-y-1">
        <button
          onClick={onSwitchAccount}
          className="w-full flex items-center gap-3 px-3 py-2 text-left text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span className="text-sm font-medium">Switch Account</span>
        </button>
        
        <button
          onClick={onDisconnect}
          className="w-full flex items-center gap-3 px-3 py-2 text-left text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-sm font-medium">Disconnect</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Connect Wallet Button with Account Menu
 */
export function ConnectWalletButton() {
  const { 
    account, 
    isConnected, 
    isConnecting, 
    connectWallet, 
    disconnectWallet,
    switchAccount,
    showAccountMenu,
    toggleAccountMenu,
    closeAccountMenu,
    chainId
  } = useWeb3();

  if (isConnected && account) {
    return (
      <div className="relative">
        <button
          onClick={toggleAccountMenu}
          className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 transition-all"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white text-sm font-medium font-mono">
            {truncateAddress(account, 4, 4)}
          </span>
          <svg className={`w-4 h-4 text-slate-400 transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <AccountMenu 
          account={account}
          chainId={chainId}
          onDisconnect={disconnectWallet}
          onSwitchAccount={switchAccount}
          onClose={closeAccountMenu}
          isOpen={showAccountMenu}
        />
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className={`
        px-4 py-2 rounded-xl font-medium text-sm
        bg-gradient-to-r from-pink-500 to-pink-600 text-white
        hover:from-pink-600 hover:to-pink-700
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:shadow-lg hover:shadow-pink-500/30
      `}
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

/**
 * Mobile Connect Button (simplified)
 */
export function MobileConnectButton() {
  const { 
    account, 
    isConnected, 
    isConnecting, 
    connectWallet,
    disconnectWallet,
    switchAccount,
    showAccountMenu,
    toggleAccountMenu,
    closeAccountMenu 
  } = useWeb3();

  if (isConnected && account) {
    return (
      <div className="relative">
        <button
          onClick={toggleAccountMenu}
          className="flex items-center gap-2 bg-slate-700/50 rounded-xl px-3 py-2"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white text-xs font-medium font-mono">
            {truncateAddress(account, 3, 3)}
          </span>
        </button>
        
        <AccountMenu 
          account={account}
          onDisconnect={disconnectWallet}
          onSwitchAccount={switchAccount}
          onClose={closeAccountMenu}
          isOpen={showAccountMenu}
        />
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="px-3 py-2 rounded-xl font-medium text-xs bg-gradient-to-r from-pink-500 to-pink-600 text-white disabled:opacity-50"
    >
      {isConnecting ? '...' : 'Connect'}
    </button>
  );
}
