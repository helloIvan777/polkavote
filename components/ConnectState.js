'use client';

import React from 'react';
import { useWeb3 } from '../context/Web3Context';

/**
 * ConnectState - Reusable "Connect Wallet" State Component
 * Ensures consistent styling across all pages
 * 
 * @param {string} title - Main heading text
 * @param {string} description - Subtitle/description text
 * @param {React.ReactNode} icon - Icon component to display
 * @param {string} buttonText - Text for the connect button (default: "Connect Wallet")
 * @param {boolean} isConnecting - Loading state for the button
 */
export default function ConnectState({ 
  title, 
  description, 
  icon, 
  buttonText = 'Connect Wallet',
  isConnecting = false
}) {
  const { openWalletModal } = useWeb3();

  const handleConnect = () => {
    // Open Wallet Selector Modal instead of direct connect
    openWalletModal();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      {/* Card */}
      <div className="bg-[#1a1b23] border border-white/5 rounded-[2rem] p-12 text-center w-full max-w-2xl shadow-2xl">
        {/* Icon Container */}
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
          {icon}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-2">
          {title}
        </h2>

        {/* Description */}
        <p className="text-gray-400 max-w-sm mx-auto mb-8">
          {description}
        </p>

        {/* Connect Button */}
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="px-8 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-semibold text-base
            hover:from-pink-600 hover:to-pink-700 transition-all duration-200
            hover:shadow-lg hover:shadow-pink-500/30
            disabled:opacity-50 disabled:cursor-not-allowed
            inline-flex items-center gap-2"
        >
          {isConnecting ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Connecting...
            </>
          ) : (
            buttonText
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Pre-built icon components for common use cases
 */
export function WalletIcon() {
  return (
    <svg className="w-8 h-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

export function VoteIcon() {
  return (
    <svg className="w-8 h-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

export function ProfileIcon() {
  return (
    <svg className="w-8 h-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

export function EmptyIcon() {
  return (
    <svg className="w-8 h-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
