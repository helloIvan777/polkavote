import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useWeb3 } from '../context/Web3Context';
import { fetchAllProposals, checkVoted, truncateAddress } from '../utils/web3';

export default function ProfilePage() {
  const { account, isConnected, connectWallet, isConnecting } = useWeb3();

  const [userStats, setUserStats] = useState({
    proposalsCreated: 0,
    votesCast: 0,
    proposalIds: []
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadUserStats = async (address) => {
    try {
      setIsLoading(true);
      const allProposals = await fetchAllProposals();

      const userProposals = allProposals.filter(p =>
        p.proposer.toLowerCase() === address.toLowerCase()
      );

      let votesCast = 0;
      for (const proposal of allProposals) {
        const hasVoted = await checkVoted(proposal.id, address);
        if (hasVoted) votesCast++;
      }

      setUserStats({
        proposalsCreated: userProposals.length,
        votesCast,
        proposalIds: userProposals.map(p => p.id)
      });
    } catch (err) {
      console.error('Error loading user stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (account) {
      loadUserStats(account);
    }
  }, [account]);

  const getAvatarColor = (address) => {
    if (!address) return 'from-slate-600 to-slate-700';
    const colors = [
      'from-pink-500 to-pink-600',
      'from-purple-500 to-purple-600',
      'from-blue-500 to-blue-600',
      'from-cyan-500 to-cyan-600',
      'from-teal-500 to-teal-600',
      'from-green-500 to-green-600',
      'from-yellow-500 to-yellow-600',
      'from-orange-500 to-orange-600',
      'from-red-500 to-red-600'
    ];
    const index = parseInt(address.slice(2, 4), 16) % colors.length;
    return colors[index];
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-pink-500 mb-2">Profile</h1>
          <p className="text-slate-400">
            View your activity and contributions
          </p>
        </div>

        {!isConnected ? (
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700/50 text-center">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-slate-400 mb-6">
              Connect to view your profile and activity
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
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700/50 animate-pulse">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-slate-700 rounded-full" />
              <div className="flex-1">
                <div className="h-6 bg-slate-700 rounded w-48 mb-2" />
                <div className="h-4 bg-slate-700 rounded w-32" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-700 rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700/50 mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-20 h-20 bg-gradient-to-br ${getAvatarColor(account)} rounded-full flex items-center justify-center`}>
                  <span className="text-white text-2xl font-bold">
                    {account.slice(2, 4).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-1">
                    @{truncateAddress(account, 6, 4)}
                  </h2>
                  <p className="text-slate-400 text-sm font-mono">
                    {account}
                  </p>
                </div>
                <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                  <span className="text-green-400 text-xs font-medium">Connected</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700/50 text-center">
                <div className="text-3xl font-bold text-pink-500 mb-1">
                  {userStats.proposalsCreated}
                </div>
                <div className="text-slate-400 text-sm">Proposals</div>
              </div>
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700/50 text-center">
                <div className="text-3xl font-bold text-pink-500 mb-1">
                  {userStats.votesCast}
                </div>
                <div className="text-slate-400 text-sm">Votes Cast</div>
              </div>
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700/50 text-center">
                <div className="text-3xl font-bold text-pink-500 mb-1">
                  {userStats.proposalsCreated + userStats.votesCast}
                </div>
                <div className="text-slate-400 text-sm">Total Activity</div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="/"
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-700/50 rounded-xl text-white
                    hover:bg-slate-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Browse Ideas
                </a>
                <a
                  href="/submit"
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl text-white
                    hover:from-pink-600 hover:to-pink-700 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Proposal
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
