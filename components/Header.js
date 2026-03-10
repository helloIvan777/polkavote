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
 * Wallet Selection Modal Component
 * Shows MetaMask and Phantom EVM options (both for Moonbase Alpha)
 */
export function WalletSelectionModal({ isOpen, onClose, onSelect }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        ref={modalRef}
        className="relative bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-slate-700/50 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-bold text-white text-center">Connect Wallet</h2>
          <p className="text-slate-400 text-sm text-center mt-1">
            Choose your preferred wallet for Moonbase Alpha
          </p>
        </div>

        <div className="p-6 space-y-3">
          {/* MetaMask Option */}
          <button
            onClick={() => onSelect('metamask')}
            className="w-full flex items-center gap-4 p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-pink-500/50 rounded-xl transition-all duration-200 group"
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                <path d="M29.5 9.5L26.5 4H18L16 7L14 4H5.5L2.5 9.5L0 14L2.5 18.5L5.5 24H14L16 21L18 24H26.5L29.5 18.5L32 14L29.5 9.5Z" fill="#E17726"/>
                <path d="M16 7L18.5 13.5L22 12L16 4L16 7Z" fill="#E2761B"/>
                <path d="M16 7L13.5 13.5L10 12L16 4L16 7Z" fill="#E4761B"/>
                <path d="M5.5 24L8.5 19L5 17.5L5.5 24Z" fill="#D7C1B3"/>
                <path d="M26.5 24L23.5 19L27 17.5L26.5 24Z" fill="#D7C1B3"/>
                <path d="M14 21L16 24L18 21L16 18L14 21Z" fill="#233447"/>
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-semibold">MetaMask</p>
              <p className="text-slate-400 text-sm">EVM wallet for Moonbase Alpha</p>
            </div>
            <svg className="w-5 h-5 text-slate-500 group-hover:text-pink-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Phantom EVM Option */}
          <button
            onClick={() => onSelect('phantom')}
            className="w-full flex items-center gap-4 p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-purple-500/50 rounded-xl transition-all duration-200 group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4C13.66 4 15 5.34 15 7C15 8.66 13.66 10 12 10C10.34 10 9 8.66 9 7C9 5.34 10.34 4 12 4ZM12 20C9.33 20 7 18.67 5.5 16.5C5.5 14.33 9.33 13 12 13C14.67 13 18.5 14.33 18.5 16.5C18.5 18.67 14.67 20 12 20Z"/>
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-semibold">Phantom</p>
              <p className="text-slate-400 text-sm">EVM mode for Moonbase Alpha</p>
            </div>
            <svg className="w-5 h-5 text-slate-500 group-hover:text-purple-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="p-4 bg-slate-900/50 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center">
            Both wallets connect to Moonbase Alpha (EVM). Make sure Phantom is in EVM mode.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Account Menu Dropdown Component
 */
function AccountMenu({ account, chainId, walletType, onDisconnect, onSwitchAccount, onClose, isOpen }) {
  const menuRef = useRef(null);

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
        <div className="flex items-center gap-2 mt-2">
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <p className="text-pink-400 text-xs font-medium">
            {walletType === 'phantom' ? 'Phantom EVM' : 'MetaMask'} - {chainId ? formatChainId(chainId) : 'Connected'}
          </p>
        </div>
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
    chainId,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchAccount,
    showAccountMenu,
    showWalletModal,
    walletType,
    toggleAccountMenu,
    closeAccountMenu,
    closeWalletModal,
  } = useWeb3();

  const handleWalletSelect = async (type) => {
    try {
      await connectWallet(type);
    } catch (error) {
      console.error('[Header] Wallet connection error:', error);
    }
  };

  if (isConnected && account) {
    return (
      <>
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
            walletType={walletType}
            onDisconnect={disconnectWallet}
            onSwitchAccount={switchAccount}
            onClose={closeAccountMenu}
            isOpen={showAccountMenu}
          />
        </div>

        <WalletSelectionModal
          isOpen={showWalletModal}
          onClose={closeWalletModal}
          onSelect={handleWalletSelect}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => connectWallet()}
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

      <WalletSelectionModal
        isOpen={showWalletModal}
        onClose={closeWalletModal}
        onSelect={handleWalletSelect}
      />
    </>
  );
}

/**
 * Mobile Connect Button (simplified)
 */
export function MobileConnectButton() {
  const {
    account,
    chainId,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchAccount,
    showAccountMenu,
    showWalletModal,
    walletType,
    toggleAccountMenu,
    closeAccountMenu,
    closeWalletModal,
  } = useWeb3();

  const handleWalletSelect = async (type) => {
    try {
      await connectWallet(type);
    } catch (error) {
      console.error('[Header] Wallet connection error:', error);
    }
  };

  if (isConnected && account) {
    return (
      <>
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
            chainId={chainId}
            walletType={walletType}
            onDisconnect={disconnectWallet}
            onSwitchAccount={switchAccount}
            onClose={closeAccountMenu}
            isOpen={showAccountMenu}
          />
        </div>

        <WalletSelectionModal
          isOpen={showWalletModal}
          onClose={closeWalletModal}
          onSelect={handleWalletSelect}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => connectWallet()}
        disabled={isConnecting}
        className="px-3 py-2 rounded-xl font-medium text-xs bg-gradient-to-r from-pink-500 to-pink-600 text-white disabled:opacity-50"
      >
        {isConnecting ? '...' : 'Connect'}
      </button>

      <WalletSelectionModal
        isOpen={showWalletModal}
        onClose={closeWalletModal}
        onSelect={handleWalletSelect}
      />
    </>
  );
}
