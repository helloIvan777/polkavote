'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import ProposalCard from '../components/ProposalCard';
import SubmitProposalModal from '../components/SubmitProposalModal';
import {
  connectWallet,
  fetchAllProposals,
  submitProposal,
  voteOnProposal,
  checkVoted,
  getProposalCount,
  getTotalVotes,
  formatVoteCount
} from '../utils/web3';
import { POLKAVOTE_ADDRESS } from '../utils/web3';

/**
 * Connect Wallet Button Component
 */
function ConnectWalletButton({ address, onConnect, isConnecting }) {
  if (address) {
    return (
      <div className="flex items-center gap-2 bg-slate-700/50 rounded-xl px-4 py-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-white text-sm font-medium">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={onConnect}
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
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}

/**
 * Stats Display Component
 */
function StatsDisplay({ proposalCount, totalVotes }) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-pink-400 font-bold">{proposalCount}</span>
        <span className="text-slate-400">ideas</span>
      </div>
      <div className="w-px h-4 bg-slate-700" />
      <div className="flex items-center gap-2">
        <span className="text-pink-400 font-bold">{formatVoteCount(totalVotes)}</span>
        <span className="text-slate-400">votes</span>
      </div>
    </div>
  );
}

/**
 * Loading Skeleton for Proposal Cards
 */
function ProposalCardSkeleton() {
  return (
    <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700/50 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-slate-700 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-slate-700 rounded w-24 mb-2" />
          <div className="h-3 bg-slate-700 rounded w-16" />
        </div>
      </div>
      <div className="h-5 bg-slate-700 rounded w-3/4 mb-2" />
      <div className="h-4 bg-slate-700 rounded w-full mb-1" />
      <div className="h-4 bg-slate-700 rounded w-2/3 mb-4" />
      <div className="h-10 bg-slate-700 rounded-xl mb-3" />
      <div className="h-2 bg-slate-700 rounded w-full" />
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState({ onAddIdea }) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">No Ideas Yet</h3>
      <p className="text-slate-400 mb-6 max-w-md mx-auto">
        Be the first to share your idea with the Polkadot community!
      </p>
      <button
        onClick={onAddIdea}
        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-medium
          hover:from-pink-600 hover:to-pink-700 transition-all duration-200
          hover:shadow-lg hover:shadow-pink-500/30"
      >
        Add Your Idea
      </button>
    </div>
  );
}

/**
 * Main Home Page Component
 */
export default function HomePage() {
  // State
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votingStates, setVotingStates] = useState({});
  const [stats, setStats] = useState({ proposalCount: 0, totalVotes: 0 });
  const [error, setError] = useState(null);

  // Load proposals
  const loadProposals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch proposals and stats in parallel
      const [proposalsData, proposalCount, totalVotes] = await Promise.all([
        fetchAllProposals(POLKAVOTE_ADDRESS),
        getProposalCount(POLKAVOTE_ADDRESS),
        getTotalVotes(POLKAVOTE_ADDRESS)
      ]);

      setStats({ proposalCount, totalVotes });

      // Check vote status for each proposal if wallet is connected
      if (walletAddress) {
        const votedProposals = await Promise.all(
          proposalsData.map(async (proposal) => {
            const hasVoted = await checkVoted(proposal.id, walletAddress, POLKAVOTE_ADDRESS);
            return { ...proposal, hasVoted };
          })
        );
        setProposals(votedProposals);
      } else {
        setProposals(proposalsData);
      }
    } catch (err) {
      console.error('Error loading proposals:', err);
      setError('Failed to load proposals. Please make sure the contract is deployed and the address is correct.');
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  // Initial load
  useEffect(() => {
    loadProposals();
  }, [loadProposals]);

  // Refresh vote status when wallet connects
  useEffect(() => {
    if (walletAddress && proposals.length > 0) {
      const updateVoteStatus = async () => {
        const updatedProposals = await Promise.all(
          proposals.map(async (proposal) => {
            const hasVoted = await checkVoted(proposal.id, walletAddress, POLKAVOTE_ADDRESS);
            return { ...proposal, hasVoted };
          })
        );
        setProposals(updatedProposals);
      };
      updateVoteStatus();
    }
  }, [walletAddress]);

  // Handle wallet connection
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

  // Handle vote
  const handleVote = async (proposalId) => {
    if (!walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setVotingStates(prev => ({ ...prev, [proposalId]: true }));
      
      const { signer } = await connectWallet();
      await voteOnProposal(proposalId, signer, POLKAVOTE_ADDRESS);
      
      // Update local state
      setProposals(prev => prev.map(p => 
        p.id === proposalId 
          ? { ...p, voteCount: p.voteCount + 1, hasVoted: true }
          : p
      ));
      
      // Refresh stats
      const totalVotes = await getTotalVotes(POLKAVOTE_ADDRESS);
      setStats(prev => ({ ...prev, totalVotes }));
    } catch (err) {
      console.error('Vote error:', err);
      if (err.message?.includes('Already voted')) {
        alert('You have already voted on this proposal');
      } else {
        alert('Failed to submit vote. Please try again.');
      }
    } finally {
      setVotingStates(prev => ({ ...prev, [proposalId]: false }));
    }
  };

  // Handle submit proposal
  const handleSubmitProposal = async (proposalData) => {
    if (!walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { signer } = await connectWallet();
      const result = await submitProposal(
        proposalData.title,
        proposalData.description,
        signer,
        POLKAVOTE_ADDRESS
      );

      if (result.success) {
        setIsModalOpen(false);
        await loadProposals();
      }
    } catch (err) {
      console.error('Submit proposal error:', err);
      alert('Failed to submit proposal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Header Section */}
      <section className="px-4 py-6 lg:py-8 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left Side - Title & Stats */}
            <div className="space-y-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-pink-500">
                Shape the Future of Polkadot
              </h1>
              <StatsDisplay 
                proposalCount={stats.proposalCount} 
                totalVotes={stats.totalVotes} 
              />
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center gap-3">
              <ConnectWalletButton 
                address={walletAddress}
                onConnect={handleConnectWallet}
                isConnecting={isConnecting}
              />
              <button
                onClick={() => setIsModalOpen(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 
                  text-white rounded-xl font-medium text-sm
                  hover:from-pink-600 hover:to-pink-700 transition-all duration-200
                  hover:shadow-lg hover:shadow-pink-500/30"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                ADD YOUR IDEA
              </button>
            </div>
          </div>

          {/* Mobile Add Idea Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="sm:hidden mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 
              bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-medium
              hover:from-pink-600 hover:to-pink-700 transition-all duration-200
              hover:shadow-lg hover:shadow-pink-500/30"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            ADD YOUR IDEA
          </button>
        </div>
      </section>

      {/* Main Content - Proposals Grid */}
      <section className="flex-1 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {[...Array(6)].map((_, i) => (
                <ProposalCardSkeleton key={i} />
              ))}
            </div>
          ) : proposals.length === 0 ? (
            <EmptyState onAddIdea={() => setIsModalOpen(true)} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {proposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  onVote={handleVote}
                  hasVoted={proposal.hasVoted}
                  isVoting={votingStates[proposal.id]}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Submit Proposal Modal */}
      <SubmitProposalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitProposal}
        isSubmitting={isSubmitting}
      />
    </Layout>
  );
}
