import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import ConnectState, { ProfileIcon } from '../components/ConnectState';
import { useWeb3 } from '../context/Web3Context';
import { fetchAllProjects, getContribution, truncateAddress } from '../utils/web3';

export default function ProfilePage() {
  const { account, isConnected, connectWallet, isConnecting } = useWeb3();

  const [userStats, setUserStats] = useState({
    proposalsCreated: 0,
    projectsBacked: 0,
    proposalIds: []
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadUserStats = async (address) => {
    try {
      setIsLoading(true);
      const allProjects = await fetchAllProjects();

      // Count projects created by user
      const userProposals = allProjects.filter(p =>
        p.creator.toLowerCase() === address.toLowerCase()
      );

      // Count projects the user has backed (contributed to)
      let projectsBacked = 0;
      for (const project of allProjects) {
        const contribution = await getContribution(project.id, address);
        if (contribution > 0) projectsBacked++;
      }

      setUserStats({
        proposalsCreated: userProposals.length,
        projectsBacked,
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
        {/* Header - Centered Standardized */}
        <div className="pt-10 mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-[#e6007a] mb-4">
            Profile
          </h1>
          <p className="text-lg text-gray-400 mb-12">
            View your activity and contributions on PolkaFund
          </p>
        </div>

        {!isConnected ? (
          <ConnectState
            title="Connect Your Wallet"
            description="Connect to view your profile and activity"
            icon={<ProfileIcon />}
            isConnecting={isConnecting}
          />
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
                  {userStats.projectsBacked}
                </div>
                <div className="text-slate-400 text-sm">Projects Backed</div>
              </div>
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700/50 text-center">
                <div className="text-3xl font-bold text-pink-500 mb-1">
                  {userStats.proposalsCreated + userStats.projectsBacked}
                </div>
                <div className="text-slate-400 text-sm">Total Activity</div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-700/50 rounded-xl text-white
                    hover:bg-slate-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Browse Ideas
                </Link>
                <Link
                  href="/submit"
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl text-white
                    hover:from-pink-600 hover:to-pink-700 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Proposal
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
