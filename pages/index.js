'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import ProposalCard from '../components/ProposalCard';
import ProposalDetailModal from '../components/ProposalDetailModal';
import SubmitProposalModal from '../components/SubmitProposalModal';
import { useWeb3 } from '../context/Web3Context';
import {
  fetchAllProjects,
  contributeToProject,
  withdrawFunds,
  claimRefund,
  formatDEV,
  CONTRACT_ADDRESS,
} from '../utils/web3';

/**
 * Stats Display Component
 */
function StatsDisplay({ projectCount, totalRaised }) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-pink-400 font-bold">{projectCount}</span>
        <span className="text-slate-400">projects</span>
      </div>
      <div className="w-px h-4 bg-slate-700" />
      <div className="flex items-center gap-2">
        <span className="text-pink-400 font-bold">{formatDEV(totalRaised)}</span>
        <span className="text-slate-400">raised</span>
      </div>
    </div>
  );
}

/**
 * Loading Skeleton for Project Cards
 */
function ProjectCardSkeleton() {
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
      <div className="h-2 bg-slate-700 rounded w-full mb-1" />
      <div className="h-3 bg-slate-700 rounded w-1/3 mb-4 ml-auto" />
      <div className="h-10 bg-slate-700 rounded-xl" />
    </div>
  );
}

/**
 * Empty State Component
 */
function EmptyState({ onAddProject, hasWallet }) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">No Projects Yet</h3>
      <p className="text-slate-400 mb-6 max-w-md mx-auto">
        {hasWallet
          ? "Be the first to launch a crowdfunding project on Polkadot!"
          : "Connect your wallet to launch a crowdfunding project on Polkadot!"
        }
      </p>
      <button
        onClick={onAddProject}
        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-medium
          hover:from-pink-600 hover:to-pink-700 transition-all duration-200
          hover:shadow-lg hover:shadow-pink-500/30"
      >
        {hasWallet ? 'Launch a Project' : 'Connect Wallet to Launch'}
      </button>
    </div>
  );
}

const PROJECTS_PER_PAGE = 9;

export default function HomePage() {
  const { account, isConnected, connectWallet, getSigner, openWalletModal, closeWalletModal, showWalletModal } = useWeb3();

  const [projects, setProjects]       = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actingStates, setActingStates] = useState({}); // projectId => bool
  const [stats, setStats]             = useState({ projectCount: 0, totalRaised: 0 });
  const [error, setError]             = useState(null);
  const [isPendingLaunch, setIsPendingLaunch] = useState(false); // Pending launch intent

  const projectsSectionRef = React.useRef(null);

  const FILTER_TABS = ['All', 'Tech', 'Marketing', 'Ecosystem', 'Community'];
  const ACTIVE_TAB_STYLES = {
    All:       'bg-pink-500 text-white shadow-lg shadow-pink-500/25',
    Tech:      'bg-blue-500 text-white shadow-lg shadow-blue-500/25',
    Marketing: 'bg-pink-500 text-white shadow-lg shadow-pink-500/25',
    Ecosystem: 'bg-green-500 text-white shadow-lg shadow-green-500/25',
    Community: 'bg-purple-500 text-white shadow-lg shadow-purple-500/25',
  };

  // ── The Guard: Wallet Connection Check with Auto-Launch ──────────────────
  const handleLaunchClick = () => {
    if (account) {
      // Wallet connected - open the SubmitProposalModal immediately
      console.log('[HomePage] Wallet connected, opening launch modal');
      setIsModalOpen(true);
    } else {
      // Wallet NOT connected - set pending intent and OPEN WALLET SELECTOR
      console.log('[HomePage] Wallet not connected, setting pending launch and opening wallet selector...');
      setIsPendingLaunch(true);
      openWalletModal(); // Opens the Wallet Selector Modal instead of direct connect
    }
  };

  // ── Cleanup: Reset pending launch if wallet modal is closed without connecting ──────────────────
  useEffect(() => {
    // If wallet modal was closed AND we had a pending launch BUT no account yet
    if (!showWalletModal && isPendingLaunch && !account) {
      console.log('[HomePage] Wallet selector closed without connecting - clearing pending launch');
      setIsPendingLaunch(false);
    }
  }, [showWalletModal, isPendingLaunch, account]);

  // ── Auto-Launch Hook: Opens SubmitProposalModal after wallet connects ──────────────────
  useEffect(() => {
    let launchTimeout;

    // If the wallet just connected AND we have a pending launch intent
    if (account && isPendingLaunch) {
      console.log('[HomePage] Wallet connected with pending launch - opening modal after delay...');

      // Delay modal opening to give user time to refocus after wallet popup closes
      launchTimeout = setTimeout(() => {
        setIsModalOpen(true);      // 1. Open the SubmitProposalModal
        setIsPendingLaunch(false); // 2. Clear the intent flag
        console.log('[HomePage] Opening modal now!');
      }, 700); // 700ms delay for smooth transition
    }

    // Cleanup timeout on unmount or dependency change
    return () => {
      if (launchTimeout) clearTimeout(launchTimeout);
    };
  }, [account, isPendingLaunch]);

  const filteredProjects = activeCategory === 'All'
    ? projects
    : projects.filter((p) => p.category === activeCategory);

  const totalPages      = Math.max(1, Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE));
  const indexOfLastItem = currentPage * PROJECTS_PER_PAGE;
  const currentProjects = filteredProjects.slice(indexOfLastItem - PROJECTS_PER_PAGE, indexOfLastItem);

  // Derive selected project from live projects array so amounts stay current
  const currentSelectedProject = selectedProject
    ? projects.find((p) => p.id === selectedProject.id) || selectedProject
    : null;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    projectsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCategoryChange = (tab) => {
    setActiveCategory(tab);
    setCurrentPage(1);
  };

  // ── Load projects ──────────────────────────────────────────────────────────
  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchAllProjects();
      const totalRaised = data.reduce((sum, p) => sum + p.raisedAmount, 0);
      setStats({ projectCount: data.length, totalRaised });
      setProjects(data);
    } catch (err) {
      console.error('[HomePage] loadProjects error:', err);
      setError(err.message || 'Failed to load projects. Check the contract address and network.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  // ── Contribute ────────────────────────────────────────────────────────────
  const handleContribute = async (projectId, amountDev) => {
    if (!isConnected) { connectWallet(); return; }

    try {
      setActingStates((prev) => ({ ...prev, [projectId]: true }));

      const signer = await getSigner();
      if (!signer) throw new Error('No signer available');

      const result = await contributeToProject(projectId, amountDev, signer);

      if (result.success) {
        // Optimistic UI: bump raisedAmount immediately
        const amtFloat = parseFloat(amountDev);
        setProjects((prev) => prev.map((p) =>
          p.id === projectId
            ? { ...p, raisedAmount: p.raisedAmount + amtFloat }
            : p
        ));
        setStats((prev) => ({ ...prev, totalRaised: prev.totalRaised + amtFloat }));

        if (result.pending) {
          setTimeout(() => loadProjects(), 6000);
        }
      }

      // Return result for modal to access txHash
      return result;
    } catch (err) {
      console.error('[HomePage] contribute error:', err);
      // Surface to ProposalDetailModal via re-throw so its toast shows it
      throw err;
    } finally {
      setActingStates((prev) => ({ ...prev, [projectId]: false }));
    }
  };

  // ── Withdraw funds ────────────────────────────────────────────────────────
  const handleWithdraw = async (projectId) => {
    if (!isConnected) { connectWallet(); return; }

    try {
      setActingStates((prev) => ({ ...prev, [projectId]: true }));

      const signer = await getSigner();
      if (!signer) throw new Error('No signer available');

      await withdrawFunds(projectId, signer);

      // Mark as withdrawn in local state
      setProjects((prev) => prev.map((p) =>
        p.id === projectId ? { ...p, withdrawn: true } : p
      ));

      setTimeout(() => loadProjects(), 6000);
    } catch (err) {
      console.error('[HomePage] withdraw error:', err);
      throw err;
    } finally {
      setActingStates((prev) => ({ ...prev, [projectId]: false }));
    }
  };

  // ── Claim refund ──────────────────────────────────────────────────────────
  const handleRefund = async (projectId) => {
    if (!isConnected) { connectWallet(); return; }

    try {
      setActingStates((prev) => ({ ...prev, [projectId]: true }));

      const signer = await getSigner();
      if (!signer) throw new Error('No signer available');

      await claimRefund(projectId, signer);
      // Refresh to reflect the zeroed-out contribution mapping
      setTimeout(() => loadProjects(), 6000);
    } catch (err) {
      console.error('[HomePage] refund error:', err);
      throw err;
    } finally {
      setActingStates((prev) => ({ ...prev, [projectId]: false }));
    }
  };

  // ── After project submitted ───────────────────────────────────────────────
  const handleSubmitProject = async (txResult) => {
    console.log('[HomePage] Project launched, refreshing list. TX:', txResult?.txHash);
    if (txResult?.pending) {
      setTimeout(() => loadProjects(), 6000);
    } else {
      await loadProjects();
    }
  };

  return (
    <Layout>
      {/* Header Section */}
      <section ref={projectsSectionRef} className="px-4 py-6 lg:py-8 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left: Title & Stats */}
            <div className="space-y-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-pink-500">
                Fund the Future of Polkadot
              </h1>
              <StatsDisplay
                projectCount={stats.projectCount}
                totalRaised={stats.totalRaised}
              />
            </div>

            {/* Right: Launch Button (Desktop) */}
            <button
              onClick={handleLaunchClick}
              disabled={isPendingLaunch}
              className={`hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600
                text-white rounded-xl font-medium text-sm
                transition-all duration-200
                hover:from-pink-600 hover:to-pink-700 hover:shadow-lg hover:shadow-pink-500/30
                ${isPendingLaunch ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isPendingLaunch ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  LAUNCH PROJECT
                </>
              )}
            </button>
          </div>

          {/* Mobile Launch Button */}
          <button
            onClick={handleLaunchClick}
            disabled={isPendingLaunch}
            className={`sm:hidden mt-4 w-full flex items-center justify-center gap-2 px-4 py-3
              bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-medium
              transition-all duration-200
              hover:from-pink-600 hover:to-pink-700 hover:shadow-lg hover:shadow-pink-500/30
              ${isPendingLaunch ? 'opacity-70 cursor-wait' : ''}`}
          >
            {isPendingLaunch ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                LAUNCH PROJECT
              </>
            )}
          </button>
        </div>
      </section>

      {/* Projects Grid */}
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
                    ({projects.filter((p) => p.category === tab).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {[...Array(6)].map((_, i) => <ProjectCardSkeleton key={i} />)}
            </div>
          ) : filteredProjects.length === 0 ? (
            activeCategory === 'All' ? (
              <EmptyState onAddProject={handleLaunchClick} hasWallet={!!account} />
            ) : (
              <div className="text-center py-16">
                <p className="text-slate-400 text-lg">
                  No <span className="text-white font-semibold">{activeCategory}</span> projects yet.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-medium
                    hover:from-pink-600 hover:to-pink-700 transition-all duration-200"
                >
                  Launch the first {activeCategory} project
                </button>
              </div>
            )
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {currentProjects.map((project) => (
                  <ProposalCard
                    key={project.id}
                    proposal={project}
                    onContribute={(id) => {
                      setSelectedProject(project);
                    }}
                    onCardClick={setSelectedProject}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                      bg-slate-800/60 border border-slate-700/60 text-slate-300
                      hover:border-pink-500/50 hover:text-white
                      disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm"
                  >
                    ← Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200
                        ${page === currentPage
                          ? 'bg-[#E6007A] text-white shadow-lg shadow-pink-500/30 scale-105'
                          : 'bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:border-pink-500/50 hover:text-white backdrop-blur-sm'
                        }
                      `}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                      bg-slate-800/60 border border-slate-700/60 text-slate-300
                      hover:border-pink-500/50 hover:text-white
                      disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Launch Project Modal */}
      <SubmitProposalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSubmitProject}
      />

      {/* Project Detail Modal */}
      {currentSelectedProject && (
        <ProposalDetailModal
          proposal={currentSelectedProject}
          onClose={() => setSelectedProject(null)}
          onContribute={handleContribute}
          onWithdraw={handleWithdraw}
          onRefund={handleRefund}
          isActing={!!actingStates[currentSelectedProject.id]}
        />
      )}
    </Layout>
  );
}
