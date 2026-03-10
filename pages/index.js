'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import ProposalCard from '../components/ProposalCard';
import ProposalDetailModal from '../components/ProposalDetailModal';
import SubmitProposalModal from '../components/SubmitProposalModal';
import { useWeb3 } from '../context/Web3Context';
import {
  fetchAllProposals,
  voteOnProposal,
  checkVoted,
  formatVoteCount,
  CONTRACT_ADDRESS
} from '../utils/web3';

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
const PROPOSALS_PER_PAGE = 9;

export default function HomePage() {
  const { account, isConnected, connectWallet, getSigner } = useWeb3();

  const [proposals, setProposals] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [votingStates, setVotingStates] = useState({});
  const [stats, setStats] = useState({ proposalCount: 0, totalVotes: 0 });
  const [error, setError] = useState(null);

  const proposalsSectionRef = React.useRef(null);

  // Derive filtered list — no extra fetch needed
  const FILTER_TABS = ['All', 'Tech', 'Marketing', 'Ecosystem', 'Community'];
  const ACTIVE_TAB_STYLES = {
    All:       'bg-pink-500 text-white shadow-lg shadow-pink-500/25',
    Tech:      'bg-blue-500 text-white shadow-lg shadow-blue-500/25',
    Marketing: 'bg-pink-500 text-white shadow-lg shadow-pink-500/25',
    Ecosystem: 'bg-green-500 text-white shadow-lg shadow-green-500/25',
    Community: 'bg-purple-500 text-white shadow-lg shadow-purple-500/25',
  };
  const filteredProposals = activeCategory === 'All'
    ? proposals
    : proposals.filter(p => p.category === activeCategory);

  // Pagination slicing
  const totalPages = Math.max(1, Math.ceil(filteredProposals.length / PROPOSALS_PER_PAGE));
  const indexOfLastItem = currentPage * PROPOSALS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - PROPOSALS_PER_PAGE;
  const currentProposals = filteredProposals.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    proposalsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCategoryChange = (tab) => {
    setActiveCategory(tab);
    setCurrentPage(1);
  };

  // Track latest account in a ref (for loadProposals)
  const accountRef = React.useRef(account);
  useEffect(() => { accountRef.current = account; });

  // Stores a proposalId to vote on automatically once the wallet connects.
  // Using a ref avoids stale-closure issues inside the account effect.
  const pendingVoteRef = React.useRef(null);

  // Derive selectedProposal from live proposals array so vote counts
  // and hasVoted flags stay current inside the modal after any refresh.
  const currentSelectedProposal = selectedProposal
    ? proposals.find(p => p.id === selectedProposal.id) || selectedProposal
    : null;

  // ── Proposal loader ──────────────────────────────────────────────────────
  // Stable (empty deps) — runs on mount AND whenever explicitly called
  // (e.g., after a vote). Reads accountRef so it can apply hasVoted in
  // the same pass even on navigation when account hasn't changed.
  const loadProposals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const proposalsData = await fetchAllProposals();

      // If a wallet is already connected, fetch vote status in the same pass
      // so hasVoted is correct immediately — no second render needed.
      const currentAccount = accountRef.current;
      let finalProposals = proposalsData;
      if (currentAccount && proposalsData.length > 0) {
        try {
          finalProposals = await Promise.all(
            proposalsData.map(async (p) => {
              const hv = await checkVoted(p.id, currentAccount);
              return { ...p, hasVoted: hv };
            })
          );
        } catch (voteErr) {
          console.warn('[HomePage] hasVoted check failed (non-fatal):', voteErr.message);
        }
      }

      const totalVotes = finalProposals.reduce((sum, p) => sum + p.voteCount, 0);
      setStats({ proposalCount: finalProposals.length, totalVotes });
      setProposals(finalProposals);
    } catch (err) {
      console.error('[HomePage] loadProposals error:', err);
      setError(err.message || 'Failed to load proposals. Check the contract address and network.');
    } finally {
      setIsLoading(false);
    }
  }, []); // stable — reads account via ref

  // Fetch proposals immediately on mount
  useEffect(() => {
    loadProposals();
  }, [loadProposals]);

  // ── Vote-status updater ──────────────────────────────────────────────────
  // Runs when the wallet first connects or switches accounts.
  // `loadProposals` already handles the case where account is present on
  // mount/navigation, so this only needs to handle the "connected while
  // proposals were already showing" transition.
  useEffect(() => {
    if (!account || proposals.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const updated = await Promise.all(
          proposals.map(async (p) => {
            const hv = await checkVoted(p.id, account);
            return { ...p, hasVoted: hv };
          })
        );
        if (!cancelled) setProposals(updated);
      } catch (err) {
        console.warn('[HomePage] vote-status update failed (non-fatal):', err.message);
      }
    })();

    return () => { cancelled = true; };
  }, [account]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-vote after wallet connects ──────────────────────────────────────
  // If the user clicked Vote while disconnected we queued the proposalId in
  // pendingVoteRef. As soon as account is set, fire the vote automatically.
  useEffect(() => {
    if (!account || pendingVoteRef.current === null) return;
    const id = pendingVoteRef.current;
    pendingVoteRef.current = null;
    handleVote(id);
  }, [account]); // eslint-disable-line react-hooks/exhaustive-deps


  // Handle vote
  const handleVote = async (proposalId) => {
    if (!isConnected) {
      // Save the intent and open the wallet selector.
      // The account effect below will fire the vote once connected.
      pendingVoteRef.current = proposalId;
      connectWallet();
      return;
    }

    try {
      setVotingStates(prev => ({ ...prev, [proposalId]: true }));

      const signer = await getSigner();
      if (!signer) throw new Error('No signer available');

      const result = await voteOnProposal(proposalId, signer);

      if (result.success) {
        // Optimistic UI update — increment immediately regardless of pending state
        setProposals(prev => prev.map(p =>
          p.id === proposalId
            ? { ...p, voteCount: p.voteCount + 1, hasVoted: true }
            : p
        ));
        setStats(prev => ({ ...prev, totalVotes: prev.totalVotes + 1 }));

        if (result.pending) {
          // RPC timed out but tx was sent — auto-refresh after block time
          console.log('[HomePage] Vote pending, scheduling refresh in 5s. TX:', result.txHash);
          setTimeout(() => {
            console.log('[HomePage] Auto-refreshing proposals after vote...');
            loadProposals();
          }, 5000);
        }
      }
    } catch (err) {
      console.error('[HomePage] Vote error:', err);
      // NOTE: Do NOT re-throw here. ProposalCard calls onVote() as
      // fire-and-forget (no await/catch), so any throw becomes an
      // unhandled promise rejection and crashes the app with a red overlay.
      // The ProposalDetailModal wraps onVote() in its own try/catch and
      // handles all user-facing error display via its inline toast.
      if (err.message?.includes('rejected')) {
        console.log('[HomePage] User rejected vote transaction');
      } else if (
        err.message?.toLowerCase().includes('already voted') ||
        err.message?.toLowerCase().includes('execution reverted')
      ) {
        // Expected contract revert — non-fatal, modal handles UI feedback.
        console.warn('[HomePage] Vote reverted (already voted or deadline):', err.message);
      } else {
        // Unexpected error — log it but keep the app stable.
        console.warn('[HomePage] Unexpected vote error (non-fatal):', err.message);
      }
    } finally {
      setVotingStates(prev => ({ ...prev, [proposalId]: false }));
    }
  };

  // Called by SubmitProposalModal after it has already sent the tx.
  // The modal owns the full addProposal lifecycle — we just refresh the list.
  const handleSubmitProposal = async (txResult) => {
    console.log('[HomePage] Proposal submitted, refreshing list. TX:', txResult?.txHash);

    if (txResult?.pending) {
      // RPC slow — tx is in-flight; refresh after one block (~6 s on Moonbase)
      setTimeout(() => loadProposals(), 6000);
    } else {
      await loadProposals();
    }
  };

  return (
    <Layout>
      {/* Header Section */}
      <section ref={proposalsSectionRef} className="px-4 py-6 lg:py-8 border-b border-slate-700/50">
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

            {/* Right Side - Add Idea Button (Desktop) */}
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

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => handleCategoryChange(tab)}
                className={`
                  px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                  ${activeCategory === tab
                    ? ACTIVE_TAB_STYLES[tab]
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:border-slate-500'
                  }
                `}
              >
                {tab}
                {tab !== 'All' && (
                  <span className="ml-1.5 text-xs opacity-75">
                    ({proposals.filter(p => p.category === tab).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {[...Array(6)].map((_, i) => (
                <ProposalCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProposals.length === 0 ? (
            activeCategory === 'All' ? (
              <EmptyState onAddIdea={() => setIsModalOpen(true)} />
            ) : (
              <div className="text-center py-16">
                <p className="text-slate-400 text-lg">
                  No <span className="text-white font-semibold">{activeCategory}</span> proposals yet.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-medium
                    hover:from-pink-600 hover:to-pink-700 transition-all duration-200"
                >
                  Submit the first {activeCategory} idea
                </button>
              </div>
            )
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {currentProposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    onVote={handleVote}
                    onCardClick={setSelectedProposal}
                    hasVoted={proposal.hasVoted}
                    isVoting={votingStates[proposal.id]}
                  />
                ))}
              </div>

              {/* Pagination Bar */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {/* Previous */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                      bg-slate-800/60 border border-slate-700/60 text-slate-300
                      hover:border-pink-500/50 hover:text-white
                      disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-slate-700/60 disabled:hover:text-slate-300
                      backdrop-blur-sm"
                  >
                    ← Prev
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200
                        ${
                          page === currentPage
                            ? 'bg-[#E6007A] text-white shadow-lg shadow-pink-500/30 scale-105'
                            : 'bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:border-pink-500/50 hover:text-white backdrop-blur-sm'
                        }
                      `}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Next */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                      bg-slate-800/60 border border-slate-700/60 text-slate-300
                      hover:border-pink-500/50 hover:text-white
                      disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-slate-700/60 disabled:hover:text-slate-300
                      backdrop-blur-sm"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Submit Proposal Modal */}
      <SubmitProposalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSubmitProposal}
      />

      {/* Proposal Detail Modal */}
      {currentSelectedProposal && (
        <ProposalDetailModal
          proposal={currentSelectedProposal}
          onClose={() => setSelectedProposal(null)}
          onVote={(id) => handleVote(id)}
          hasVoted={currentSelectedProposal.hasVoted}
          isVoting={votingStates[currentSelectedProposal.id]}
        />
      )}
    </Layout>
  );
}
