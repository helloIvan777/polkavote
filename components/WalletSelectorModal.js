'use client';

import React from 'react';
import { useWeb3 } from '../context/Web3Context';

/**
 * Wallet Selector Modal - Professional Centered Popup
 * MUST be rendered at the root level (not inside Header/Nav)
 */
export default function WalletSelectorModal({ isOpen, onClose }) {
  const { walletProviders, connectWallet, isConnecting } = useWeb3();

  // Handle wallet selection
  const handleSelectWallet = async (providerDetail) => {
    try {
      await connectWallet(providerDetail);
    } catch (error) {
      console.error('[WalletSelectorModal] Connection error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    /* 
     * FIXED POSITIONING - Covers entire viewport, ignores parent positioning
     * z-[9999] ensures it's above EVERYTHING (header, nav, content, etc.)
     */
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto">
      {/* 
       * DARK BACKDROP - Full screen overlay with blur
       * Click to close
       */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* 
       * CENTERED CARD - The actual modal content
       * relative z-10 ensures it appears ABOVE the backdrop
       */}
      <div className="relative z-10 w-full max-w-md bg-[#1a1b23] border border-white/10 rounded-3xl p-8 shadow-2xl m-4">
        {/* Header with Title and Close Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Wallet Options List */}
        <div className="space-y-3">
          {walletProviders.length === 0 ? (
            /* No wallets detected */
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-3">No Wallet Detected</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
                Please install a Web3 wallet to continue. MetaMask is recommended for Moonbase Alpha.
              </p>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-semibold text-sm hover:from-pink-600 hover:to-pink-700 transition-all hover:shadow-lg hover:shadow-pink-500/30"
              >
                Install MetaMask
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          ) : (
            walletProviders.map((providerDetail) => (
              <button
                key={providerDetail.info.uuid}
                onClick={() => handleSelectWallet(providerDetail)}
                disabled={isConnecting}
                className={`
                  w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200
                  ${isConnecting
                    ? 'bg-white/5 border-white/10 opacity-50 cursor-wait'
                    : 'bg-white/5 border-white/10 hover:border-pink-500/50 hover:bg-pink-500/10'
                  }
                  group
                `}
              >
                {/* Wallet Icon */}
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                  {providerDetail.info.icon ? (
                    <img
                      src={providerDetail.info.icon}
                      alt={providerDetail.info.name}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  {/* Fallback icon */}
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center" style={{ display: 'none' }}>
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>

                {/* Wallet Info */}
                <div className="flex-1 text-left">
                  <p className="text-white font-semibold">{providerDetail.info.name}</p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {providerDetail.info.rdns || 'Web3 Wallet'}
                  </p>
                </div>

                {/* Arrow Icon */}
                <svg
                  className={`w-5 h-5 text-slate-500 transition-all group-hover:text-pink-400 ${isConnecting ? 'opacity-0' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))
          )}
        </div>
        
        {/* Footer - Terms notice */}
        <p className="mt-8 text-center text-xs text-gray-500">
          By connecting, you agree to the Terms of Service.
        </p>
      </div>
    </div>
  );
}
