'use client';

import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ProposalCard from '../components/ProposalCard';
import { useWeb3 } from '../context/Web3Context';
import { fetchAllProjects, getContribution, formatDEV } from '../utils/web3';

/**
 * My Contributions Page
 */
export default function ContributionsPage() {
  const { account, isConnected, connectWallet, isConnecting } = useWeb3();

  const [contributedProjects, setContributedProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [contributionStates, setContributionStates] = useState({});

  const loadContributedProjects = async (address) => {
    try {
      setIsLoading(true);
      const allProjects = await fetchAllProjects();

      // Fetch contributions for all projects in parallel
      const contributions = await Promise.all(
        allProjects.map(async (project) => {
          const amount = await getContribution(project.id, address);
          return { ...project, userContribution: amount };
        })
      );

      // Filter to only projects where user contributed > 0
      const contributed = contributions.filter(p => p.userContribution > 0);
      setContributedProjects(contributed);

      // Store contribution amounts for display
      const states = {};
      contributed.forEach(p => {
        states[p.id] = p.userContribution;
      });
      setContributionStates(states);
    } catch (err) {
      console.error('Error loading contributed projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (account) {
      loadContributedProjects(account);
    }
  }, [account]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-pink-500 mb-2">My Contributions</h1>
          <p className="text-slate-400">
            Track all the projects you've backed
          </p>
        </div>

        {!isConnected ? (
          /* Connect Wallet State */
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700/50 text-center">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-slate-400 mb-6">
              Connect to see your contribution history
            </p>
            <button
              onClick={connectWallet}
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
        ) : contributedProjects.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Contributions Yet</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              You haven't backed any projects yet. Browse the home page to find ideas to support!
            </p>
          </div>
        ) : (
          /* Contributed Projects Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {contributedProjects.map((project) => (
              <div key={project.id} className="relative">
                <ProposalCard
                  proposal={project}
                />
                {/* Contribution badge */}
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-pink-500/20 border border-pink-500/30 rounded-full backdrop-blur-sm">
                  <span className="text-xs font-semibold text-pink-300">
                    You backed: {formatDEV(project.userContribution)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
