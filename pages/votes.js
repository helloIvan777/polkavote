'use client';

import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ProposalCard from '../components/ProposalCard';
import { connectWallet, fetchAllProposals, checkVoted, getProposalCount, getTotalVotes } from '../utils/web3';
import { POLKAVOTE_ADDRESS } from '../utils/web3';

/**
 * My Votes Page
 * Shows proposals the user has voted on
 */
export default function VotesPage() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [votedProposals, setVotedProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [votingStates, setVotingStates] = useState({});

  const handleConnectWallet = async () => {
    try {
      setIsConnecting(true);
      const { address } = await connectWallet();
      setWalletAddress(address);
    } catch (err) {
      console.error('Wallet connection error:', err);
      alert(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const loadVotedProposals = async (address) => {
    try {
      setIsLoading(true);
      const allProposals = await fetchAllProposals(POLKAVOTE_ADDRESS);
      
      const voted = await Promise.all(
        allProposals.map(async (proposal) => {
          const hasVoted = await checkVoted(proposal.id, address, POLKAVOTE_ADDRESS);
          return { ...proposal, hasVoted };
        })
      );

      setVotedProposals(voted.filter(p => p.hasVoted));
    } catch (err) {
      console.error('Error loading voted proposals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      loadVotedProposals(walletAddress);
    }
  }, [walletAddress]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-pink-500 mb-2">My Votes</h1>
          <p className="text-slate-400">
            Track all the proposals you've voted on
          </p>
        </div>

        {!walletAddress ? (
          /* Connect Wallet State */
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700/50 text-center">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-slate-400 mb-6">
              Connect to see your voting history
            </p>
            <button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-medium
                hover:from-pink-600 hover:to-pink-700 transition-all duration-200
                hover:shadow-lg hover:shadow-pink-500/30
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
            </button>
          </div>
        ) : isLoading ? (
          /* Loading State */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-800 rounded-2xl p-5 border border-slate-700/50 animate-pulse">
                <div className="h-32 bg-slate-700 rounded-xl" />
              </div>
            ))}
          </div>
        ) : votedProposals.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Votes Yet</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              You haven't voted on any proposals yet. Browse the home page to find ideas to support!
            </p>
          </div>
        ) : (
          /* Voted Proposals Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {votedProposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                hasVoted={true}
                isVoting={votingStates[proposal.id]}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
